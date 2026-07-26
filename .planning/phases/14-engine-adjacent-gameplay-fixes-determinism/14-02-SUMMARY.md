---
phase: 14-engine-adjacent-gameplay-fixes-determinism
plan: 02
subsystem: ai
tags: [bot-ai, hail, parley, ui-tier, determinism]

requires:
  - phase: 14-engine-adjacent-gameplay-fixes-determinism
    provides: "14-01's scripts/determinism_diff.js (used here to confirm the 19/30 divergence count is unchanged) and D-18's leeward() fix (left untouched by this plan)"
provides:
  - "rankHailTargets(g,p,ing), priceHailOffer(g,p,seller,ing), hailWorthIt(g,p,ing) — three pure, DOM/RNG-free exports in src/ui/flow.js implementing D-04/D-06/D-07"
  - "botTurn's hail block restructured so an offer reaching the table spends the bot's one action, whether accepted, countered, or refused (D-02/D-24), with a shot-clock guard before any ing/coins mutation"
  - "scripts/hail_ranking_test.js — DOM-free unit coverage for the three helpers, written first and proven RED before implementation"
  - "EVENT_NARRATION.parley branches on kind:\"hail\" — a refused hail's closing line names the action as spent (D-01/D-24, DRAFT copy queued for 14-06)"
affects: [14-06]

tech-stack:
  added: []
  patterns:
    - "Pure-helper extraction for testability: rankHailTargets/priceHailOffer/hailWorthIt take `g` as an explicit param, read no appState, and never call g.r(), so a real Game instance can be unit-tested without DOM/Firebase mocking"
    - "Action-cost-on-attempt, not on-completion: p.lastOffer and a local `hailed` flag are committed the instant an offer reaches the table (before the await), mirroring humanTrade's own 'an offer costs the action, win or lose' rule (:336/:485)"

key-files:
  created:
    - scripts/hail_ranking_test.js
  modified:
    - src/ui/flow.js
    - src/ui/util.js

key-decisions:
  - "D-06 rule 2's 'hurts least' proxy uses the essential idiom already in humanTrade (q.recipe.includes(ing) && cnt(q.ing,ing)<=1), per <planner_corrections> — NOT RESEARCH.md's original needs(q).includes(ing) proxy, which is provably constant-false for any holder"
  - "Counter-offer raises are three steps above the priced offer (price+1/+2/+3), filtered by p.coins - HAIL_RESERVE, replacing the old flat [6,7,8,9,10] ladder capped only by p.coins"
  - "The action-cost commit (p.lastOffer + hailed=true) happens immediately before the first ask() prompt, not after it resolves, so a shot-clock expiry mid-hail still correctly counts as a spent action with no partial trade applied"
  - "The refused-hail narration clause is explicitly drafted, not final — flagged in-line for Wyatt's 14-06 approval alongside the moored variants, per D-01/D-14/D-27 precedent"

patterns-established:
  - "The '/* ================= bot hail (AI-01) ================= */' section header groups the three pure helpers directly above botTurn, matching the file's existing section-header comment idiom"

requirements-completed: [AI-01]

coverage:
  - id: D1
    description: "rankHailTargets ranks human holders by spares (desc), then least-hurt (essential idiom), then proximity as a tiebreaker only, then seat index for a total order; excludes bots, finished players, and non-holders"
    requirement: "AI-01"
    verification:
      - kind: unit
        ref: "scripts/hail_ranking_test.js (D-06 rule 1/2/3/total-order/exclusions cases)"
        status: pass
    human_judgment: false
  - id: D2
    description: "priceHailOffer scales the offer on both the bot's desperation and the seller's cost-to-give-up, clamped to never exceed p.coins - HAIL_RESERVE"
    requirement: "AI-01"
    verification:
      - kind: unit
        ref: "scripts/hail_ranking_test.js (desperation, seller-cost, and bankruptcy-clamp cases)"
        status: pass
    human_judgment: false
  - id: D3
    description: "hailWorthIt gates the hail on D-04's selectivity rule — purse covers the base offer with the reserve intact, AND either the ingredient is among the bot's last two needs or it is boxed in"
    requirement: "AI-01"
    verification:
      - kind: unit
        ref: "scripts/hail_ranking_test.js (hailWorthIt true/false cases including the boxed-in escape hatch)"
        status: pass
    human_judgment: false
  - id: D4
    description: "botTurn's hail block: an offer reaching the table (accepted, countered, or refused) always spends the bot's one action — the chooseAction()/action-selector call never runs in the same turn a hail was attempted"
    requirement: "AI-01"
    verification:
      - kind: unit
        ref: "node -e structural probe asserting the `hailed` flag precedes the action selector and if(hailed){...return;} exists (Task 2 <verify>)"
        status: pass
      - kind: manual_procedural
        ref: "Live multiplayer/solo playtest observing the narration log for a bot hail followed immediately by turn end, never a second dock/attack/trade/fish"
        status: unknown
    human_judgment: true
    rationale: "The structural unit probe proves the code path is wired correctly, but only a live playthrough can confirm the fix reads correctly to a player end-to-end — deferred to the phase's overall UAT pass."
  - id: D5
    description: "A shot-clock expiry mid-hail (appState.turnExpired true after either prompt resolves) leaves no partial trade applied — neither party's ing/coins change and the action selector is not reached"
    requirement: "AI-01"
    verification: []
    human_judgment: true
    rationale: "This is the plan's own backstop-verification truth — it requires forcing a live shot-clock expiry mid-prompt, which is not exercisable by a DOM-free unit script; left for the phase's manual UAT pass."
  - id: D6
    description: "A refused hail's narration names the action as spent (draft copy), distinct from both a human's plain refused parley and an accepted hail"
    requirement: "AI-01"
    verification:
      - kind: unit
        ref: "node -e probe asserting plain !== hail(refused), hail.length > plain.length, struck !== hail (Task 3 <verify>)"
        status: pass
    human_judgment: true
    rationale: "The drafted copy is explicitly provisional per D-14/D-27 — Wyatt approves or edits it in 14-06 before the phase closes."

