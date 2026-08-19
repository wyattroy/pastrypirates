---
phase: 02-multiplayer-revival
plan: 03
subsystem: multiplayer
tags: [firebase, headless-chrome, cdp, stage-ui, ribbon, tab-visibility]

# Dependency graph
requires:
  - phase: 02-multiplayer-revival (plan 01)
    provides: "The two-process CDP rig (rig.mjs) and host-create/guest-join driving pattern, extended here through a started voyage (voyage-setup.mjs, from 02-02) to observe live ribbon state"
provides:
  - "4/src/ui/stage.js's ⏩ ribbon chip carries a networked term beside the pass-and-play term (D-04's third mode): `!(appState.db && appState.room)`, reusing the state module's own field for 'am I in a room' rather than inventing a flag"
  - "The chip's arm site (its own click handler) refuses in a networked game independently of the chip's CSS, closing the gap where appState.ff could still be set (and still shorten sleep() on the host, pacing every guest) even with the chip hidden"
  - "A previously-undiscovered, now-fixed latent fault: maybeBuildStage()'s `!appState.room` guard (stage.js:1419) silently prevented the entire stage — body.pp4Stage, #pp4Ribbon, #pp4FF, everything — from ever building in ANY networked game, confirmed by direct headless measurement before the fix. Removing that guard was required just to make MP-11 verifiable at all."
  - "Direct measurement (not a code read) that D-05's tab-hide gate holds in both directions on a live two-browser networked game: rooms/<CODE>/paused never moved across guest-hide, guest-show, host-hide, host-show, read from both browsers each time, red-proofed against a solo bot game where the same technique DOES flip the local pause state"
affects: [02-04, 02-05, 02-06, 02-07, 02-FINDINGS.md]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Deliberate visibilitychange simulation (override document.hidden/visibilityState getters, dispatch a real 'visibilitychange' event) rather than hoping for a genuinely-backgrounded CDP tab — matches 02-RESEARCH.md Pitfall 4's own guidance, and is confirmed accurate by a solo-game red-proof that the exact same technique DOES flip local state when the gate is supposed to allow it"
    - "Page-side setInterval 'nudge' driver (flip coin, then sail cell, then first non-back/non-anchor action button) injected via evalJS rather than driven from Node — cheap forward progress for a probe that needs turns to advance, not a full autoplay voyage"

key-files:
  created:
    - "<scratchpad>/probe-mp11.mjs — Task 1's automated verify. One script, three MODEs (networked/solo/passplay), samples #pp4FF's computed display across a full sampling window and separately invokes the click handler to read appState.ff back"
    - "<scratchpad>/probe-mp10.mjs — Task 2's automated verify. Four transitions (guest-hide/show, host-hide/show) against a live two-browser networked voyage, rooms/<CODE>/paused read from both browsers each time"
    - "<scratchpad>/probe-mp10-solo-redproof.mjs — the red-proof half of Task 2: same simulate-hide technique against a solo bot game, where the local pause state SHOULD (and does) flip"
    - "<scratchpad>/probe-investigate-stage.mjs — the investigation that surfaced the maybeBuildStage() bug before Task 1's real work could even begin"
  modified:
    - "4/src/ui/stage.js — botsUp's visibility condition (D-04's networked term), the ⏩ click handler's arm-refusal guard, and maybeBuildStage()'s stale `!appState.room` guard removed"

key-decisions:
  - "'Am I in a networked game' is answered by `appState.db && appState.room`, not a new flag and not appState.live. appState.live turned out to be a 'has a voyage started' flag true in EVERY mode (set unconditionally in beginGame()), not a networked indicator — using it would have hidden the chip in solo too. `appState.db && appState.room` is the exact idiom the codebase already uses for this question (orchestrator.js's chat-panel display gate, with the comment 'no chat in solo/pass-and-play — no one else to talk to'), so this reuses an established pattern rather than inventing one."
  - "The arm refusal lives INSIDE the click handler body (a guard), not as a conditionally-attached handler. buildStage() runs once per voyage and a room's networked-ness never changes mid-voyage today, so either shape would have worked — the guard was chosen because it doesn't have to trust that staying true, and it reads identically to the visibility tick's own test right above it."
  - "maybeBuildStage()'s `!appState.room` guard was fixed under deviation Rule 3 (blocking issue), not deferred: without it, no networked voyage ever gains a ribbon, #pp4FF never exists in the DOM, and Task 1's own acceptance criteria (which require observing the PRE-change chip actually rendered during a rival's turn) would be unsatisfiable. The guard dates to 2026-08-13, before Firebase was restored in `4/`, when appState.room could never be non-null — a no-op at the time, not a 'networked games use the classic layout' decision. Fixed by deleting the redundant term; gameEl's display plus appState.game already fully captured 'the voyage is on screen' for every mode."

