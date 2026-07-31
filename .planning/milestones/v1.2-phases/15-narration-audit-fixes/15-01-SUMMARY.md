---
phase: 15-narration-audit-fixes
plan: 01
subsystem: ui
tags: [narration, multiplayer, firebase, viewer-aware, tracer]

# Dependency graph
requires: []
provides:
  - "DOM-free narration test harness (scripts/narration_test.js), wired into npm test as the 13th gate"
  - "Six new src/ui/util.js exports: NEUTRAL_VIEWER, isLocalTo, describeFor, narrationSubjects, narrationVariants, pickNarrVariant"
  - "Viewer-aware EVENT_NARRATION.dodge (D-07 tracer line) — proves the mechanism end to end before the bulk NARR-02..06 rewrite"
  - "Additive rooms/{code}/narr payload widening (variants field) — backward-compatible both skew directions"
affects: [15-02, 15-03, 15-04, 15-05, 15-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "describeFor(e, viewerSeat) as the viewer-aware core; describe(e) = describeFor(e, undefined) — a thin wrapper so every existing captain's-log consumer personalises per client for free"
    - "isLocalTo(seat, viewerSeat): null/undefined viewerSeat delegates to seatLocal() (today's live appState.mySeat read); a real value (including NEUTRAL_VIEWER=-1) compares directly"
    - "narrationVariants(e): computed once per broadcast — viewer-neutral default via NEUTRAL_VIEWER, plus a {seat,html} entry only where the addressed rendering actually differs"
    - "pickNarrVariant(payload, seat): the one function both the host's own render and every guest's watcher select through — tolerant of null payload, missing/empty variants, null seat"
    - "additive Firebase payload widening: variants omitted entirely from the written object when empty/absent, so the common-case write stays byte-identical"

key-files:
  created:
    - scripts/narration_test.js
  modified:
    - src/ui/util.js
    - src/ui/panel.js
    - src/orchestrator.js
    - src/net/writers.js
    - package.json

key-decisions:
  - "dodge's addressed line is DRAFT copy pending Wyatt's D-04 review, same convention as moored's own D-21 draft comment"
  - "NEUTRAL_VIEWER is the number -1 (not a Symbol) so it round-trips through the same numeric-seat comparisons as a real seat index, and satisfies the plan's 'type function/number' export check"
  - "Test emoji chosen deliberately outside shared/index.js's EMOJI_IMG map (🐙, not a pirate-flag/anchor/etc glyph already wired to custom art) — otherwise describe()'s own emojify() pass silently swaps it for an <img>, which would have broken the NARR-05 encoding assertion for reasons unrelated to name encoding"

patterns-established:
  - "Wave-0 DOM-free baseline harness pattern: pin pre-change invariants (25-key inventory, per-builder no-throw, moored baseline) in the same script that will grow the viewer-aware/end-to-end assertions in later waves"

requirements-completed: [NARR-05]

coverage:
  - id: D1
    description: "DOM-free narration harness pins the pre-change 25-key EVENT_NARRATION baseline (every builder callable with no throw, moored justDocked/home/no-reason invariants, NARR-05 multi-byte/emoji name encoding) and is wired into npm test"
    requirement: "NARR-05"
    verification:
      - kind: unit
        ref: "scripts/narration_test.js (assertions 1-4) — node scripts/narration_test.js"
        status: pass
      - kind: unit
        ref: "npm test (13-gate chain including narration_test.js)"
        status: pass
    human_judgment: false
  - id: D2
    description: "EVENT_NARRATION.dodge renders name-prefix + second-person for its subject seat, and today's exact third-person text for every other viewer (including an unset appState.mySeat)"
    requirement: "NARR-05"
    verification:
      - kind: unit
        ref: "scripts/narration_test.js — dodge describeFor/narrationVariants assertions"
        status: pass
    human_judgment: false
  - id: D3
    description: "rooms/{code}/narr payload carries variants only when non-empty; every client (host's own screen via netNarrate, every guest via watchNarr) selects its own line through pickNarrVariant; both version-skew directions (old host/new guest, new host/old guest) degrade to the payload's own html"
    requirement: "NARR-05"
    verification:
      - kind: unit
        ref: "scripts/narration_test.js — fake-db netSetNarr + pickNarrVariant chain assertions"
        status: pass
      - kind: other
        ref: "node scripts/module_graph_check.js && node scripts/ui_contract_check.js && node scripts/no_undef_check.js"
        status: pass
    human_judgment: false
  - id: D4
    description: "Live two-tab multiplayer session: the subject seat's own tab reads the addressed form in the yellow message box; the other tab reads the third-person form for the same moment; both tabs' captain's logs match their own box"
    verification: []
    human_judgment: true
    rationale: "Requires a real two-browser-tab Firebase session per the MP test harness (localStorage pp_id gotcha) — cannot be exercised headlessly. Deferred to end-of-phase human verification per config.json's human_verify_mode: end-of-phase."

# Metrics
duration: 12min
completed: 2026-07-28
status: complete
---

# Phase 15 Plan 01: Viewer-Aware Narration Tracer Summary

**DOM-free narration test harness plus one end-to-end viewer-aware narration line (EVENT_NARRATION.dodge) proving the whole broadcast/personalisation mechanism — table builder → viewer-neutral default + per-seat variants → flash() → netNarrate → the widened `rooms/{code}/narr` payload → per-client `pickNarrVariant` selection — before the bulk NARR-02..06 rewrite touches the other ~44 narration lines.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-07-28T01:00:26Z
- **Completed:** 2026-07-28T01:12:11Z
- **Tasks:** 2 (Wave 0 harness + TRACER)
- **Files modified:** 5 (1 created: `scripts/narration_test.js`; 4 modified: `src/ui/util.js`, `src/ui/panel.js`, `src/orchestrator.js`, `src/net/writers.js`; `package.json` also modified in Task 1)

## Accomplishments

- Created `scripts/narration_test.js`, a DOM-free harness following the house `bot_storm_narration_test.js` convention, wired into `npm test` as the 13th gate. It pins the 25-key `EVENT_NARRATION` inventory, every builder's no-throw contract, the `moored` justDocked/home/no-reason invariants, and the NARR-05 multi-byte/emoji captain-name encoding guarantee.
- Added six new exports to `src/ui/util.js`: `NEUTRAL_VIEWER`, `isLocalTo`, `describeFor`, `narrationSubjects`, `narrationVariants`, `pickNarrVariant` — the whole viewer-aware seam.
- Converted `describe(e)` into a thin wrapper over `describeFor(e, undefined)`, so every existing consumer (the captain's log, `syncLogLines()`) now personalises per client for free, with zero observable behavior change when `appState.mySeat` is unset.
- Gave `EVENT_NARRATION.dodge` a DRAFT second-person addressed line (D-07), byte-identical third-person text for every other viewer.
- Widened `flash()` (additive 4th `variants` param), `netNarrate`/`netBroadcast` (additive 2nd `variants` param), and `netSetNarr` (additive 5th `variants` param, omitted from the written payload when empty) — all purely additive, no existing call site's behavior changed.
- `narrateLastEvent()` now builds the broadcast payload from the viewer-neutral rendering plus `narrationVariants()`, never the ambient `appState.mySeat`-flavored text — so the host never accidentally leaks its own personalised phrasing into the broadcast `html`.
- `netNarrate` (host's own screen) and `watchNarr` (every guest) both now select their own line via `pickNarrVariant`, proving the "host reads its own broadcast the same way every guest does" invariant.

## Task Commits

Each task was committed atomically:

1. **Task 1: Wave 0 — DOM-free narration harness pinning today's baseline** - `268efcc` (test)
2. **Task 2: TRACER — viewer-aware narration, one line, end to end** - `c67c82d` (feat)

**Plan metadata:** committed separately per `<final_commit>` step (see STATE.md/ROADMAP.md commit).

## Files Created/Modified

- `scripts/narration_test.js` - DOM-free harness: Wave 0 baseline pins + Task 2's end-to-end viewer-aware chain assertions
- `src/ui/util.js` - Six new exports (`NEUTRAL_VIEWER`, `isLocalTo`, `describeFor`, `narrationSubjects`, `narrationVariants`, `pickNarrVariant`); `describe()` refactored to `describeFor(e, undefined)`; `EVENT_NARRATION.dodge` gained a viewer-aware addressed branch
- `src/ui/panel.js` - `flash()` gained an additive 4th `variants` param; `narrateLastEvent()` builds the broadcast payload from the neutral rendering + variants
- `src/orchestrator.js` - `netNarrate`/`netBroadcast` pass `variants` through; both select their own render via `pickNarrVariant`; `watchNarr()` selects per-client via `pickNarrVariant`
- `src/net/writers.js` - `netSetNarr` gained an additive 5th `variants` param, omitted from the payload when empty
- `package.json` - `narration_test.js` added as the 13th gate in the `test` script chain

## Decisions Made

- `dodge`'s addressed second-person copy (`"{name} — you pay 1🌕 to anchor safely!"`) is explicitly marked DRAFT in an adjacent code comment, pending Wyatt's D-04 review pass — same convention Phase 14's `moored`/D-21 draft lines used.
- `NEUTRAL_VIEWER` is the number `-1`, not a `Symbol` — the plan's own acceptance criteria expect every one of the six new exports to be `function` or `number` typed; `-1` also can never collide with a real 0-3 seat index.
- The NARR-05 encoding test's fabricated emoji (🐙) was deliberately chosen from OUTSIDE `shared/index.js`'s `EMOJI_IMG` map. An earlier attempt used the pirate-flag emoji, which IS in that map — `describe()`'s own `emojify()` pass silently swapped it for an `<img>` tag, which would have broken the "name survives intact" assertion for a reason unrelated to narration/name encoding. Documented inline in the test file.

## Deviations from Plan

None — plan executed exactly as written. One minor documentation note: the plan's acceptance criterion `grep -o 'node scripts/' package.json | wc -l` returning `13` doesn't hold literally against the whole file (it returns `15`), because `package.json` also has two unrelated `test:determinism`/`test:determinism-diff` npm scripts each containing one more `node scripts/` occurrence outside the `test` chain. The actual requirement — "13 gates in the test chain" — is satisfied and verified directly (`node -e` count against `pkg.scripts.test` returns exactly `13`).

## Issues Encountered

None beyond the emoji/encoding test-design issue documented above under Decisions Made, which was fixed inline before the harness was ever committed (not a deviation from committed code — no incorrect commit landed).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The viewer-aware mechanism (`describeFor`/`narrationSubjects`/`narrationVariants`/`pickNarrVariant`/`isLocalTo`/`NEUTRAL_VIEWER`) is proven end-to-end on one line and ready for the bulk NARR-02..06 rewrite across the remaining ~44 narration lines in later plans of this phase.
- **Pending human verification (deferred to end-of-phase per `config.json`'s `human_verify_mode: end-of-phase`):** the plan's own `<verify>` two-tab Chrome multiplayer session — confirm the subject seat's own tab reads the addressed form in the yellow message box while the other tab reads the third-person form for the same moment, and that both tabs' captain's logs match their own box. All automated verification (13-gate `npm test`, `module_graph_check`, `ui_contract_check`, `no_undef_check`, the DOM-free end-to-end chain assertions) is green.
- No blockers for 15-02 onward.

---
*Phase: 15-narration-audit-fixes*
*Completed: 2026-07-28*

## Self-Check: PASSED

- FOUND: scripts/narration_test.js
- FOUND: .planning/phases/15-narration-audit-fixes/15-01-SUMMARY.md
- FOUND: commit 268efcc (Task 1)
- FOUND: commit c67c82d (Task 2)
