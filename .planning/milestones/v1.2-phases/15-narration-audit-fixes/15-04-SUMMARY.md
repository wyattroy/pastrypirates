---
phase: 15-narration-audit-fixes
plan: 04
subsystem: ui
tags: [narration, multiplayer, firebase, viewer-aware, battle, bulk-expansion]

# Dependency graph
requires:
  - phase: 15-narration-audit-fixes
    provides: "Plan 15-01's viewer-aware narration mechanism (describeFor/narrationSubjects/narrationVariants/pickNarrVariant/isLocalTo/NEUTRAL_VIEWER, flash()'s additive variants param) proven end to end on one line"
  - phase: 15-narration-audit-fixes
    provides: "Plan 15-02's narration hold-timing curves (msgHoldMs/botMsgHoldMs/chatBubbleHoldMs) — unaffected by this plan, confirmed via git diff --stat"
provides:
  - "NARR-04: EVENT_NARRATION.battle's coin-spoil clause split into genuine-bribe (>=5) and cleaned-out (<5) framings, derived read-only from spoil/spoilIng with no engine change"
  - "NARR-01 audit fix: src/orchestrator.js's expireShotClock() no longer hand-writes text duplicating EVENT_NARRATION.shotclockskip — both branches now await narrateLastEvent()"
  - "D-07/D-09: viewerSeat (4th param) + addressed branch on 16 single-subject EVENT_NARRATION entries (windmove, blownOut, sail, anchor, moored, blocked, anchorHold, tradewind, aground, shipwrecked, dock, sidebet, fish, finish, shotclock, shotclockskip); newround explicitly excluded"
  - "D-08: viewerSeat + independent per-seat addressed branches on the six two-party entries (parley, trade, battle, battleflee, bakeoff, blocked's second seat) and src/orchestrator.js's asyncBattle opening announcement"
  - "narrateCurrent()'s own ad-hoc turn-banner line (src/ui/util.js) converted to the neutral-plus-variants flash() shape"
