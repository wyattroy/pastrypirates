---
phase: 22-the-front-door
plan: 01
subsystem: ui
tags: [vanilla-js, localStorage, modal, form-flow]

# Dependency graph
requires: []
provides:
  - "#nameModal — the single captain-naming surface, opened after a mode card is picked (D-01/D-03)"
  - "pp_lastName localStorage key + getLastName()/saveLastName() (src/ui/util.js) — durable name persistence never cleared by leaveGame() (D-04)"
  - "requireName() rewritten as the one read chokepoint all five former DOM readers now go through"
  - "openNameModal(next)/confirmName()/wireNameModal() (src/ui/lobby.js) — open, confirm-button, and dismiss-equals-confirm (D-02) wiring"
  - "docs/DRIVING-THE-GAME.md's solo-start and guest-join recipes rewritten to drive the modal"
affects: [22-02, 22-03, 22-04, 22-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "dismiss-equals-confirm modal: a .modalOverlay whose ✕/Escape/backdrop dismissal routes all call the SAME confirm function as its primary button, deliberately kept OUT of src/orchestrator.js's six-modal close-only .modalX injection array"
    - "durable localStorage key outside schema-versioned clearing, following the pp_id precedent (pp_lastName)"

key-files:
  created: []
  modified:
    - index.html (removed welcome-screen name field; added #nameModal overlay; reworded stale privacy notice)
    - src/ui/util.js (getLastName/saveLastName + pp_lastName)
    - src/ui/lobby.js (requireName() rewritten; openNameModal/confirmName/wireNameModal added)
    - src/ui/flow.js (four mode-card handlers now open the modal; wireNameModal() wired)
    - src/orchestrator.js (createRoom() and the Feedback handler now read through the chokepoint)
    - scripts/ui_contract_check.js (REGISTER_CHROME_EXCEPTIONS anchor + its --drill fixture updated in lockstep with the notice reword)
    - docs/DRIVING-THE-GAME.md (solo-start/guest-join recipes rewritten for the modal)

key-decisions:
  - "D-04's cited pre-fill source (pp_sess/pp_solo) does not survive leaveGame(); added a new never-cleared pp_lastName key instead, following the pp_id precedent — this is a deviation from CONTEXT.md's literal text that delivers D-04's actual intent (recorded in the plan before execution)."
  - "wireNameModal() deliberately NOT added to src/orchestrator.js's six-modal close-only .modalX array — every handler in that array only ever closes, the opposite of D-02's dismiss-equals-confirm requirement. The name modal owns its own dismissal wiring in src/ui/lobby.js instead."
  - "Privacy notice reworded from 'nothing beyond the name you type above is collected' to 'nothing beyond the name you confirm after picking how to play is collected' — kept in plain English (no pirate register) per Wyatt's prior ruling on this notice. Copy is DRAFT pending Plan 05's sign-off gate."

patterns-established:
  - "One read chokepoint (requireName()) for a value with five+ callers, backed by a single write chokepoint (confirmName()) — prevents the two-competing-naming-surfaces bug this plan fixes from recurring."

requirements-completed: [FIX-01]

coverage:
  - id: D1
    description: "Clicking any of the four mode cards opens the pre-filled name modal before that mode's flow continues; confirming proceeds into the mode's existing next screen (FIX-01 SC1, D-03)."
    requirement: "FIX-01"
    verification:
      - kind: manual_procedural
        ref: "Task 1 human-check — live browser pass (localhost:8531), all four mode cards, fresh localStorage.clear()"
        status: pass
    human_judgment: false
  - id: D2
    description: "A name confirmed in the modal survives a full game-and-restart cycle — pp_lastName is never cleared by leaveGame() (D-04)."
    requirement: "FIX-01"
    verification:
      - kind: manual_procedural
        ref: "Task 1 human-check — confirm name, finish game/reload, modal re-opens pre-filled with it"
        status: pass
    human_judgment: false
  - id: D3
    description: "Exactly one naming surface exists; the captains panel shows the confirmed name exactly once (FIX-01 SC2)."
    requirement: "FIX-01"
    verification:
      - kind: other
        ref: "grep -rnE '\\$\\(\"pname\"\\)|id=\"pname\"' index.html src/ — zero hits; broad-scope grep excluding src/ui/util.js's untouched pname0-pname3 family — zero hits"
        status: pass
      - kind: manual_procedural
        ref: "Task 1 human-check — roster[0].name set exactly once, four distinct captains, no doubling"
        status: pass
    human_judgment: false
  - id: D4
    description: "Dismissing the modal via the close control, Escape, or a backdrop click confirms the name shown and proceeds into the picked mode — it never cancels back to the welcome screen (D-02)."
    requirement: "FIX-01"
    verification: []
    human_judgment: true
    rationale: "This session's toolset has no browser-automation tool (no chrome-devtools/Playwright MCP available). All three dismissal routes are implemented and unit-verifiable by grep (confirmName() is the only handler wired for the X, backdrop, and Escape — see Files section) and by static reasoning, but the plan's own <human-check> for Task 2 requires a live browser pass (click X / press Escape / click backdrop on all four mode cards, plus a negative-control pass confirming the other six modals still only close). Not run — flagged in WINDOWS.md as unrun-verify. A local server is still live on :8531 for this pass."
  - id: D5
    description: "The other six close-only modals (howToPlayModal, creditsModal, logModal, feedbackModal, recipeModal, kofiModal) are unaffected — dismissing them still only closes, no side effect."
    verification: []
    human_judgment: true
    rationale: "Same browser-tool gap as D4 — the negative control needs a live browser pass. Static evidence: src/orchestrator.js's .modalX injection array is byte-identical (grep -c confirms exactly 1 occurrence, unchanged), and wireNameModal() is scoped entirely to #nameModal by construction (queries $(\"nameModal\") only). Not run — flagged in WINDOWS.md as unrun-verify."
  - id: D6
    description: "The welcome-screen privacy notice truthfully describes where the captain name is collected, and its ui_contract_check.js freshness anchor is updated in lockstep (Task 2)."
    requirement: "FIX-01"
    verification:
      - kind: other
        ref: "node scripts/ui_contract_check.js (D-29-CHROME-STALE assertion) + node scripts/ui_contract_check.js --drill (all 20 drills, including 5e's positive control)"
        status: pass
    human_judgment: false

# Metrics
duration: ~35min (Task 2 + closeout; continuation session — Task 1 ran in a prior session/checkpoint)
completed: 2026-08-01
status: complete
---

# Phase 22 Plan 01: Name modal (FIX-01) Summary

**Moved captain naming off the welcome screen into a `#nameModal` opened after mode pick, backed by a durable `pp_lastName` localStorage key and a single `requireName()`/`confirmName()` read/write chokepoint, with all three dismissal routes confirming rather than cancelling (D-02).**

## Performance

- **Duration:** Task 1 ~13 min (prior session, paused at its tracer feedback checkpoint) + a human browser-verification pass (external) + this continuation session (Task 2 + closeout) ~35 min
- **Completed:** 2026-08-01T04:56Z
- **Tasks:** 2/2
- **Files modified:** 7 (index.html, src/ui/util.js, src/ui/lobby.js, src/ui/flow.js, src/orchestrator.js, scripts/ui_contract_check.js, docs/DRIVING-THE-GAME.md)

## Accomplishments
- One captain-naming surface (`#nameModal`) replaces the skippable welcome-screen field for all four mode cards (Play Solo, Pass & Play, Host a Crew, Join a Crew), verified live in-browser.
- A durable `pp_lastName` key (never cleared by `leaveGame()`) actually delivers D-04's "survives finishing a game and clicking Play again" intent — the source CONTEXT.md cited (`pp_sess`/`pp_solo`) does not survive that path.
- Five former DOM readers of the removed `#pname` field collapsed to one chokepoint (`requireName()`), plus a second chokepoint for the Feedback handler's `getLastName()` (which must preserve `null` for a never-named player rather than substituting a default).
- Dismissing the modal (✕ / Escape / backdrop click) confirms the visible name and proceeds into the picked mode — the codebase's first Escape-key handler, and the first modal that is both dismissible and gates a flow, deliberately kept outside the six-modal close-only injection array in `src/orchestrator.js`.
- The stale privacy notice ("nothing beyond the name you type above is collected") reworded to describe the modal, with `scripts/ui_contract_check.js`'s freshness anchor and `--drill` positive-control fixture updated in the same commit so the check stays green rather than silently widening.

## Task Commits

1. **Task 1: End-to-end "player names themself after picking a mode" — confirm-button path** — `aee7e69` (feat)
2. **Task 2: Dismiss-equals-confirm (D-02) and the privacy notice the removed field left stale** — `33c614e` (feat)

**Plan metadata:** (this commit, following)

## Files Created/Modified
- `index.html` - Removed the welcome-screen `.nameLabel` captain-name field; added `#nameModal` overlay (heading, input, confirm button); reworded the privacy notice
- `src/ui/util.js` - Added `getLastName()`/`saveLastName()` backed by `pp_lastName`, structurally excluded from schema-versioned clearing
- `src/ui/lobby.js` - Rewrote `requireName()` to read the persisted value; added `openNameModal()`/`confirmName()`/`wireNameModal()`
- `src/ui/flow.js` - All four mode-card handlers now call `openNameModal()`; `wireNameModal()` invoked from `wireWelcome()`
- `src/orchestrator.js` - `createRoom()` reads via `requireName()`; the Feedback handler reads via `getLastName()`
- `scripts/ui_contract_check.js` - `REGISTER_CHROME_EXCEPTIONS` notice anchor + its `--drill` fixture updated to match the reworded sentence
- `docs/DRIVING-THE-GAME.md` - Solo-start and guest-join automation recipes rewritten to drive the modal (`btnNameConfirm`) instead of the removed field

## Decisions Made
See `key-decisions` in frontmatter. Summary: the D-04 persistence source was corrected from CONTEXT.md's stated `pp_sess`/`pp_solo` to a new `pp_lastName` key (validated working by the Task 1 browser pass); `wireNameModal()` was kept fully separate from `src/orchestrator.js`'s close-only `.modalX` array by design, not oversight.

## Deviations from Plan

### Auto-fixed Issues

None beyond what Task 1 already recorded (see below) — Task 2 introduced no new bugs, missing functionality, or blocking issues requiring Rule 1–3 fixes.

### Plan-arithmetic mismatches (documentation only — code intent satisfied)

**1. [Documentation] `openNameModal` acceptance count off by the import line**
- **Found during:** Task 1 (carried forward, documented by the prior executor)
- **Issue:** The plan's acceptance criterion `grep -c 'openNameModal' src/ui/flow.js` equals 4 is stated as "one call per mode card," but a raw `grep -c` also counts the `import { ..., openNameModal, ... } from "./lobby.js";` line, so the true count is 5.
- **Fix:** None needed — there are exactly 4 real call sites, one per mode card, as intended. No code change; documenting the plan's grep imprecision.
- **Files affected:** src/ui/flow.js (no change)

**2. [Documentation] `wireNameModal` acceptance count also miscounts the import line**
- **Found during:** Task 2 (this continuation)
- **Issue:** The plan's acceptance criterion `grep -c 'wireNameModal' src/ui/flow.js` equals 1 — the same class of miscount as #1 above. The true count in `src/ui/flow.js` is 3: the import (`import { ..., wireNameModal } from "./lobby.js"`), a pre-existing Task-1 comment mentioning `wireNameModal()` by name, and the one real invocation inside `wireWelcome()`.
- **Fix:** None needed — `wireNameModal()` is invoked exactly once, only from `wireWelcome()`, as the plan intends. No code change; documenting the plan's grep imprecision, same pattern as #1.
- **Files affected:** src/ui/flow.js (no change)

**3. [Rule 1 - consistency] Updated the `--drill` self-test fixture alongside the notice-anchor reword**
- **Found during:** Task 2
- **Issue:** `scripts/ui_contract_check.js`'s own `--drill` self-test (drill 5e, the notice-kind positive control) carries a synthetic `index.html` fixture containing the OLD notice sentence. Rewording only the real `REGISTER_CHROME_EXCEPTIONS` anchor (as the plan's Task 2 literally specifies) would leave that fixture's text mismatched against the new anchor, breaking `--drill`'s drill 5e the next time anyone runs `node scripts/ui_contract_check.js --drill` — not part of the plan's named gate set, but a real regression in the checker's own test suite caused directly by this task's edit.
- **Fix:** Updated the fixture string at `scripts/ui_contract_check.js:1062` to the same reworded sentence.
- **Files modified:** scripts/ui_contract_check.js
- **Verification:** `node scripts/ui_contract_check.js --drill` — all 20 drills PASS, including drill 5e.
- **Committed in:** 33c614e (Task 2 commit)

---

**Total deviations:** 2 documentation notes (no code impact) + 1 auto-fixed (Rule 1, self-test consistency).
**Impact on plan:** None on scope or behavior. All fixes/notes are either non-code or directly required by this task's own edit.

## Issues Encountered

**Host-flow environment limitation (not a regression, confirmed pre-existing).** In the browser session used for Task 1's `<human-check>`, "Host a Crew" does not advance past the welcome screen because `appState.db` never populates in that environment — Firebase RTDB does not initialize there. This was confirmed identical on the pre-22-01 baseline (`5cb50ba`, served separately, driven through the OLD `#pname` field): same `stepChoose`, same `db_present: false`, same null room. The part 22-01 actually owns for Host works: the modal opens, pre-fills, confirms, and `roster[0].name` is set correctly. Host's end-to-end multiplayer path needs a real network session (outside this environment) to confirm past that point — recorded here as unverified-in-environment, not a defect.

**Pre-existing captain-name-collision display quirk (out of scope, not touched).** Typing a captain name that exactly matches a bot's built-in default (e.g. "Crustbeard", `NAMES[1]`) shows that name twice in the captains panel — once for the player, once for the bot. `22-01` did not touch `NAMES` or `pname()`'s fallback logic, and the behavior reproduces identically on the pre-22-01 baseline. Not fixed here; out of scope for FIX-01.

**Task 2's browser-based `<human-check>` was not run in this session** — no browser-automation tool was available (see `coverage` D4/D5 above and `## Known Stubs` below). Logged to `.planning/WINDOWS.md` as `unrun-verify`.

## Known Stubs / Unverified Items

None are code stubs — this is a fully-implemented feature. The one open item is a **verification** gap, not an implementation gap:

- **D-02's live-browser dismissal check is unrun.** `src/ui/lobby.js`'s `wireNameModal()` implements all three dismissal routes (✕ close control, Escape keydown, backdrop click), each calling `confirmName()`, and the six other modals' close-only array in `src/orchestrator.js` is provably unchanged (`grep -c` on the array literal returns 1, unchanged). But the plan's Task 2 `<human-check>` — opening the modal from Play Solo three times and dismissing it a different way each time, then confirming the other six modals still only close — requires a live browser session with console-error checking, which this execution session had no tool to drive. **A local server is still running on `http://localhost:8531`** for whoever runs this pass. Logged to `.planning/WINDOWS.md` as `unrun-verify`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Plan 22-01 (wave 1) is done except for the one unrun browser-based dismissal check noted above; the code and all automated gates are green.
- `docs/DRIVING-THE-GAME.md`'s rewritten recipes are ready for Plan 04's screenshot-capture session.
- The modal heading (`What do they call ye, captain?`), confirm label (`Aye, that's me name`), and the reworded privacy notice are all still DRAFT per the plan's flagged assumption — Plan 05's sign-off gate has the exact final list to review.
- `git diff --stat src/engine/index.js` remains empty; the milestone's "engine untouched" constraint holds through both tasks.

---
*Phase: 22-the-front-door*
*Completed: 2026-08-01*

## Self-Check: PASSED

- FOUND: `.planning/workstreams/front-door/phases/22-the-front-door/22-01-SUMMARY.md`
- FOUND: commit `aee7e69` (Task 1)
- FOUND: commit `33c614e` (Task 2)
- FOUND: `index.html`, `src/ui/util.js`, `src/ui/lobby.js`, `src/ui/flow.js`, `src/orchestrator.js`, `scripts/ui_contract_check.js`, `docs/DRIVING-THE-GAME.md`