duration: 25min
completed: 2026-07-26
status: complete
---

# Phase 14 Plan 2: Bot Hail — Action Cost, Deliberate Targeting, Sweetened Offers Summary

**Bots now spend their one action on a hail exactly like a human's Parley — ranked targeting (spares first, least-hurt tiebreak, proximity last), a combined desperation+seller-cost offer clamped to a reserve, and a refused-hail line that visibly names the cost paid.**

## Performance

- **Duration:** 25 min
- **Completed:** 2026-07-26
- **Tasks:** 3/3
- **Files modified:** 3 (2 modified, 1 created)

## Accomplishments
- `scripts/hail_ranking_test.js` — 18 DOM-free unit checks written FIRST (proven RED: `SyntaxError: does not provide an export named 'hailWorthIt'`), covering D-06's three ranking rules plus total order and exclusions, D-07's desperation/seller-cost/clamp behavior, D-04's selectivity gate including the boxed-in escape hatch, and a dedicated purity/idempotency check confirming zero `g.r()` calls across repeated identical evaluations.
- `rankHailTargets`, `priceHailOffer`, `hailWorthIt` — three new pure exports in `src/ui/flow.js`, placed directly above `botTurn` behind a `/* ================= bot hail (AI-01) ================= */` header, implementing D-04/D-06/D-07 exactly per the plan's `<planner_corrections>` (the `essential` idiom from `humanTrade`, not RESEARCH's broken `needs(q)` proxy).
- `botTurn`'s hail block restructured: the first-match `g.players.find(...)` lookup and flat 5-coin offer/counter-ladder are gone, replaced by the ranked/priced/eligibility helpers. `p.lastOffer` and a local `hailed` flag are committed the instant an offer reaches the table (before the `await`), so the cooldown and the action cost land whether the human accepts, counters, or refuses (D-24). `if(appState.turnExpired)return;` guards both prompts before any `ing`/`coins` mutation. `if(hailed){await botBeat();return;}` now precedes the action selector, so a hailing bot never also docks/attacks/trades/fishes in the same turn (D-02) — the double-action bug AI-01 was filed against is closed.
- `EVENT_NARRATION.parley` branches on the new `kind:"hail"` tag: a refused hail appends a short closing clause naming the turn as spent; a human's plain parley (no `kind` field) renders byte-identical to before; an accepted hail keeps the existing "deal struck!" wording. The copy is explicitly drafted, not final.
- Confirmed the plan's own no-perturbation claim: `node scripts/determinism_diff.js` still reports `divergentSeeds=19/30` after all three tasks — identical to 14-01's baseline — proving this UI-tier-only plan did not touch engine behavior. `git diff --name-only` per task confirmed `src/engine/index.js` was never staged.

## Task Commits

Each task was committed atomically:

1. **Task 1: Pure hail targeting, pricing and eligibility, tested first (D-04, D-06, D-07)** - `a9f247a` (test+feat)
2. **Task 2: The hail becomes the bot's one action (D-02, D-03, D-24, D-25)** - `d9d5f79` (feat)
3. **Task 3: Show the price being paid — the refused-hail closing line (D-01, D-24)** - `1898ca3` (feat)

_No formal TDD-frontmatter task in this plan, but Task 1 followed the RED→GREEN discipline explicitly: the test script was written and run to a failing import error before the three exports existed._

