---
phase: 15-narration-audit-fixes
plan: 03
subsystem: ui
tags: [narration, multiplayer, firebase, viewer-aware, turn-flow]

# Dependency graph
requires:
  - phase: 15-narration-audit-fixes
    provides: "Plan 15-01's viewer-aware narration mechanism (describeFor/narrationSubjects/narrationVariants/pickNarrVariant/isLocalTo/NEUTRAL_VIEWER, flash()'s additive variants param) proven end to end on one line"
provides:
  - "D-13 fix: windLeg's anchorHold branch now awaits narrateLastEvent(), so the already-anchored-safely line plays on your own turn, not only on bots' turns"
  - "brokeSailLine/brokeAnchorLine — two pure, viewer-aware line builders narrating the two D-11 broke moments (can't-afford-to-sail for a human AND a bot; can't-afford-to-anchor)"
  - "stormIntroClause — the per-turn storm banner now names only the leg happening now, in second person, instead of pre-announcing both legs (NARR-03)"
  - "Every captain-naming ad-hoc flash() site in src/ui/flow.js (14 sites) converted from host-computed inline seatLocal() ternaries to the neutral-plus-variants broadcast form — the actual fix for the NARR-05 symptom where guests read the second-person text about the HOST's own action"
  - "scripts/narration_flow_test.js — a second DOM-free narration harness, wired into npm test as the 14th gate"