affects: [15-05, 15-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "isLocalTo(seat, viewerSeat) gates a builder's addressed clause; the third-person clause it sits beside is left completely untouched (a sibling branch, never a replacement) — this is what keeps moored's byte-identical guarantee mechanical rather than a promise"
    - "Two-party addressed branches resolve per-seat independently (isLocalTo(e.a,...) / isLocalTo(e.b,...) as separate if/else-if arms), never as a single combined boolean, since only one of two distinct seats can ever be the viewer at once"
    - "A coin spoil's bribe/cleaned-out split parses only the leading integer of the existing e.spoil string (never a substring match), guarded with Number.isFinite so an absent/empty/non-numeric spoil always falls through to the least-claiming framing"

key-files:
  created: []
  modified:
    - src/ui/util.js
    - src/orchestrator.js
    - scripts/narration_test.js

key-decisions:
  - "The bribe/cleaned-out boundary is spoilN>=5 exactly (both real spoil-generation paths clamp the coin take to at most 5) — asserted at 0/1/2/4/5, with 4 and 5 the actual boundary pair"
  - "Cleaned-out wording ('has nothing left to give') is the real-prose form of the simulator-only '(all they had)' parenthetical the plan asked to fold into wording rather than ever carry as a trailing aside — the live path never produces that literal suffix, so nothing parses it"
  - "battle/battleflee/bakeoff/parley/trade/blocked are all DRAFT copy (D-04 review pending), following the exact comment convention EVENT_NARRATION.moored's own D-21 draft used"
  - "moored's addressed branch is added as a full sibling object (LA) alongside the untouched L object, rather than injecting isLocalTo() into the existing L values — this is what makes 'byte-identical to today' a structural guarantee, not a promise to keep two things manually in sync"
  - "bakeoff's loser gets its own addressed line ('takes it! Better luck next voyage.') rather than reusing the neutral text verbatim — otherwise narrationVariants() would silently omit that seat's entry (it filters out any addressed rendering that equals the neutral one), undershooting D-08's 'both finalists are addressed' intent"

requirements-completed: [NARR-01, NARR-04, NARR-05]

coverage:
  - id: D1
    description: "EVENT_NARRATION.battle's coin spoil renders a genuine-bribe line at a full 5-coin spoil and a distinct cleaned-out line below 5, with the boundary exactly between 4 and 5, the ingredient-spoil clause byte-identical to before, and an absent/empty/non-numeric spoil always falling through to the cleaned-out framing with no undefined/NaN token"
    requirement: "NARR-04"
    verification:
      - kind: unit
        ref: "scripts/narration_test.js — Task 1 'battle spoil bribe-vs-cleaned-out split' block (boundary at 0/1/2/4/5, ingredient-clause pin, absent/empty/non-numeric fallback)"
        status: pass
      - kind: unit
        ref: "npm test (14-gate chain including the 31-seed determinism verify)"
        status: pass
    human_judgment: false
  - id: D2
    description: "src/orchestrator.js's expireShotClock() no longer hand-writes text duplicating EVENT_NARRATION.shotclockskip — both branches await narrateLastEvent() instead, so the table is the single source of truth (NARR-01 audit finding)"
    requirement: "NARR-01"
    verification:
      - kind: unit
        ref: "shell: awk '/export async function expireShotClock/,/^export function watchClock/' src/orchestrator.js | grep -c 'narrateLastEvent()' -> 2; grep -cE 'flash\\(`' over the same range -> 0"
        status: pass
      - kind: unit
        ref: "scripts/narration_test.js — Task 1 shotclockskip table-entry rendering block"
        status: pass
    human_judgment: false
  - id: D3
    description: "16 single-subject EVENT_NARRATION entries each address their subject captain on that captain's own screen and render today's exact third-person text for every other viewer; newround gets no branch at all (D-09); moored's justDocked/home/unmoved-dock third-person text stays byte-identical and scripts/bot_storm_narration_test.js passes unmodified"
    requirement: "NARR-05"
    verification:
      - kind: unit
        ref: "scripts/narration_test.js — Task 2 generic per-key sweep (no-throw, non-empty, addressed-differs-from-neutral, newround identity, moored re-pin, caps/pops unchanged by addressing)"
        status: pass
      - kind: unit
        ref: "node scripts/bot_storm_narration_test.js (file byte-identical, git diff --stat empty)"
        status: pass
      - kind: unit
        ref: "npm test (14-gate chain)"
        status: pass
    human_judgment: false
  - id: D4
    description: "The six two-party entries (parley, trade, battle, battleflee, bakeoff, blocked) each address BOTH named captains independently, and narrationVariants() emits one deterministic {seat,html} entry per named seat (sorted ascending, stable across repeated calls, at most one per seat) — including src/orchestrator.js's asyncBattle opening announcement"
    requirement: "NARR-05"
    verification:
      - kind: unit
        ref: "scripts/narration_test.js — Task 3 block (3-way distinct rendering, narrationVariants ordering/determinism/at-most-one-per-seat across all six types, pickNarrVariant routing, both-seats-differ sweep)"
        status: pass
      - kind: unit
        ref: "shell: awk '/export async function asyncBattle/,/First to/' src/orchestrator.js | grep -cE '\\[\\{\\s*seat' -> 1"
        status: pass
      - kind: unit
        ref: "npm test (14-gate chain); git diff --stat src/engine/index.js empty; grep -c 'asym' src/orchestrator.js unchanged at 2"
        status: pass
    human_judgment: false
  - id: D5
    description: "Live two-tab multiplayer session: a battle between two remote seats reads addressed on each combatant's own tab and third-person for a spectator's tab; a bribe vs. a cleaned-out battle loss read as visibly different moments; the shot-clock skip narrates exactly once"
    verification: []
    human_judgment: true
    rationale: "Requires a real two-browser-tab Firebase session per the MP test harness (localStorage pp_id gotcha) — cannot be exercised headlessly. Deferred to end-of-phase human verification per config.json's human_verify_mode: end-of-phase, same deferral 15-01/15-02/15-03 already used."

# Metrics
duration: ~15min
completed: 2026-07-27
status: complete
---

# Phase 15 Plan 04: Battle Spoil Split + Second Person Across the Whole Narration Table Summary

**EVENT_NARRATION.battle's coin spoil now reads as a genuine bribe at a full 5 coins and as being cleaned out below that (NARR-04/D-12), every one of the 25 table entries that names a captain (bar the deliberately-untouched round header) now addresses that captain on their own screen while staying byte-identical for everyone else (D-07/D-08/D-09), and the shot-clock skip narrates once from the table instead of a hand-written duplicate (NARR-01 audit finding).**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-07-27T21:55:00-04:00 (approx.)
- **Completed:** 2026-07-27T22:06:44-04:00
- **Tasks:** 3
- **Files modified:** 3 (`src/ui/util.js`, `src/orchestrator.js`, `scripts/narration_test.js`)

## Accomplishments

- Split `EVENT_NARRATION.battle`'s coin-spoil clause (NARR-04/D-12): a full-5 coin spoil keeps today's genuine-bribe wording, unchanged; anything below 5 gets a new DRAFT cleaned-out line ("has nothing left to give"). Derived entirely from the event's existing `spoil`/`spoilIng` fields — the leading integer of `e.spoil` is parsed (never a substring match, and `e.spoil` is still never parsed for a pop icon), guarded so an absent/empty/non-numeric spoil always falls through to the cleaned-out (least-claiming) framing with no `undefined`/`NaN` token. `src/engine/index.js` untouched (`git diff --stat` empty).
- Removed the NARR-01 audit's flagged duplicate: `src/orchestrator.js`'s `expireShotClock()` used to hand-write two strings byte-identical to `EVENT_NARRATION.shotclockskip`; both branches now `await narrateLastEvent()` instead, so the table is the single source of truth and the duplicate can never silently drift again.
- Gave 16 single-subject `EVENT_NARRATION` entries (`windmove`, `blownOut`, `sail`, `anchor`, `moored`, `blocked`, `anchorHold`, `tradewind`, `aground`, `shipwrecked`, `dock`, `sidebet`, `fish`, `finish`, `shotclock`, `shotclockskip`) an optional 4th `viewerSeat` parameter and an addressed second-person branch via `isLocalTo(e.p, viewerSeat)`, following D-07's name-prefix-then-second-person shape plan 15-01 proved on `dodge`. `newround` (D-09) and `end`/`turn` were deliberately left alone. `moored`'s justDocked/home/unmoved-dock third-person strings stay byte-identical — the addressed branch is a full sibling object, not an edit to the existing one — and `scripts/bot_storm_narration_test.js` passes with the file completely unmodified.
- Converted `narrateCurrent()`'s own ad-hoc turn-banner line (the one narration string that lives directly in `util.js`, outside both the table and `flow.js`) to the neutral-plus-variants `flash()` shape, matching how plan 15-03 converted every other ad-hoc site.
- Gave the six two-party entries (`parley`, `trade`, `battle`, `battleflee`, `bakeoff`, and `blocked`'s second seat `e.other`) independent addressed branches for BOTH named captains (D-08) — each renders addressed to whichever of the two named seats is actually viewing, and the viewer-neutral rendering for a third party stays exactly what it was before this plan. `battle`'s spoil clause (from Task 1) now also resolves per-viewer: the winner reads "you take...", the loser reads "you had nothing left to give"/"you bribe your way out...".
- Converted `src/orchestrator.js`'s `asyncBattle` opening announcement to the neutral-plus-variants `flash()` form — one variant for the attacker, one for the defender.
- `scripts/narration_test.js` grew three headed blocks (one per task): the bribe-boundary + shotclockskip block, the generic per-key single-subject viewer-aware sweep (plus `newround`'s identity pin and a re-pin of the `moored` invariants), and the two-party ordering/determinism/at-most-one-per-seat block. One pre-existing assertion (15-01's own "a builder with no viewer branch (anchor) returns an empty array" pin) was updated to `newround` — `anchor` legitimately gained a branch in Task 2, so the no-branch example moved to the one entry (`newround`, D-09) guaranteed to stay branch-free.

## Task Commits

Each task was committed atomically:

1. **Task 1: NARR-04 — split the battle spoil clause, and delete the duplicated shot-clock line** - `cb98d6a` (feat)
2. **Task 2: Second person across the single-subject table entries (D-07/D-09)** - `a625e8d` (feat)
3. **Task 3: Second person for two-party events (D-08), and the payload ordering rule** - `219488e` (feat)

**Plan metadata:** committed separately per `<final_commit>` step (see STATE.md/ROADMAP.md commit).

## Files Created/Modified

- `src/ui/util.js` - Battle spoil bribe/cleaned-out split; `isLocalTo`-gated addressed branches on 21 more `EVENT_NARRATION` entries (16 single-subject + 5 additional two-party: parley/trade/battle/battleflee/bakeoff, `blocked`'s two-seat branch spans both tasks); `narrateCurrent()`'s ad-hoc turn-banner line converted to neutral-plus-variants
- `src/orchestrator.js` - `expireShotClock()`'s two hand-written narration strings replaced by `narrateLastEvent()`; `asyncBattle`'s opening announcement converted to neutral-plus-variants
- `scripts/narration_test.js` - Three new headed assertion blocks (Task 1 bribe boundary + shotclockskip, Task 2 generic single-subject sweep, Task 3 two-party ordering/determinism); one pre-existing 15-01 assertion (no-viewer-branch pin) repointed from `anchor` to `newround`

## Decisions Made

- The bribe/cleaned-out boundary is `spoilN>=5` exactly — both real spoil-generation paths (`src/orchestrator.js`'s `asyncBattle`, the offline-simulator-only `src/engine/index.js`) clamp the coin take to at most 5, so 5 is unambiguously "paid rather than gave up a crate" and anything below is "had nothing to bargain with." Asserted at 0/1/2/4/5.
- Cleaned-out wording ("has nothing left to give — {winner} takes what's left[: {spoil}]") is the real-prose form of the simulator-only `"(all they had)"` parenthetical the plan asked to fold into wording, not ever carry forward as a literal trailing aside — that literal suffix never reaches the live path anyway, per the plan's own `<research_correction>`.
- `moored`'s addressed branch is a full sibling object (`LA`) next to the untouched `L` object, not an `isLocalTo()` conditional threaded into the existing `L` values — this makes "byte-identical to today" a structural property of the diff, not a promise that has to be manually re-verified every time the entry is touched again.
- `bakeoff`'s loser gets its own commiseration line ("takes it! Better luck next voyage.") rather than reusing the neutral text verbatim for the addressed case — `narrationVariants()` filters out any addressed rendering that equals the neutral one, so a byte-identical loser line would have silently produced zero variant entries for that seat, undershooting D-08's "both finalists are addressed" intent.
- Every new/edited string across all three tasks is explicit DRAFT copy pending Wyatt's D-04 review pass, using the same comment convention `EVENT_NARRATION.moored`'s own D-21 draft lines established in Phase 14.

## Deviations from Plan

None — plan executed exactly as written. One in-scope adjustment surfaced during Task 2: the plan's own read_first section didn't flag that 15-01's harness had already pinned `anchor` as the canonical "no viewer branch" example in `scripts/narration_test.js`; since Task 2 explicitly gives `anchor` a branch, that pre-existing assertion was updated to `newround` (the one entry D-09 guarantees will never gain one) rather than left to bit-rot or silently deleted. Documented inline in the test file and above under Decisions Made.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 14 `npm test` gates green, including the 31-seed determinism verify (`git diff --stat src/engine/index.js` empty across all three commits).
- `scripts/bot_storm_narration_test.js` passes with the file itself completely unmodified (`git diff --stat` empty) — the `moored` byte-identity guarantee held mechanically across every task.
- `grep -c 'asym' src/orchestrator.js` unchanged at 2 both before and after this plan — the dead D-12a raider branch was neither touched nor removed, per the plan's own hard constraint.
- `Object.keys(EVENT_NARRATION).length` still 25 — no key added or removed; every table key still callable with no throw.
- 22 of the table's 25 keys now carry a `viewerSeat` parameter (1 from plan 15-01's `dodge` tracer + 21 from this plan's Tasks 2/3); `newround`, `end`, and `turn` remain deliberately branch-free.
- **Pending human verification (deferred to end-of-phase per `config.json`'s `human_verify_mode: end-of-phase`):** a live two-tab Chrome multiplayer session — confirm a battle between two remote seats reads addressed on each combatant's own tab and third-person on a spectator's tab, and confirm a bribe (5-coin) vs. a cleaned-out (<5-coin) battle loss read as visibly different moments in the yellow panel. Bundles with 15-01/15-02/15-03's own deferred two-tab checks for a single end-of-phase pass.
- No blockers for 15-05/15-06.

---
*Phase: 15-narration-audit-fixes*
*Completed: 2026-07-27*

## Self-Check: PASSED

- FOUND: src/ui/util.js
- FOUND: src/orchestrator.js
- FOUND: scripts/narration_test.js
- FOUND: .planning/phases/15-narration-audit-fixes/15-04-SUMMARY.md
- FOUND: commit cb98d6a (Task 1)
- FOUND: commit a625e8d (Task 2)
- FOUND: commit 219488e (Task 3)
