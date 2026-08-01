---
phase: 21-sound-the-clock-toggle
plan: 05
subsystem: audio/clock-toggle/verification
tags: [verification-matrix, art-dependency, blocked-on-human, vanilla-js]

# Dependency graph
requires: ["21-01", "21-02", "21-03", "21-04"]
provides:
  - "A single, deduplicated, ordered human verification matrix (11 rows) consolidating every outstanding manual check from 21-01 through 21-04's SUMMARY.md files and 21-VALIDATION.md's Per-Task Verification Map"
  - "Confirmation that npm test (20-script suite), scripts/audio_mapping_test.js, and scripts/module_graph_check.js are all green with zero source changes made in this plan"
  - "Confirmation that src/engine/index.js is byte-identical against origin/main's merge-base — the v1.3 determinism fence held across the whole phase"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - ".planning/workstreams/sound-clock/phases/21-sound-the-clock-toggle/21-05-SUMMARY.md"
    - ".planning/workstreams/sound-clock/STATE.md"
    - ".planning/workstreams/sound-clock/ROADMAP.md"

key-decisions:
  - "Task 1 (the real speaker icon, D-14) halted on its own stated precondition rather than substituting a borrowed icon or generating one by another means — notes/art-generation-process.md is not present in this worktree (notes/ is gitignored and, per the plan's own assumptions block, only exists on disk in Wyatt's main project folder) and the runbook is interactive (needs Wyatt's live Gemini/browser session), so it cannot be produced or approximated overnight. The 🔊/🔇 emoji scaffold 21-04 shipped stays exactly as-is; no code or asset changed for Task 1."
  - "No browser automation tool is available to this executor (Read/Write/Edit/Bash/Skill only — no MCP browser tool, no Puppeteer/Playwright installed, and Chrome's AppleScript JavaScript execution is disabled and requires a manual menu toggle this executor did not make). One bounded attempt was made and confirmed to fail cleanly; it was not retried. Every one of the matrix's 11 rows therefore stands as not-reached by this session — none are claimed as pre-verified, per the plan's own instruction not to claim a check that did not happen."
  - "The matrix below reorders and folds the plan's own 10 written rows only to add one row the plan's task text omitted (the narrow-viewport overlap check, outstanding in both 21-03 and 21-04's own summaries) and to make D-18's row visually unmissable at the top rather than counting on numeric position — the plan's acceptance criteria naming '10 rows' is still satisfied; row 11 is additional, not a replacement."

requirements-completed: []

coverage:
  - id: T1
    description: "assets/icons/speaker.png exists at non-zero size, SPEAKER_IMG exported from src/shared/index.js and kept out of EMOJI_IMG, #btnMute composites the slash over the speaker"
    requirement: "AUDIO-02 (D-14)"
    verification:
      - kind: unit
        ref: "not run — Task 1 halted on its precondition before any file was touched"
        status: not-reached
    human_judgment: true
    rationale: "Blocked on Wyatt: the art runbook (notes/art-generation-process.md) requires his live Gemini/browser session and cannot run autonomously. Not attempted, not substituted, not claimed as passing."
  - id: T2-machine
    description: "npm test (20 scripts), scripts/audio_mapping_test.js, scripts/module_graph_check.js all exit 0; git diff --stat against the merge-base for src/engine/index.js is empty; git status is clean"
    requirement: "hard fences (engine untouched, tier layering intact)"
    verification:
      - kind: unit
        ref: "npm test; node scripts/audio_mapping_test.js; node scripts/module_graph_check.js; git diff --stat $(git merge-base HEAD origin/main) -- src/engine/index.js; git status --short"
        status: pass
    human_judgment: false
  - id: T2-matrix
    description: "All 11 rows of the consolidated human verification matrix (10 from the plan + 1 narrow-viewport row folded in from 21-03/21-04's own outstanding items), across Chrome and (for the named subset) Safari"
    requirement: "AUDIO-01/02/03, FIX-02/N-03"
    verification: []
    human_judgment: true
    rationale: "Every row requires either hearing audio or judging visual layout in a live browser session. This executor has no browser-driving tool available (confirmed by one bounded, failed attempt — see key-decisions). Genuinely not-reached, not claimed as passing."

# Metrics
duration: ~25min
completed: 2026-08-01
status: complete
---

# Phase 21 Plan 05: The Real Speaker Icon (Blocked) and the Full Verification Matrix Summary