affects: [15-04, 15-05, 15-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "String-index source-text slicing (extractFn helper) instead of awk line-range patterns for structural test assertions — awk's start/end range pattern silently terminates on the FIRST line when a generic end pattern (e.g. \"^export async function\") also matches the start line itself; string indexOf-based slicing has no such trap"
    - "D-08 two-named-seat narration: a refusal or side-bet call that names both an actor and a target seat emits one variants entry PER named seat, not only the actor's"
    - "Ad-hoc (non-EVENT_NARRATION-table) narration lines follow the same neutral-plus-variants call shape the table-driven builders use: flash(neutralText, ms, holdMs, [{seat, html}, ...]) — never compute the addressed string on the host and pass it as the sole message"

key-files:
  created:
    - scripts/narration_flow_test.js
  modified:
    - src/ui/flow.js
    - package.json

key-decisions:
  - "brokeSailLine/brokeAnchorLine and stormIntroClause are DRAFT copy pending Wyatt's D-04 review pass, same convention as EVENT_NARRATION.moored's own D-21 draft comment"
  - "The trade-refusal (humanTrade) and side-bet-call (collectSideBets) lines had no addressed form at all before this plan — new DRAFT copy was authored for them (not reused), per the plan's 'where no addressed form exists yet, draft one' instruction"
  - "humanWind's own second-leg flash (\"Now the storm moves you {dir2}!\") was deliberately left untouched: it never calls pn()/poss() to name a captain (a literal `\"names a captain\"` conversion-scope test), so it falls outside this plan's explicit minimum call-site list — logged as a discovered narration gap, not fixed here (see Deviations)"
  - "botTurn's sail gate was refactored to hoist `wantsToSail` (dist>1||(dist===1&&exact)) as a named boolean so the new broke-bot branch could test the same intent condition without duplicating the expression a third time"

patterns-established:
  - "String-index (indexOf) source-text extraction for structural test assertions, in place of awk line ranges, when the start marker can also match a generic end pattern"

requirements-completed: [NARR-02, NARR-03, NARR-05]

coverage:
  - id: D1
    description: "The already-anchored-safely (anchorHold) narration line now plays on your own turn — windLeg's branch awaits narrateLastEvent() before liveRender(), same three-step order the moored branch above it already used (D-13)"
    requirement: "NARR-05"
    verification:
      - kind: unit
        ref: "scripts/narration_flow_test.js — D-13 windLeg anchorHold ordering assertion"
        status: pass
      - kind: unit
        ref: "npm test (14-gate chain including narration_flow_test.js)"
        status: pass
    human_judgment: false
  - id: D2
    description: "A broke human's sail gate (humanTurn) and a broke bot's sail gate (botTurn) both narrate their own broke moment via brokeSailLine — the bot path had no narration at all before this plan (likely source of the reported 'broke bot forgets its turn' symptom)"
    requirement: "NARR-02"
    verification:
      - kind: unit
        ref: "scripts/narration_flow_test.js — brokeSailLine viewer-awareness + humanTurn/botTurn structural call-site assertions"
        status: pass
    human_judgment: false
  - id: D3
    description: "A broke captain facing a storm-driven island (windLeg's storm-anchor block) is told plainly the anchor is out of reach via brokeAnchorLine, instead of the Pay-to-anchor option silently vanishing from the prompt"
    requirement: "NARR-02"
    verification:
      - kind: unit
        ref: "scripts/narration_flow_test.js — brokeAnchorLine viewer-awareness + windLeg structural call-site + unchanged Pay/flip option-count assertions"
        status: pass
    human_judgment: false
  - id: D4
    description: "The per-turn storm intro (humanTurn's turn banner) names only the leg happening now, in second person, via stormIntroClause; the second leg's own direction is still announced separately by humanWind at the moment it happens; the round header and round-level storm announcement remain third-person and untouched (D-09)"
    requirement: "NARR-03"
    verification:
      - kind: unit
        ref: "scripts/narration_flow_test.js — stormIntroClause 4-direction assertions, humanTurn windNow2-absence assertion, humanWind windNow2-presence assertion, EVENT_NARRATION.newround-absence assertion"
        status: pass
    human_judgment: false
  - id: D5
    description: "Every flash() call site in src/ui/flow.js that names a captain (14 sites: coin-flip, three trade-wind sweeps, leeward warning, too-poor-for-powder, turn banner, two trade-refusal lines, botWindLeg's two describe()-then-flash() sites, two side-bet call lines) is delivered per-viewer via the neutral-plus-variants form, instead of the host computing the addressed string and broadcasting it verbatim to every client (the actual NARR-05 bug)"
    requirement: "NARR-05"
    verification:
      - kind: unit
        ref: "scripts/narration_flow_test.js — no-inline-seatLocal-ternary assertion, >=8-variants-sites assertion (14 found), botWindLeg narrationVariants(2) assertion, no-raw-name-interpolation assertion"
        status: pass
      - kind: unit
        ref: "npm test (14-gate chain, 31-seed determinism verify unaffected)"
        status: pass
    human_judgment: false
  - id: D6
    description: "Live two-tab multiplayer session: a trade-wind sweep and a too-poor-for-powder moment on a remote seat read addressed on that seat's own tab and third-person on every other tab; a solo storm turn's banner names one leg, and the second leg is announced when it actually happens"
    verification: []
    human_judgment: true
    rationale: "Requires a real two-browser-tab Firebase session per the MP test harness (localStorage pp_id gotcha) — cannot be exercised headlessly. Deferred to end-of-phase human verification per config.json's human_verify_mode: end-of-phase, same deferral 15-01's own two-tab check used."

# Metrics
duration: ~25min
completed: 2026-07-28
status: complete
---

# Phase 15 Plan 03: Turn-Flow Narration Gaps Summary

**Fixes the missing anchorHold narrate call (D-13), narrates both broke moments for humans and bots (D-11), rewrites the per-turn storm intro to name one leg in second person (NARR-03), and converts all 14 captain-naming ad-hoc `flash()` sites in `src/ui/flow.js` from host-computed verbatim broadcasts to the neutral-plus-variants form — closing the real NARR-05 bug where every guest read the second-person text about the host's own action.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-07-27T21:20:00-04:00 (approx.)
- **Completed:** 2026-07-27T21:44:47-04:00
- **Tasks:** 3
- **Files modified:** 3 (1 created: `scripts/narration_flow_test.js`; 2 modified: `src/ui/flow.js`, `package.json`)

## Accomplishments

- Fixed D-13: `windLeg`'s `anchorHold` branch now `await narrateLastEvent()`s before `liveRender()`, the same three-step order the `moored` branch immediately above it already used — the already-anchored-safely line now plays on your own turn, not only on bots' turns.
- Added `brokeSailLine(seat, viewerSeat)` and `brokeAnchorLine(seat, viewerSeat)`, two pure, viewer-aware, DRAFT line builders, and wired them at all three D-11 moments: a broke human's sail gate (`humanTurn`), a broke bot's sail gate (`botTurn` — previously silent, the likely source of the "broke bot forgets its turn" symptom), and a broke captain's storm-anchor block (`windLeg`, where the Pay-to-anchor option silently vanished with no explanation).
- Added `stormIntroClause(dir1)`, a pure, DRAFT builder that rewrites the per-turn storm banner to name only the leg happening now, in second person — the second leg is already announced separately by `humanWind`/`botTurn` at the moment it actually happens, so pre-announcing it in the banner was pure redundancy (NARR-03). The round header (`EVENT_NARRATION.newround`) and the round-level storm announcement in `src/orchestrator.js` are untouched (D-09).
- Converted all 14 captain-naming ad-hoc `flash()` call sites in `src/ui/flow.js` — the coin-flip announcement, three trade-wind rim-sweep lines, the leeward warning, the too-poor-for-powder line, the turn banner, both trade-refusal lines, `botWindLeg`'s two `describe()`-then-`flash()` sites (now `describeFor(event, NEUTRAL_VIEWER)` + `narrationVariants(event)`), and the two side-bet call lines — from inline `seatLocal(p.idx)?...:...` ternaries (computed on the host, broadcast verbatim to every client) to the neutral-plus-variants form. This is the actual fix for the reported NARR-05 symptom: today's six pre-existing ternary sites were silently broadcasting the addressed ("you") text to every guest, regardless of whose turn it was.
- Applied D-08 (two-named-seat narration) to the trade-refusal and side-bet-call lines: each now emits a variants entry for BOTH named seats (the actor and the target), not only the actor.
- Added `scripts/narration_flow_test.js`, a second DOM-free narration harness following the house `bot_storm_narration_test.js`/`narration_test.js` convention, wired into `npm test` as the 14th gate (13 → 14). It proves the D-13 ordering structurally, the two broke-line builders' viewer-awareness and their three call sites, `stormIntroClause`'s four-direction output, and the file-wide absence of any remaining inline `seatLocal()` narration ternary.

## Task Commits

Each task was committed atomically:

1. **Task 1: Harness for flow-level narration, plus the anchorHold narrate call (D-13)** - `16dadad` (fix)
2. **Task 2: NARR-02 — a broke line for both moments, humans and bots (D-11)** - `775c44e` (feat)
3. **Task 3: NARR-03 storm intro, and every captain-naming ad-hoc line onto the variants form (D-07/D-08/D-09/D-10)** - `e6f6266` (feat)

**Plan metadata:** committed separately per `<final_commit>` step (see STATE.md/ROADMAP.md commit).

## Files Created/Modified

- `scripts/narration_flow_test.js` - New DOM-free harness: D-13 structural assertion (Task 1), brokeSailLine/brokeAnchorLine viewer-awareness + call-site assertions (Task 2), stormIntroClause + ad-hoc-conversion assertions (Task 3)
- `src/ui/flow.js` - D-13 fix; two new exported builders (`brokeSailLine`, `brokeAnchorLine`) plus their 3 call sites; one new exported builder (`stormIntroClause`); 14 ad-hoc `flash()` sites converted to neutral-plus-variants; `botTurn`'s sail gate refactored to hoist `wantsToSail`; import list updated (`describe` → `describeFor`/`narrationVariants`; added `isLocalTo`/`NEUTRAL_VIEWER`)
- `package.json` - `narration_flow_test.js` added as the 14th gate in the `test` script chain

## Decisions Made

- `brokeSailLine`/`brokeAnchorLine`/`stormIntroClause` and the newly-drafted trade-refusal/side-bet-call addressed copy are explicitly DRAFT, pending Wyatt's D-04 review pass — same convention Phase 14's `moored`/D-21 and 15-01's `dodge`/D-07 draft lines used.
- The trade-refusal (`humanTrade`) and side-bet-call (`collectSideBets`) lines had no addressed ("you") form at all before this plan; new DRAFT copy was authored for them rather than reused, per the plan's "where no addressed form exists yet, draft one" instruction.
- `botTurn`'s sail gate was refactored to hoist `dist>1||(dist===1&&exact)` into a named `wantsToSail` boolean, so the new broke-bot narration branch could test the same intent without duplicating the expression a third time.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] The plan's own listed verify commands for the humanTurn/botTurn ranges are self-defeating**
- **Found during:** Task 1 (writing `scripts/narration_flow_test.js`'s structural assertions)
- **Issue:** The plan's literal verify commands use `awk '/export async function X/,/^export async function/' ...`. Because `X`'s own declaration line ("export async function humanTurn(p){") ALSO matches the generic end pattern `^export async function`, awk's start/end range terminates immediately on that same line — the command prints only the one-line function signature, regardless of what the function body actually contains. Confirmed live against this codebase.
- **Fix:** `scripts/narration_flow_test.js`'s own `extractFn()` helper slices by string index (`indexOf`), not by awk line ranges, so it is immune to the trap and correctly proves the real invariant (verified brokeSailLine appears exactly once in each of `humanTurn`'s and `botTurn`'s bodies via a corrected two-pass awk equivalent before writing the harness).
- **Files modified:** `scripts/narration_flow_test.js` (the harness itself; the plan file was not edited)
- **Verification:** `node scripts/narration_flow_test.js` passes all structural assertions; manually re-ran a corrected awk pattern (`awk '/START/{f=1;next} f&&/END/{f=0} f'`) to confirm the real call-site counts independently.
- **Committed in:** `16dadad` (Task 1 commit, harness scaffolding)

---

**Total deviations:** 1 auto-fixed (1 bug in the plan's own verify-command tooling, not in the implementation)
**Impact on plan:** No scope creep — the underlying invariants the plan intended to verify are all proven true via a corrected extraction method; only the harness's internal extraction technique differs from the plan's illustrative `awk` one-liners.

## Issues Encountered

- `humanWind`'s own second-leg flash (`"⛈️ Now the storm moves you <b>{dir2}</b>!"`) always renders "you" unconditionally, with no `seatLocal()`/`pn()` selection at all — meaning a guest watching another player's turn would also read "you" for that moment. This is the same class of bug the 6 pre-existing ternary sites had, but it does not literally "name a captain" (no `pn()`/`poss()` call), so it falls outside this plan's explicit minimum call-site list and its own acceptance criteria (which require `windNow2` to remain present in `humanWind`, unmodified). Left untouched and logged here as a discovered gap for a future narration pass — not fixed in this plan, to stay within its stated scope.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 14 `npm test` gates green, including the 31-seed determinism verify (unaffected — `git diff --stat src/engine/index.js` is empty across all three commits).
- Every commit's `git show --stat` is confined to this plan's `files_modified` frontmatter (`src/ui/flow.js`, `scripts/narration_flow_test.js`, `package.json`) — the D-09 boundary (round-level lines untouched) held mechanically, not just by review.
- **Pending human verification (deferred to end-of-phase per `config.json`'s `human_verify_mode: end-of-phase`):** the plan's own two-tab Chrome multiplayer session — confirm a trade-wind sweep and a too-poor-for-powder moment on a remote seat read addressed on that seat's own tab and third-person on every other tab, and confirm a solo storm turn's banner names one leg with the second leg announced separately when it happens. All automated verification (14-gate `npm test`) is green.
- No blockers for 15-04 onward. The `humanWind` second-leg gap noted above under Issues Encountered is available as a small follow-up item for whichever later plan next touches this file's narration.

---
*Phase: 15-narration-audit-fixes*
*Completed: 2026-07-28*

## Self-Check: PASSED

- FOUND: scripts/narration_flow_test.js
- FOUND: commit 16dadad (Task 1)
- FOUND: commit 775c44e (Task 2)
- FOUND: commit e6f6266 (Task 3)