## Files Created/Modified
- `scripts/hail_ranking_test.js` - New DOM-free unit test script (18 checks). Uses `loadEngine()` + `roundCfg([...])` to construct a real `Game`, then pokes player fields directly — mirrors 14-01's own constructed-instance precedent, no DOM/Firebase mocking.
- `src/ui/flow.js` - Adds `rankHailTargets`/`priceHailOffer`/`hailWorthIt` exports plus `HAIL_BASE_PRICE`/`HAIL_RESERVE` module constants above `botTurn`; restructures `botTurn`'s hail block (ranked targeting, priced offer, action-cost-on-attempt, shot-clock guard, `kind:"hail"` tag, early return before the action selector).
- `src/ui/util.js` - `EVENT_NARRATION.parley` branches on `e.kind==="hail"&&!e.ok` to append the drafted closing clause; unchanged for every other `parley` event.

## Decisions Made
- Used the `essential` idiom (`q.recipe.includes(ing) && g.cnt(q.ing,ing)<=1`) for D-06 rule 2, per the plan's explicit `<planner_corrections>` override of RESEARCH.md's broken `needs(q).includes(ing)` proxy (verified `grep -c 'needs(q).includes(ing)' src/ui/flow.js` returns 0).
- Kept the double `botBeat()` pacing beat exactly as the plan specifies (one inside the hail loop before `break`, one in the outer `if(hailed){await botBeat();return;}`) rather than collapsing them — the plan's `<action>` text describes this exact structure and doesn't ask for consolidation; not treated as a deviation since the plan is explicit and unambiguous here.
- Rephrased one in-code comment (originally read "...chooseAction() below is shared...") because its literal substring "chooseAction" would have satisfied the Task 2 structural probe's `indexOf("chooseAction")` check BEFORE the `hailed` flag's own first occurrence, producing a false verification failure. Changed to "the action selector below is shared..." — same meaning, no code-behavior change, purely to keep the probe's substring search accurate. Documented here as a minor authoring correction, not a plan deviation (no plan requirement was altered).

## Deviations from Plan

None - plan executed exactly as written, task-for-task and helper-signature-for-helper-signature. The one comment rewording above is a wording-only fix to keep an automated verify probe accurate, not a change in behavior or scope.

## Issues Encountered

The Task 2 structural verify probe initially failed with "the hailed early-return does not precede the action selector" — root-caused to a comment I added containing the literal substring "chooseAction" earlier in the function body than the `hailed` flag declaration, which the probe's naive `indexOf` search matched. Fixed by rewording the comment (see Decisions Made); re-ran the probe and confirmed it passes.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `rankHailTargets`/`priceHailOffer`/`hailWorthIt` are exported from `src/ui/flow.js` and available for 14-03's bot storm-stepping work (independent — no shared surface) and for 14-06's copy-approval pass, which should present the refused-hail line drafted in Task 3 alongside the moored-reason variants for Wyatt's edit (per D-01/D-14/D-27).
- The determinism corpus's divergence count (19/30, all attributable to 14-01's D-18 leeward fix) is unchanged by this plan — confirmed via `scripts/determinism_diff.js`. **`npm test`'s determinism gate stays RED by design until 14-04's `--capture` re-record; do not "fix" it by reverting 14-01's engine change.** The other 8 `npm test` gates (`engine_contract_check.js`, `dlog_replay_test.js`, `net_registry_test.js`, `net_contract_check.js`, `state_contract_check.js`, `module_graph_check.js`, `ui_contract_check.js`, `no_undef_check.js`) plus the new `scripts/hail_ranking_test.js` all pass.
- Two of this plan's `must_haves` truths (the shot-clock-interrupt backstop, and the live "no second action" playtest observation) are structurally proven by unit probes but not yet confirmed by an actual live playthrough — flagged as `human_judgment: true` in this SUMMARY's `coverage:` block for the phase's eventual manual UAT pass (likely alongside 14-06's Safari/Chrome re-verification).
- No blockers for 14-03 (bot storm-stepping) or 14-04 (determinism re-record) — this plan's changes are fully independent of both.

---
*Phase: 14-engine-adjacent-gameplay-fixes-determinism*
*Completed: 2026-07-26*

## Self-Check: PASSED

- FOUND: scripts/hail_ranking_test.js
- FOUND: src/ui/flow.js
- FOUND: src/ui/util.js
- FOUND: .planning/phases/14-engine-adjacent-gameplay-fixes-determinism/14-02-SUMMARY.md
- FOUND: commit a9f247a (Task 1)
- FOUND: commit d9d5f79 (Task 2)
- FOUND: commit 1898ca3 (Task 3)
- FOUND: commit 223716e (SUMMARY.md)