patterns-established:
  - "Red-then-green via git-apply, not hand-editing back and forth: each fix's diff was saved as a patch, the file reverted with `git checkout --`, the pre-fix behavior measured, then the patch reapplied — a clean way to prove a probe can fail without leaving the working tree in an inconsistent state at any point."

requirements-completed: []  # MP-10 and MP-11 stay Pending — see Requirements Status below (D-09).

coverage:
  - id: D1
    description: "MP-11: no ⏩ in a networked game (visibility), and appState.ff cannot be armed by any reachable path in a networked game (the arm itself refuses) — solo and Pass & Play both unaffected"
    requirement: "MP-11"
    verification:
      - kind: e2e
        ref: "<scratchpad>/probe-mp11.mjs MODE=networked (headless CDP, two-process rig, pre-fix red / post-fix green against the live database)"
        status: pass
      - kind: e2e
        ref: "<scratchpad>/probe-mp11.mjs MODE=solo and MODE=passplay (regression check — chip behavior in both other modes is unchanged)"
        status: pass
    human_judgment: true
    rationale: "D-09 (02-CONTEXT.md): 'Claude shakes it out headless first; Wyatt then plays a real voyage on his phone, and THAT is the pass. Nothing in this phase closes on headless evidence alone.' Headless proof is real, red-then-green, and against the live production database — but the phase's own ruling reserves the actual close for Wyatt's phone pass."
  - id: D2
    description: "MP-10: the tab-hide gate holds in both directions on a live networked game (guest hide/show, host hide/show) — rooms/<CODE>/paused never moves, read from both browsers; red-proofed against a solo bot game where the same technique DOES pause. No production code touched."
    requirement: "MP-10"
    verification:
      - kind: e2e
        ref: "<scratchpad>/probe-mp10.mjs (headless CDP, two-process rig, four transitions against the live database)"
        status: pass
      - kind: e2e
        ref: "<scratchpad>/probe-mp10-solo-redproof.mjs (sensor red-proof: same technique against a solo bot game)"
        status: pass
    human_judgment: true
    rationale: "Same D-09 rationale as D1."

duration: ~85min
completed: 2026-08-19
status: complete
---

# Phase 2 Plan 3: The skip reaches its third mode, the tab-hide gate is proven, and the stage was never actually reaching a networked table Summary

**D-04's ⏩ ruling closed a networked term beside its Pass & Play term (visibility AND the arm site both refuse in a crew game), D-05's tab-hide gate proven to hold in both directions on a live two-browser voyage with the sensor itself red-proofed — and, discovered only because Task 1 tried to observe the ribbon in a real networked game, a previously-undiscovered latent fault fixed: the stage's own build gate was silently skipping every networked voyage entirely.**

## Performance

- **Duration:** ~85 min
- **Completed:** 2026-08-19
- **Tasks:** 2 (both `type="auto"`)
- **Files modified:** 1 (`4/src/ui/stage.js`)

## Accomplishments

- **The ⏩ skip reaches its third mode.** The ribbon's visibility condition already knew Pass & Play was solo-only (2026-08-13's ruling); it now knows a crew game is too — one added term, `!(appState.db && appState.room)`, beside the existing one, in the same expression, per D-04.
- **Hiding the chip is no longer the whole story.** The click handler itself now refuses to arm `appState.ff` in a networked game, independent of the chip's own CSS — closing the gap 02-RESEARCH.md's Pitfall 2 named: a host could otherwise have armed the flag through the handler even with the chip invisible, and that flag shortens `sleep()` inside `runLiveNet`, rushing every guest's narration.
- **A latent fault that would have silently broken every remaining plan in this phase was found and fixed.** `maybeBuildStage()`'s `!appState.room` guard, written 2026-08-13 while Firebase was off in `4/` (when `appState.room` could never be non-null — a no-op at the time), turned into a real bug the moment 02-01 restored multiplayer: measured directly against a live host+guest voyage, `body.pp4Stage`, `#pp4Ribbon` and `#pp4FF` never existed at all, on either side, even with `gameStarted:true`. Without this fix, Task 1's own acceptance criteria (which require observing the PRE-change chip actually render during a rival's turn) could not have been satisfied, and every later plan in this phase that assumes the ribbon exists in a networked game (02-04's chat button, D-06/D-07) would have been building on top of a stage that never activates for the mode it's ostensibly for.
- **D-05's tab-hide gate measured, not read, in both directions.** `rooms/<CODE>/paused` was read from both browsers before and after each of four simulated transitions (guest hide, guest show, host hide, host show) on a live two-process networked voyage — it never moved. The same simulate-hide technique was then run against a solo bot game (the one case the gate is supposed to allow), where it correctly flipped `appState.shotClockPaused` true on hide and false on show — proving the sensor itself can detect a real transition, so "nothing moved" in the networked case is a real finding, not a broken probe.