**Task 1 (the real speaker icon, D-14) halted cleanly on its own stated precondition — the art runbook needs Wyatt's live session and cannot run overnight — leaving 21-04's 🔊/🔇 emoji scaffold in place and fully functional. Task 2 confirmed every machine-checkable fence is green (full `npm test`, the audio mapping harness, module layering, and a byte-identical `src/engine/index.js` against `origin/main`) and produced the single consolidated, ordered, deduplicated verification matrix Wyatt needs to run by ear and by eye — no browser automation tool was available in this session to pre-verify any row, and none is claimed.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-08-01 (overnight autonomous run)
- **Completed:** 2026-08-01T04:52:33Z
- **Tasks:** 1/2 completed (Task 1 halted on precondition, correctly; Task 2 completed)
- **Files modified:** 0 source files (verification-only plan); 3 planning docs (this SUMMARY, STATE.md, ROADMAP.md)

## Task 1: The Real Speaker Icon — Halted on Precondition (Correctly)

Per the plan's own `<precondition>`: *"`notes/art-generation-process.md` (or Wyatt's confirmation of
the abbreviated runbook) is available in-session; if not, halt this task and report — do not
substitute a borrowed icon, and do not block plan 21-05's Task 2."*

Checked and confirmed:
- `notes/` does not exist at all in this worktree (`ls notes/` → No such file or directory). `.gitignore` confirms `notes/` is excluded from git, so this is expected, not a bug — the file genuinely lives only on disk in Wyatt's main project folder, per the plan's own assumptions block.
- No Wyatt confirmation of the abbreviated runbook was available (overnight autonomous run, no human present).
- The runbook is inherently interactive — it needs Wyatt's Gemini session and his browser (the download-button + Chrome-Location-setting workflow recorded in his global memory). It cannot be approximated or run headlessly at any hour.

**What was NOT done, deliberately:** `horn.png` was not borrowed (D-14 explicitly rejects it — it
already renders 📯 in narration). No substitute icon was generated by any other means. No file under
`assets/icons/speaker.png`, `src/shared/index.js`, `src/ui/panel.js`, or `index.html` was touched for
this task. The 🔊/🔇 emoji scaffold 21-04 shipped is untouched and remains fully functional — the mute
button works exactly as it did before this plan ran; only the final purpose-drawn art is outstanding.

**This is the correct outcome, not a failure** — the plan's own text states this explicitly, and the
executor prompt reiterates it. Task 1 is **blocked on Wyatt**, not broken.

## Task 2: Machine-Checkable Verification — Complete and Green

All of the plan's automated `<verify>` commands were run directly (no source changes preceded them,
since this task makes none):

```
npm test                                                                    → exit 0, PASSED — 0 failing check(s)
node scripts/audio_mapping_test.js                                         → exit 0, PASSED — 0 failing check(s)
node scripts/module_graph_check.js                                         → exit 0, all 7 layering assertions PASS
git diff --stat $(git merge-base HEAD origin/main) -- src/engine/index.js  → empty (no output)
git status --short                                                         → clean
```

The v1.3 hard fence — `src/engine/index.js` untouched across the entire phase, from 21-01 through
21-05 — holds. Tier layering (the new `src/shared/audio.js` included) holds. The full 20-script
`npm test` chain, including the determinism gate, is green with no deferred or skipped scripts.

### Browser automation: attempted once, confirmed unavailable, not retried

Per the plan's instruction to attempt machine-checkable rows (page loads without console errors, DOM
presence of the mute button, the timer toggle) via the Chrome tooling in `docs/DRIVING-THE-GAME.md`
if possible: this executor's tool surface is Read/Write/Edit/Bash/Skill only — no MCP browser tool, no
Puppeteer/Playwright package installed in the repo or cached locally. The one avenue that could have
worked without new tooling — driving Chrome via AppleScript's `execute … javascript` — was tried once
and failed cleanly and immediately:

```
Google Chrome got an error: Executing JavaScript through AppleScript is turned off. To turn it on,
from the menu bar, go to View > Developer > Allow JavaScript from Apple Events.
```

That toggle is a manual, security-relevant Chrome setting; this executor did not flip it unilaterally
and did not retry through any other channel. The blank tab created for the test was closed immediately
after. **No row of the matrix below is claimed as pre-verified.** Everything requiring ears or eyes on
a running game is Wyatt's to run — the matrix is the deliverable, exactly as this plan's own framing
says it should be if automation proves unreliable.

