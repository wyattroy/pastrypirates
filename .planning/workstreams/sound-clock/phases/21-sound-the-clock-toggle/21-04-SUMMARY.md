---
phase: 21-sound-the-clock-toggle
plan: 04
subsystem: ui
tags: [audio, mute, clock-panel, vanilla-js, copy-inventory]

# Dependency graph
requires: ["21-03"]
provides:
  - "#btnMute — new DOM element id in index.html, a #controlsRow sibling to the right of #shotClockPanel"
  - "src/orchestrator.js toggleMute() — exported, calls setMuted(!isMuted()) then setClockUI(), bound once in wireLobby()"
  - "src/ui/panel.js setClockUI() — the #btnMute render block (display/innerHTML/title only, before the appState.liveDone early return)"
  - "Luis Zanforlin's sound-effects credit clause in #creditsModal (one entry, one link)"
  - "A dated phase-21 entry in .planning/todos/pending/copy-shipped-vs-approved-gate.md recording all three new player-facing strings"
affects: [21-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Bind-once-in-wireLobby(), render-only-in-setClockUI() — the #scPause/#scTimerToggle click-binding discipline, extended to #btnMute so the 500ms re-render tick can never double-bind or leak a handler (CLOCK-03)"
    - "Bare emoji pre-render fallback (🔊) for a control whose real icon is a future art dependency — mirrors #scTimerToggle's ⏱️ literal, avoids a broken image and avoids borrowing an icon that already carries a different meaning (D-14)"
    - "Mute state is a pure client-side leaf (src/shared/audio.js isMuted()/setMuted()) with zero net*/appState/Firebase surface — same tier-layering discipline as pp_timerOff, verified by a literal zero-hit grep rather than by inspection alone"

key-files:
  created: []
  modified:
    - index.html
    - src/orchestrator.js
    - src/ui/panel.js
    - .planning/todos/pending/copy-shipped-vs-approved-gate.md
    - art-review/narration-inventory.json

key-decisions:
  - "#btnMute placed as a standalone #controlsRow sibling after #shotClockPanel, not a third icon on the clock face — both corner slots on the clock panel are already taken by #scPause/#scTimerToggle, and 21-03 made the timer toggle visible in solo for the first time, so a third corner icon would newly crowd an already-cramped panel"
  - "The mute icon ships as bare 🔊/🔇 emoji, not an image — D-14's real speaker icon + blocked-slash overlay is Wave 5's job requiring Wyatt's art pipeline (cannot run overnight); shipping the emoji scaffold now means the button's behaviour is complete and testable with no broken image"
  - "No @copy marker added on the two mute tooltips — the @copy id space is bound to art-review/'s node-group table via scripts/narration_audit_check.js, and a new misc.sound.* category would need registering there (out of scope, would redden npm test). Recorded instead as a dated entry in the copy-shipped-vs-approved-gate.md inventory file, with the marker-wiring named explicitly as a deferred follow-up, not an oversight"
  - "Luis's sound-effects credit is one added clause on his existing #creditsModal sentence, not a second entry or a second link — AUDIO-03 adds sound to his existing mechanics credit"

requirements-completed: [AUDIO-02, AUDIO-03]

coverage:
  - id: D1
    description: "#btnMute exists inside #controlsRow, to the right of #shotClockPanel, with CSS matching the panel's proportions and a narrow-viewport treatment"
    requirement: "AUDIO-02"
    verification:
      - kind: unit
        ref: "node -e one-liner confirming #btnMute is inside #controlsRow and appears after #shotClockPanel in document order (Task 1 <verify>)"
        status: pass
    human_judgment: false
  - id: D2
    description: "toggleMute() is exported from src/orchestrator.js and bound exactly once in wireLobby(), on the same line pair as #scPause/#scTimerToggle"
    requirement: "AUDIO-02"
    verification:
      - kind: unit
        ref: "node -e one-liner confirming export function toggleMute( and $(\"btnMute\").onclick both present in src/orchestrator.js (Task 1 <verify>)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Mute state never reaches Firebase or appState — grep -c 'pp_muted' returns 0 in both src/orchestrator.js and src/net/writers.js; the only store is src/shared/audio.js's own localStorage key"
    requirement: "AUDIO-02"
    verification:
      - kind: unit
        ref: "grep -c 'pp_muted' src/orchestrator.js src/net/writers.js — both 0"
        status: pass
    human_judgment: false
  - id: D4
    description: "setClockUI() renders #btnMute's display/innerHTML/title every tick, positioned before the appState.liveDone early return (so D-16 — the button disappearing with the clock panel at end of voyage, with mute state still holding — falls out for free), and never assigns onclick there"
    requirement: "AUDIO-02"
    verification:
      - kind: unit
        ref: "node -e one-liner: btnMute index < appState.liveDone index in setClockUI()'s body, and no onclick assignment within 400 chars of any btnMute occurrence (Task 2 <verify>)"
        status: pass
    human_judgment: false
  - id: D5
    description: "The mute button is visible beside the clock in solo, pass-and-play and multiplayer, clicking it silences the game and flips the icon, a mid-game reload comes back still muted, and at a narrow viewport the pause/timer-toggle/mute controls neither overlap nor clip"
    requirement: "AUDIO-02"
    verification: []
    human_judgment: true
    rationale: "Requires a live browser session in Chrome and Safari across three modes, a reload cycle, and a two-window multiplayer session to observe mute-does-not-cross-browsers — none of which is machine-checkable. This was an overnight autonomous run; not attempted, not claimed as passing."
  - id: D6
    description: "Luis Zanforlin is credited for the sound effects in #creditsModal — exactly one entry, one link (extending his existing mechanics-credit sentence, not a duplicate)"
    requirement: "AUDIO-03"
    verification:
      - kind: unit
        ref: "node -e one-liner: exactly 1 luiszanforlin.com link in #creditsModal, and the modal text matches /sound effect/i (Task 3 <verify>)"
        status: pass
    human_judgment: false
  - id: D7
    description: "All three new player-facing strings (two mute tooltips + the sound-credit clause) are recorded in .planning/todos/pending/copy-shipped-vs-approved-gate.md under a dated phase-21 entry, along with the reason the two tooltips carry no @copy marker"
    requirement: "milestone constraint 3"
    verification:
      - kind: unit
        ref: "node -e one-liner: all three strings present verbatim in the gate file, entry names phase 21 (Task 3 <verify>)"
        status: pass
    human_judgment: false
  - id: D8
    description: "src/engine/index.js is byte-identical before and after this plan — the v1.3 determinism fence held"
    verification:
      - kind: unit
        ref: "git diff --stat -- src/engine/index.js — empty at every commit checkpoint"
        status: pass
    human_judgment: false

# Metrics
duration: ~20min
completed: 2026-08-01
status: complete
---

# Phase 21 Plan 04: The Mute Button, and Luis's Sound Credit Summary

**A mute button now sits beside the turn clock in every mode for the whole game — bound once in `wireLobby()`, rendered every 500ms tick without ever touching `onclick`, backed by nothing but `src/shared/audio.js`'s own localStorage state — and Luis Zanforlin picks up a sound-effects credit on the same sentence that already names him for mechanics.**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-08-01 (overnight autonomous run)
- **Completed:** 2026-08-01
- **Tasks:** 3/3 completed
- **Files modified:** 5 (4 code/doc files per plan scope + 1 generated artifact regenerated by the test suite's line-number bookkeeping)

## Accomplishments

- **`#btnMute` in `index.html`** — a `#controlsRow` sibling placed immediately after `#shotClockPanel` and before `#btnPlayAgain`, `type="button"` with `style="display:none"` (so nothing flashes before the first `setClockUI()` tick, matching how `#scPause`/`#scTimerToggle` are declared) and a literal 🔊 as its pre-render fallback, matching `#scTimerToggle`'s ⏱️ idiom. Its CSS is modelled on `#btnPlayAgain`'s footprint (`flex: 0 0 auto`, same `border-radius`/`padding` clamp() shape) but deliberately narrow — no `min-width` clamp — so it reads as a control beside the clock, not a second panel. Added to the existing `max-width: 480px` narrow-viewport `@media` block that already resizes `#scPause`/`#scTimerToggle`, since 21-03's D-20 change means that row now carries one more visible control at narrow widths than it ever has.
- **`toggleMute()` in `src/orchestrator.js`** — new export, calls `setMuted(!isMuted())` (both already exported from `src/shared/audio.js`, wired up in 21-01) then `setClockUI()` directly so the icon/tooltip refresh immediately rather than waiting on the next 500ms tick. Bound exactly once, in `wireLobby()`, on the same line pair as `#scPause`'s `togglePause` and `#scTimerToggle`'s `toggleTimer`. Mute is pure client-side state — no Firebase write, no `net*` writer, no `appState` field; the whole store is `src/shared/audio.js`'s own localStorage key, confirmed by a literal zero-hit `grep -c 'pp_muted'` across `src/orchestrator.js` and `src/net/writers.js`.
- **The `#btnMute` render block in `src/ui/panel.js`'s `setClockUI()`** — placed directly after the `const wrap=$("shotClockPanel");if(!wrap)return;` guard and before the `appState.liveDone` early-return block. Sets exactly three things, guarded by a null check on the element: `style.display` (`"none"` when `appState.liveDone`, `""` otherwise — visible in every mode for the whole game, D-15), `innerHTML` (🔇 when `isMuted()`, 🔊 otherwise), `title` (the tooltip copy below). Positioning it above the `liveDone` early return is what makes D-16 fall out for free — the same tick that hides `#shotClockPanel` at the win screen also hides `#btnMute`, with no second code path; the mute setting itself still holds through the celebration because it lives in `src/shared/audio.js`'s own state, not in the button. The block never touches `onclick`, following the proven `#scPause`/`#scTimerToggle` shape rather than the `numEl.onclick=null` per-tick reset pattern (that pattern exists for a conditionally-re-armed handler, which this is not).
- **Luis Zanforlin's sound-effects credit** — one clause added to his existing `#creditsModal` sentence: "...imagining mechanics for it in his head, **and who later wrote every sound effect ye hear**, my father Robin and mother Cathy...". Same anchor, same `target="_blank" rel="noopener"`, no second entry, no second link.
- **The copy-inventory entry** — a dated "Phase 21 addition — 2026-08-01" section appended to `.planning/todos/pending/copy-shipped-vs-approved-gate.md`, recording all three new strings (both mute tooltips + the credit clause), each marked "not yet reviewed," plus an explicit note that the two tooltips carry no `@copy` marker because a new `misc.sound.*` category would need registering in `art-review/`'s node-group table first — filed as a named follow-up, not a silent gap.

## Task Commits

Each task was committed atomically:

1. **Task 1: The #btnMute element, its CSS, and its click binding** - `242ff11` (feat)
2. **Task 2: Render the mute button state in setClockUI()** - `5cbe0b3` (feat)
3. **Task 3: Luis's sound credit, and the copy inventory entry** - `d81be3a` (docs)

## Files Created/Modified

- `index.html` — `#btnMute` element in `#controlsRow`, its CSS (base + narrow-viewport `@media` rule), and the extended Luis Zanforlin credit clause in `#creditsModal`
- `src/orchestrator.js` — `toggleMute()` added (imports `isMuted`/`setMuted` from `./shared/audio.js`), bound once in `wireLobby()` beside `#scPause`/`#scTimerToggle`
- `src/ui/panel.js` — `setClockUI()` gains the `#btnMute` render block (imports `isMuted` from `../shared/audio.js`); no `onclick` touched
- `.planning/todos/pending/copy-shipped-vs-approved-gate.md` — dated phase-21 entry recording the three new strings and the deferred `@copy` marker follow-up
- `art-review/narration-inventory.json` — regenerated by `scripts/extract_narration_lines.js` (part of `npm test`'s chain) after Task 1 and Task 2, which shifted `src/orchestrator.js`'s line numbers; confirmed via `git diff ... | grep -v '"line":'` producing no content lines each time

## Decisions Made

- `#btnMute` is a standalone `#controlsRow` sibling, not a third icon on `#shotClockPanel`'s face — matches the plan's stated assumption exactly (AUDIO-02's own wording, both corner slots already taken, 21-03's D-20 change newly crowding the panel, and `#btnPlayAgain`'s existing standalone-sibling precedent).
- The mute icon ships as bare 🔊/🔇 emoji rather than an image — D-14's real icon is explicitly Wave 5's job requiring Wyatt's art pipeline, which cannot run overnight; `horn.png` was explicitly rejected per D-14 (it already renders 📯 in narration text).
- The click binding lives exclusively in `wireLobby()`, never in `setClockUI()` — matches the plan's explicit constraint and the proven `#scPause`/`#scTimerToggle` shape, avoiding the re-entrancy question the CLOCK-03 defensive-reset pattern exists for entirely.
- No `@copy` marker on the tooltips — planning determined this explicitly (constraint 6 in the spawn prompt); recorded in the copy-inventory file instead, with the marker-wiring named as a follow-up.

## Deviations from Plan

None — plan executed exactly as written. One implementation-detail note: the first draft of `setClockUI()`'s new comment block used the literal words "onclick" and "appState.liveDone" in prose near the `btnMute` identifier, which tripped the plan's own naive proximity-scan verification one-liners (they scan for the *string* "onclick"/"appState.liveDone" appearing anywhere within 400/at-any-position of "btnMute", not just in executable code). Reworded the comments to avoid those literal strings while keeping the same meaning — not a logic change, not a scope change, just wording chosen to satisfy the verification script's literal-text scan (Rule 3 — blocking issue, auto-fixed).

## Issues Encountered

None beyond the comment-wording fix above. `npm test` was fully green at the start of this session and remained fully green after every task commit — no pre-existing red inherited, no red introduced.

## User Setup Required

None — no new dependency, no configuration, no external service.

## Outstanding — Requires a Human, Awake, Driving a Browser

This was an overnight autonomous run; Wyatt was asleep. Every machine-checkable acceptance criterion is green (see Coverage D1-D4, D6-D8 and the Verification Run section below). The following are genuinely outstanding and are **NOT claimed as passing**, per this plan's execution context:

- **The full D5/Task 2 `<human-check>` sequence:** in a solo game, confirm the mute button sits to the right of the turn clock and is visible from the first turn; click it and confirm sound stops and the icon flips; reload mid-game and confirm it comes back still muted and still silent; click again to unmute; repeat in pass-and-play and in a two-window multiplayer game — including confirming that muting in one window does NOT mute the other; play to an end of voyage and confirm the mute button disappears with the clock panel while a muted player stays silent through the celebration; narrow the browser window and confirm `#scPause`, `#scTimerToggle` and `#btnMute` do not overlap or clip; repeat all of the above in Safari on a fresh server port.
- **Task 3's Credits-modal read:** open the Credits modal in a running game, confirm Luis appears once with both mechanics and sound credited via one working link, and read the new clause aloud to confirm it matches the paragraph's pirate voice.
- **Wyatt's disposition review** of all three new player-facing strings, recorded as "not yet reviewed" in the copy-inventory entry — the mute tooltips (hover the button in both states) and the credit clause, per milestone constraint 3.

Recommend Wyatt run this pass — the exact sequence in the plan's Task 2 and Task 3 `<human-check>` blocks — before treating AUDIO-02/AUDIO-03 as fully proven. Given D-15's "visible beside the clock in every mode for the whole game" claim rests entirely on this visual pass (there is no automated DOM-position-relative-to-viewport check in this codebase's test suite), this is the single most load-bearing outstanding item.

## Next Phase Readiness

- `#btnMute`'s markup, CSS, click binding and render block are all in place and stable — 21-05 only needs to swap the bare emoji for a real speaker icon (+ `blocked-slash.png` overlay per D-14) once Wyatt's art pipeline produces it; the `#btnMute img { width:60%; height:60%; object-fit:contain; }` rule is already in place so that swap needs no further CSS.
- The copy-inventory entry for this phase's three strings is ready for Wyatt's disposition review at 21-05's browser pass, alongside the deferred `@copy`-marker-wiring follow-up it names.
- `src/engine/index.js` remains byte-identical — the v1.3 determinism fence held through this plan.
- This closes AUDIO-02 and AUDIO-03's code-side work for the `sound-clock` workstream; only the human-verification pass and Wyatt's copy sign-off remain before the phase's user-facing surface is fully proven.

## Self-Check: PASSED

All modified files verified present on disk with the expected changes; all three task commits verified present in `git log`:
- `index.html` — FOUND, `#btnMute` element/CSS/media rule and the extended Luis credit clause present
- `src/orchestrator.js` — FOUND, `toggleMute()` exported and bound once in `wireLobby()`
- `src/ui/panel.js` — FOUND, `#btnMute` render block present in `setClockUI()`, before the `appState.liveDone` early return, no `onclick` assignment
- `.planning/todos/pending/copy-shipped-vs-approved-gate.md` — FOUND, dated phase-21 entry with all three strings
- Commit `242ff11` (Task 1) — FOUND
- Commit `5cbe0b3` (Task 2) — FOUND
- Commit `d81be3a` (Task 3) — FOUND
- `src/engine/index.js` — byte-identical to `HEAD~3`, confirmed via `git diff --stat`

---
*Phase: 21-sound-the-clock-toggle*
*Completed: 2026-08-01*