## Task Commits

1. **Task 1: The skip reaches its third mode — no ⏩ in a crew game, and no way to arm it either** — `cde2757` (fix) — includes the `maybeBuildStage()` fix as a Rule 3 same-file, same-task deviation (see Deviations)
2. **Task 2: Prove the tab-hide gate holds — and change nothing** — no repo commit (scratchpad-only per the task's own instruction; `4/src/main.js` and `4/src/ui/util.js` confirmed byte-identical before and after by MD5 — see Self-Check)

**Plan metadata:** committed in this same pass (see final commit below).

## Files Created/Modified

- `4/src/ui/stage.js` — `botsUp`'s visibility condition gained the networked term; the `#pp4FF` click handler gained an arm-refusal guard; `maybeBuildStage()`'s stale `!appState.room` guard removed. All three changes are in the file the plan named; no other file under `4/` was touched.
- `<scratchpad>/probe-mp11.mjs` *(not committed)* — Task 1's automated verify, `MODE=networked|solo|passplay`.
- `<scratchpad>/probe-mp10.mjs` *(not committed)* — Task 2's automated verify, four transitions on a live networked voyage.
- `<scratchpad>/probe-mp10-solo-redproof.mjs` *(not committed)* — Task 2's sensor red-proof against a solo bot game.
- `<scratchpad>/probe-investigate-stage.mjs` *(not committed)* — the investigation script that first surfaced the `maybeBuildStage()` bug.
- `<scratchpad>/stage-buildstage-fix.patch`, `<scratchpad>/stage-full.patch` *(not committed)* — saved diffs used to cleanly revert-and-reapply the file for each red/green measurement pass, via `git checkout --` and `git apply` (never `git stash`).

## Decisions Made

**Which state field answers "am I in a networked game":** `appState.db && appState.room`. `appState.room` is non-null for the entire lifetime of a hosted or joined room (set at create/join, cleared only on leaving/abandoning), and this exact combined test is already how `4/src/orchestrator.js` gates the chat panel's display ("no chat in solo/pass-and-play — no one else to talk to"). `appState.live` was considered and rejected — reading `4/src/state/index.js`'s own declaration comment plus its one assignment site (`beginGame()`) showed it is set `true` unconditionally for EVERY mode (solo, pass-and-play, networked) the instant a voyage starts; using it would have hidden the ⏩ in solo too, the opposite of D-04's intent. Reusing `appState.room` follows the plan's own instruction to derive this from state the orchestrator already sets, not invent a new flag.

**Ribbon chip sweep (per CLAUDE.md §2, consistency):** `#pp4Round` (day counter) and `#pp4Boats` (turn-order icons) are mode-agnostic by design — always shown, nothing to gate, unchanged. `#pp4Clock` is gated by Phase 1's shot-clock/`timerOff` state machinery, a separate and already-correct concern unrelated to solo/pass-and-play/networked mode — untouched. `#pp4Menu` (☰) is always clickable, unchanged. Only `#pp4FF` needed a mode term, and it now carries the same three-mode test the pass-and-play precedent established.

**maybeBuildStage() fix scope:** deleted exactly the one stale term (`&& !appState.room`) rather than restructuring the function. `gameEl`'s display plus `appState.game` truthy already fully capture "the voyage view is on screen" for every mode — confirmed by reading `showGameView()` (`4/src/ui/lobby.js`), which runs identically regardless of mode and is the only thing that flips `#game`'s display — so the room term was never doing useful work even when it happened to be harmless.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `maybeBuildStage()` silently skipped every networked voyage**
- **Found during:** Task 1, before any of the plan's own edits — an investigation probe (`probe-investigate-stage.mjs`) run against the UNCHANGED tree to confirm the ribbon existed before trying to hide one of its chips in it.
- **Issue:** `4/src/ui/stage.js:1419`'s `maybeBuildStage()` required `!appState.room` to build the stage. Written 2026-08-13, before `4/`'s Firebase tags existed, `appState.room` could never be non-null then, making the clause a permanent no-op. 02-01 restored multiplayer (`appState.room` now stays truthy for a room's entire life), silently converting that no-op into an active block: a genuine host+guest networked voyage, measured headlessly, never gained `body.pp4Stage`, and `#pp4Ribbon`/`#pp4FF` never existed in the DOM at all — confirmed with `gameStarted:true` on both sides.
- **Why in scope:** Task 1's own acceptance criteria require demonstrating that the PRE-change code shows the chip rendered during a rival's turn in a networked game — impossible if the chip's parent element is never created. The fix was required to make Task 1 verifiable at all, in the exact file already being edited.
- **Fix:** Removed the `&& !appState.room` clause from `maybeBuildStage()`'s condition. `gameEl`'s display plus `appState.game` already fully captured "the voyage is on screen" for every mode.
- **Files modified:** `4/src/ui/stage.js` (same file, same commit as Task 1's own changes — no separate commit).
- **Verification:** Red-then-green via saved-patch revert/reapply (`git checkout --` / `git apply`, never `git stash`): pre-fix, a fresh headless host+guest voyage measured `pp4Stage:false, hasRibbon:false, hasFF:false` on BOTH sides; post-fix, the identical drive measured `pp4Stage:true, hasRibbon:true, hasFF:true` on both sides. See `probe-investigate-stage.mjs`'s output, reproduced in full below.

---

**Total deviations:** 1 auto-fixed (Rule 3 — blocking, same file, same task).
**Impact on plan:** Necessary for Task 1's own acceptance criteria to be satisfiable at all; not scope creep — the plan's `files_modified` list already named `4/src/ui/stage.js` as the only file this plan touches, and this fix stayed inside it. This is very likely load-bearing for 02-04 through 02-06 too (anything assuming the ribbon/stage exists in networked play), and is flagged below for `02-FINDINGS.md`.

## Red-State Evidence (for `02-FINDINGS.md`)

**`maybeBuildStage()` bug, pre-fix, fresh headless host+guest voyage (room JYSH):**
```
HOST:  {"room":"JYSH","gameStarted":true,"pp4Stage":false,"hasRibbon":false,"hasFF":false}
GUEST: {"room":"JYSH","gameStarted":true,"pp4Stage":false,"hasRibbon":false,"hasFF":false}
```
Re-confirmed on a SECOND fresh port/profile pair (room UBQQ, no stale-module-cache risk) with the file mechanically reverted via `git checkout --`:
```
HOST:  {"room":"UBQQ","gameStarted":true,"pp4Stage":false,"hasRibbon":false,"hasFF":false}
GUEST: {"room":"UBQQ","gameStarted":true,"pp4Stage":false,"hasRibbon":false,"hasFF":false}
```
Post-fix, same drive, fresh port/profile (room AKFW):
```
HOST:  {"room":"AKFW","gameStarted":true,"pp4Stage":true,"hasRibbon":true,"hasFF":true}
GUEST: {"room":"AKFW","gameStarted":true,"pp4Stage":true,"hasRibbon":true,"hasFF":true}
```

**MP-11 chip visibility, pre-fix (D-04's own change reverted, `maybeBuildStage()` fix kept), networked, 23 samples over ~9s (room KBJR):** 13/23 samples showed `#pp4FF`'s computed display non-`none` during play; arming via the handler flipped `appState.ff` `false → true`.

**MP-11 chip visibility, post-fix, networked, 23 samples (room ZWHC):** 0/23 non-`none`; arming attempt left `appState.ff` `false → false`. Solo (room-less, same window): 11/23 non-`none` (chip still works). Pass & Play: 0/23 (unchanged, as before).

**MP-10, networked (room SWHW), four transitions, `rooms/SWHW/paused` before/after, read from both browsers:**
```
guest-hide: before {host:null,guest:null} after {host:null,guest:null}  (pre-check: hidden:false, outer:756)
guest-show: before {host:null,guest:null} after {host:null,guest:null}
host-hide:  before {host:null,guest:null} after {host:null,guest:null}  (pre-check: hidden:false, outer:756)
host-show:  before {host:null,guest:null} after {host:null,guest:null}
```
**MP-10 sensor red-proof, solo bot game:** pre-check `{hidden:false, outer:756}`; before `{paused:false, autoPausedByHide:false}`; after simulated hide `{paused:true, autoPausedByHide:true}`; after simulated show `{paused:false, autoPausedByHide:false}`.

## Issues Encountered

**Chrome ES-module URL caching produced a false negative mid-investigation.** Re-running the post-fix `maybeBuildStage()` check on the SAME server port and SAME Chrome `--user-data-dir` as a prior run still reported the bug as present — the profile's own disk cache was serving the pre-fix module. Resolved per `docs/DRIVING-THE-GAME.md` §1 (use a port/profile combination not used earlier in the session); a fresh pair confirmed the fix immediately. No lasting effect — flagged here because it is exactly the "phantom bug" failure mode the doc warns about, encountered live.

## User Setup Required

None — no external service configuration required.

## Requirements Status

**MP-10 and MP-11 stay `Pending` in `REQUIREMENTS.md`.** Both are headlessly proven, red-then-green, against the live production Firebase database — but D-09 (`02-CONTEXT.md`) reserves the actual requirement close for Wyatt's real-voyage phone pass, the same reasoning `02-01-SUMMARY.md` and `02-02-SUMMARY.md` applied to their own requirements. `coverage:` marks both deliverables `human_judgment: true` with that rationale rather than running `requirements mark-complete`.

**What Wyatt's phone pass should specifically confirm for this plan:** that the ⏩ chip is genuinely absent throughout a real crew game (not just for the first few turns a probe happened to sample), and that backgrounding his own phone mid-voyage — the single most likely real-world event this requirement exists for — does not visibly pause anyone else's screen.

## Next Phase Readiness

- **Ready:** the ⏩ skip and the tab-hide gate both hold under measurement in a genuinely networked, two-browser game — the two remaining pieces of "one player silently degrading everyone else's game" (this plan's own stated purpose) are closed.
- **Significant finding for `02-FINDINGS.md` and for 02-04 through 02-06:** the stage (the entire mobile redesign — ribbon, captains box, bubble placement, everything scoped to `body.pp4Stage`) was silently never activating for ANY networked game before this plan's fix. This was not previously known or flagged anywhere in `02-CONTEXT.md`, `02-RESEARCH.md`, or `02-01`/`02-02`'s summaries — it sat on exactly the kind of code this phase's own framing describes ("net code that has never run"), just on the UI tier rather than the orchestrator tier where the four FIX-03-adjacent faults were already known. **Any plan in this phase whose acceptance criteria assume the ribbon exists in networked mode (02-04's chat button per D-06/D-07 most directly) should re-verify against the now-fixed tree, not against what CONTEXT.md's citations described** — those citations were written and spot-checked before this fault was known to exist.
- **Standing constraint carried forward, still honored:** no probe in this plan drove a voyage to completion (`writeGameLog()` was never reached) — every probe stopped mid-voyage, and every `rooms/<CODE>` this plan created was deleted and read back as part of the probe's own `finally` block.
- **Ports used this plan** (avoid reusing without a fresh Chrome profile/port): servers `8601`, `8611`, `8621`, `8631`(unused after revert), `8641`, `8651`; CDP debug ports `9601`/`9602`, `9611`/`9612`, `9621`/`9622`, `9631`/`9632`, `9701`/`9702`, `9711`/`9712`, `9721`, `9731`/`9732`, `9733`, `9734`, `9801`/`9802`, `9803`.
- **Zero headless Chrome and zero local server processes were left running** at the end of this plan, confirmed by `ps aux` before returning.

## Self-Check: PASSED

- `4/src/ui/stage.js` — FOUND, diff confirmed scoped to this file only (`git diff --name-only` under `4/` lists nothing else)
- `4/src/main.js` — byte-identical before/after (MD5 `c87d234ca8a5d0c395a1f015b344394a` both times)
- `4/src/ui/util.js` — byte-identical before/after (MD5 `171150b5a4c277cad41f409f008e56c8` both times)
- `.planning/phases/02-multiplayer-revival/02-03-SUMMARY.md` — FOUND
- Commit `cde2757` — FOUND in `git log --oneline --all`

---
*Phase: 02-multiplayer-revival*
*Completed: 2026-08-19*