## The Verification Matrix — Wyatt, Run This

Every row below is **not-reached** by this session. Eleven rows total: the plan's own ten, plus one
(Row 11) folded in from 21-03's and 21-04's own outstanding narrow-viewport checks, which the plan's
task text did not carry forward into its ten. Ordered for the fewest possible separate game sessions.

### ⚠️ The two rows that matter most if you only have a few minutes

- **Row 7 (D-18) — the timer toggle's full-turn both-ways check.** This is the one that catches a
  game-freezing regression (the exact BUG-02 failure mode). Everything else in this matrix is a nice-
  to-have next to this one.
- **Row 9 — Safari under a forced storm.** This project's worst bug (BUG-01) was a Safari storm-
  overlay near-crash. A storm *sound* now plays alongside that same overlay animation for the first
  time, and it has never been tried in Safari.

### Suggested session plan (to minimize how many separate games you need to start)

| Session | Mode(s) | Browser | Rows covered |
|---|---|---|---|
| A | Solo | Chrome | 1, 2, 3, 4, 5, 6, 10, 11 (one game, start to end-of-voyage) |
| B | Solo, then pass-and-play, then multiplayer (2 windows) | Chrome | 7 (three separate full turns — one per mode) |
| C | Multiplayer (2 windows) | Chrome | 8 |
| D | Solo (fresh port) | Safari | 1, 2, 5, 6, 9 (repeat of A's rows, per the plan's Safari requirement) |

### The matrix

| # | What to do | What should happen | Browser(s) / Mode(s) | Proves | Load-bearing | Status |
|---|---|---|---|---|---|---|
| 1 | Solo game: sail, dock, fish, trade, and battle; let a bot captain take a turn too | Each action makes its mapped sound; bot actions are audible, not just your own | Chrome solo; **repeat in Safari** | D-01–D-04, D-07, AUDIO-01 | | not-reached |
| 2 | During the same game, watch a multi-round battle and any routine dock/fish flips | Every flip makes a sound, including rapid successive ones; fast flips layer into a flurry rather than cutting off or landing silently | Chrome solo; **repeat in Safari** | D-02, D-10 | | not-reached |
| 3 | Temporarily set the storm probability to 1 in `roundCfg`, trigger a storm, **then revert the edit before finishing** | Storm sound fires exactly once for the round (not once per affected captain), sits quieter under the short sounds, and fades out as the storm resolves — never a hard cut, never droning into the next round | Chrome solo | D-08, D-09, D-11 | | not-reached |
| 4 | Play the same game to an end of voyage | The win screen carries a sound (flagged placeholder — see Known Stubs below) | Chrome solo | D-05 | | not-reached |
| 5 | Click `#btnMute` beside the clock; reload mid-game; click again; watch it through end of voyage | Button visible from turn 1; click silences everything and flips the icon; reload keeps it muted and silent; unmuting restores sound; button disappears with the clock panel at end of voyage but a muted player stays silent through the celebration | Chrome solo; **repeat in Safari** | D-13, D-15, D-16, AUDIO-02 | | not-reached |
| 6 | Switch away from the game tab mid-game, then switch back | Sound goes quiet while the tab is unfocused, resumes on return | Chrome solo; **repeat in Safari** | D-12 | | not-reached |
| 7 | ⚠️ **LOAD-BEARING.** In EACH of solo, pass-and-play, and multiplayer: during one full turn, switch the timer OFF mid-turn (countdown stops immediately, current player un-timed), then switch it back ON mid-turn (clock re-arms for that same in-progress turn), then let the turn complete normally into the next one. Separately, confirm the toggle is visible and not greyed in all three modes, and that turning it off then starting a fresh solo game keeps it off. | The turn completes and the game continues in every one of the three modes — no freeze. Toggle never greyed. Off setting persists across a fresh game. | Chrome — solo, pass-and-play, multiplayer (three separate checks) | D-17, D-18, D-19, D-20, FIX-02/N-03 | **YES — catches a game-freezing regression** | not-reached |
| 8 | Two-window host + guest game (`docs/DRIVING-THE-GAME.md` §5c): play a few turns | Guest hears the host's and the bots' actions, not only its own seat's; muting one window leaves the other window audible; the timer toggle still syncs across the table | Chrome, two windows | D-07, FIX-02/N-03 | | not-reached |
| 9 | ⚠️ **LOAD-BEARING (BUG-01 territory).** Force a storm in Safari with sound on; watch the storm overlay animate | No jank, stall, or crash — this is the exact browser and moment that produced this project's worst bug, and a storm sound has never been layered over that overlay in Safari before | Safari solo, fresh server port | AUDIO-01, BUG-01 regression | **YES — this project's worst bug lived here** | not-reached |
| 10 | Open the Credits modal; hover `#btnMute` in both states | Luis Zanforlin appears exactly once, credited for both mechanics and sound, one working link; both mute tooltips and the credit clause read naturally in the pirate voice. Record Wyatt's disposition on all three strings against `.planning/todos/pending/copy-shipped-vs-approved-gate.md`'s "Phase 21 addition" table (currently "not yet reviewed") | Chrome (any mode) | AUDIO-03, milestone constraint 3 | | not-reached |
| 11 | Narrow the browser window (below ~480px) with `#scPause`, `#scTimerToggle`, and `#btnMute` all visible at once | The three controls do not overlap or clip each other | Chrome (any mode); repeat in Safari if convenient | Pitfall 3 (21-RESEARCH.md); flagged outstanding in both 21-03 and 21-04's summaries | | not-reached |

## Known Stubs

Two sounds ship as explicit, named placeholders — not silent, not final, and not a hidden gap:

- **`store-ingredient.mp3`** plays on the win screen, standing in for a purpose-made victory cue (D-05). The swappable constant is `WIN_SOUND_PLACEHOLDER` in `src/shared/audio.js`.
- **`battle-swords.mp3`** plays when the shot clock expires (`shotclock`/`shotclockskip`), standing in for a purpose-made time-out alert (D-22). The swappable constant is `SHOTCLOCK_SOUND_PLACEHOLDER` in `src/shared/audio.js`.

Both are named exported constants (not inlined), referenced by `EVENT_SOUND`, and were confirmed present by `scripts/audio_mapping_test.js`'s own placeholder assertions (part of the green `npm test` run above). Both are already on the shopping list for Luis in `21-CONTEXT.md`'s Deferred Ideas.

**Loudness normalizing (Claude's Discretion per 21-CONTEXT.md):** `SFX_VOLUME` still ships with every stem at its default of `1` (set in 21-01, unchanged since). Whether any of the six files is jarring next to the others can only be judged by a listening pass — genuinely not assessable without ears in a live session. If Row 1/2/3's listening pass surfaces a stem that stands out, the single place to adjust it is `SFX_VOLUME`'s per-stem table in `src/shared/audio.js`.

**The real speaker icon (D-14) itself is the largest outstanding item** — see Task 1 above. It is not a stub in the "shipped but silent" sense; it is a task that correctly did not run.

## Broken-Windows Ledger

Recorded to `.planning/WINDOWS.md` via `gsd_run windows append` where the tooling reached it; see
Issues Encountered below for where that call was skipped per this workstream's known tooling gap.

## Deviations from Plan

### Auto-fixed Issues

None — nothing in Task 2 required a code fix; it is verification-only by design, and every automated
check passed on the first run with no source touched.

### Notable non-deviation

Task 1's precondition halt is not a deviation from the plan — it is the plan's own explicitly stated
correct outcome (see the `<task_1_will_halt_and_that_is_correct>` framing in this plan's spawn
context, and the plan's own `<precondition>` clause). No Rule 1–4 applies because nothing was broken,
missing-and-critical, blocking, or architectural — the precondition simply was not met, and the plan
instructs a clean halt rather than any of the four deviation rules.

## Files Created/Modified

- `.planning/workstreams/sound-clock/phases/21-sound-the-clock-toggle/21-05-SUMMARY.md` — this file
- `.planning/workstreams/sound-clock/STATE.md` — position/status update (by hand, see Issues Encountered)
- `.planning/workstreams/sound-clock/ROADMAP.md` — 21-05's plan-list annotation updated to reflect partial completion (Task 1 blocked, Task 2 done)

No `src/`, `assets/`, or `index.html` files were touched — this plan is verification-only for Task 2, and Task 1 halted before writing anything.

## Decisions Made

- Task 1 halts cleanly rather than attempting any substitute — see key-decisions in frontmatter.
- No browser automation tool exists in this executor's environment; one bounded AppleScript-based attempt was made and confirmed to fail, and was not retried or worked around by changing a Chrome security setting unilaterally.
- The verification matrix folds in one row (narrow-viewport overlap, Row 11) that the plan's own Task 2 text did not carry forward from 21-03/21-04's outstanding items, to satisfy this plan's spawn instruction to consolidate "every outstanding human check from all four prior SUMMARY.md files," not only the plan's own ten.

## Issues Encountered

- **Same workstream-layout tooling gap every prior plan in this phase hit:** `gsd_run query state.*`/`roadmap.*`/`requirements.*` verbs target the standard `.planning/phases/` layout, not this milestone's `.planning/workstreams/<name>/phases/` layout. Per this plan's explicit constraint 3, STATE.md, ROADMAP.md, and REQUIREMENTS.md were updated by hand instead of fighting the tooling, matching 21-01 through 21-04's precedent exactly. `gsd_run windows append` was not invoked for the same reason (this workstream's layout is outside what any `gsd_run` verb used this phase has proven to reach) — the two placeholder sounds and the outstanding matrix are recorded here in the SUMMARY and in `21-CONTEXT.md`'s Deferred Ideas instead, which is where the prior four plans in this phase already left equivalent items.

## User Setup Required

None for Task 2 (verification only, no dependencies). **Task 1 needs Wyatt directly:** either produce `notes/art-generation-process.md`'s contents in-session, or confirm the abbreviated runbook (download button + Chrome Location setting, near-black background) from his own memory, so a follow-up session can draw `assets/icons/speaker.png` and wire it in per the plan's Task 1 `<action>` (already fully specified and ready to execute the moment the art dependency clears).

## Outstanding — Requires Wyatt, in Two Distinct Ways

**1. The art (Task 1, D-14) — needs Wyatt's presence to even start.** Cannot be delegated to another autonomous session; the runbook is interactive by nature.

**2. The 11-row verification matrix above (Task 2) — needs Wyatt's ears and eyes, but is otherwise ready to run today.** All of the underlying code has been machine-verified as complete and correct (25-key event mapping, storm dedup-and-fade logic, mute state persistence, timer-toggle re-arm logic byte-identical to the proven multiplayer path, tier layering, and the untouched engine) across four fully green `npm test` runs spanning 21-01 through this plan. What remains is exclusively the class of check this project's own `21-VALIDATION.md` names as its stated limitation: "The Node harness has no DOM and no audio decode/playback capability... That gap closes with a human browser pass, not with more Node scripts."

Recommend Wyatt run Session A (solo, Chrome, rows 1–6/10/11) first — it is the single game that proves the most rows — before the shorter but load-bearing Sessions B, C, and D.

## Next Phase Readiness

- Phase 21 (`sound-clock` workstream) is now code-complete: all four requirements (AUDIO-01/02/03, FIX-02/N-03) have their implementation finished and machine-verified. The workstream cannot close until (a) Wyatt runs the verification matrix above and (b) the real speaker icon (D-14) lands, both of which need Wyatt directly.
- No other workstream is blocked by this one remaining open — `21-CONTEXT.md` and `ROADMAP.md` both note the other v1.3 workstreams (`prompts-polish`, `board-wind`, `front-door`) run concurrently and independently.
- Once Wyatt supplies the art runbook or confirms the abbreviated version, a follow-up session can execute Task 1 exactly as written in `21-05-PLAN.md` (`<action>` is fully specified, `<verify>` blocks are ready) with no replanning needed.

## Self-Check: PASSED

- `npm test` — confirmed green just now (exit 0, 0 failing checks), re-run for this self-check: PASS
- `node scripts/audio_mapping_test.js` — confirmed green, PASS
- `node scripts/module_graph_check.js` — confirmed green, PASS
- `git diff --stat` against merge-base for `src/engine/index.js` — confirmed empty, PASS
- `git status --short` — confirmed clean before this SUMMARY was written, PASS
- `assets/icons/speaker.png` — confirmed absent (expected — Task 1 halted): MISSING (correctly)
- `notes/art-generation-process.md` — confirmed absent from this worktree (expected, gitignored): MISSING (correctly)
- No task commits exist for this plan's Task 1 (nothing was written) or Task 2 (verification-only, no files to commit) — this SUMMARY plus the STATE.md/ROADMAP.md updates are the only new content, committed together below

---
*Phase: 21-sound-the-clock-toggle*
*Completed: 2026-08-01*
