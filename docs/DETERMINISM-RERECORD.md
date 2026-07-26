# Determinism Fixture Re-Record — Phase 14

D-16's surviving requirement: document what changed and why alongside the new fixtures. This file
is that record. It is started here, in 14-01, while the tracer's evidence is fresh, and completed
in 14-04 immediately before the single `--capture` run that rewrites the corpus.

## 1. Why the corpus is being re-recorded

Three decisions perturb the 30-seed golden fixture corpus (`scripts/fixtures/determinism/`). All
three land BEFORE the single `--capture` run in 14-04. The corpus is re-recorded exactly once.

- **D-15** — the all-bot simulator's `takeTurn` currently applies only the storm's first gust (2
  squares); the live game applies both gusts (up to 4 squares). Aligning the simulator to the real
  game means rolling `windNow2` in `play()` and applying a second `windPush`, which consumes one
  additional `this.r()` call per stormy round — every seed with at least one storm produces a
  different RNG sequence from that round forward. (Landed in 14-03.)
- **D-18** — `leeward()` only checked `isIsland()`, so Tortuga (home) cast no wind shadow, unlike
  every other island. Fixed in 14-01 (this plan): the upwind square is now also tested against
  `isHome()`. This changes `sailBudget()` (9 → 7) for any ship immediately downwind of home, which
  changes bot pathfinding (`stepToward`'s Dijkstra), which cascades into `dock`/`trade`/`fish`/
  `battle` events — not just storm events. This is the single largest fixture-perturbing change in
  the phase.
- **D-21** — the `moored` event gains a `reason` field (`"justDocked"|"dock"|"home"`) so the
  narration can distinguish three previously-conflated causes. Adding a field to the event changes
  `JSON.stringify(e)` the moment any `moored` event fires, so every seed with at least one `moored`
  event gets a new hash. (Landed in 14-03.)

## 2. What the old oracle proved, and what is lost

The current baseline (captured once, Phase 7) proves byte-for-byte "nothing about engine behavior
changed" for any commit since capture, over 30 seeds covering every required mechanic. After
`--capture` runs in 14-04, that specific guarantee — "identical to the Phase 7 baseline" — no
longer exists; the new corpus becomes the guarantee going forward, for changes after 14-04.

**Recovery path if this needs to be undone:** revert the D-15/D-18/D-21 engine changes AND restore
`scripts/fixtures/determinism/manifest.json` + all `seed-*.jsonl` files from git history (the
commit immediately before 14-04's `--capture`). Both halves are required — reverting the code alone
leaves fixtures that no longer match, and restoring old fixtures alone re-introduces stale-baseline
false failures against the still-changed code.

## 3. Tracer findings (D-18 alone)

Measured this session by `node scripts/determinism_diff.js --json`, run immediately after landing
the D-18 `leeward()` fix and before any other engine change in this phase:

- **Divergent seeds: 19 of 30.** 11 seeds are byte-identical to the Phase 7 baseline (12348, 12350,
  12355, 12356, 12358, 12359, 12360, 12362, 12367, 12369, 12371) — every seed where no player ever
  sat leeward of home in a way that changed a routing decision.
- **Structural divergences: 19 of 30** — identical to the divergent-seed count; every divergence
  found this run is structural (no seed's only differing key was in an ignored-additive set, since
  `--ignore-keys=wind2` reports the same 19 — `wind2` never diverges yet in this plan's scope,
  because D-15 has not landed).
- **Divergent-line histogram by event type** (`summary.byEventType`, line counts, not seed counts):
  `turn` 1004, `state`-bearing `tokens` deltas aside, `wind` 2004 (key-delta, see below) —
  concretely by event `t`: `turn` 1004, `sail` 706, `fish` 609, `dock` 315, `newround` 234,
  `battle` 52, `windmove` 63, `finish` 23, `end` 21, `__final__` 21, `battleflee` 13, `blownOut` 22,
  `moored` 29, `trade` 32, `tradewind` 27, `dodge` 10, `blocked` 8, `bakeoff` 3, `anchor` 1,
  `aground` 1, `shipwrecked` 1.
- **Divergent-line histogram by differing key** (`summary.byKey`): `state` 3181, `tokens` 2547,
  `t` 2419, `wind` 2004, `p` 2143, `round` 1621, `storm` 1174, `heads` 1160, `got` 550, `ing` 488,
  `dir` 357, `windStreak` 349, `winner` 149, `flips` 115, `rounds` 115, `downwind` 114, `d` 113,
  `spoil` 92, `spoilIng` 92, `b` 65, `gave` 61, `kind` 61, `players` 28, `a` 176, `other` 17.
  `state`/`tokens`/`round`/`wind`/`storm` dominate because every event carries a full per-player
  state snapshot (`Game.ev()`) — once one player's `pos` diverges from a routing change, every
  subsequent event's `state` field diverges too, for the rest of that seed's playthrough. This is
  expected cascade, not 19 independent bugs.
- **No divergence in `battle`/`trade`/`dock`/`fish` event TYPES beyond what routing change would
  produce** — the presence of these types in the histogram is expected (D-18 changes where/when
  bots dock, trade, and fight by changing their pathfinding cost), not a sign of an unrelated
  regression. No new event type appears in one run and not the other, and no seed shows a
  divergence isolated to an event type storm-routing cannot plausibly touch (e.g., a divergence
  confined only to `bakeoff`/`finish` with nothing upstream would be a red flag; none was observed).

## 3b. 14-03 findings (D-15 + D-21 landed, on top of D-18)

Measured this session by `node scripts/determinism_diff.js --json`, run immediately after landing
both of this plan's engine changes (D-15's two-gust simulator alignment, D-21's `moored` `reason`
field) on top of 14-01's D-18 `leeward()` fix. All three fixture-perturbing decisions for this
phase are now in the tree, before the single `--capture` in 14-04.

- **Divergent seeds: 30 of 30** (up from 19/30 after D-18 alone) — every seed now diverges.
  Expected: D-15's `windNow2` roll consumes one additional RNG draw on every stormy round, in
  every seed that ever rolls a storm across a 150-round-cap playthrough, which is effectively all
  of them.
- **Structural divergences: 30 of 30.** `preStormStructuralFailures: 27` — 27 of the 30 seeds now
  diverge before their first storm round, same D-18 wind-shadow/routing mechanism 14-01 already
  documented in Section 4 below (unchanged by this plan; D-15/D-21 only ever fire on/after a storm
  round, so they cannot be the cause of a *pre-storm* divergence — they can only widen the
  divergence further from that seed's first storm round onward).
- **`wind2` is now genuinely attributed as additive**, not absent: `summary.byKey.wind2: 7816`
  lines — every event in every seed gains a `wind2` field (`null` on calm rounds, a direction
  letter on stormy ones), confirmed via `determinism_diff.js --ignore-keys=wind2`, which still
  reports all 30 divergent seeds with the SAME per-seed divergence count as the un-ignored run —
  i.e. `wind2`'s presence never changes the divergent/non-divergent verdict for any seed, exactly
  as expected for a purely additive serialization delta layered on top of D-18's real behavioral
  cascade.
- **`reason` (D-21) is attributed and small**: `summary.byKey.reason: 157` lines, `byEventType.moored:
  159` — every `moored` event across the 30-seed corpus now carries a `reason` in
  `{justDocked, dock, home}`; 157 of 159 moored events show a `reason` key-delta against the old
  (reason-less) fixture line (2 already happened to diverge on other keys in the same line and so
  don't separately register `reason` as "new" in that line's diff — still correctly tagged, just
  not double-counted).
- **No divergence confined to an event type storm/wind-routing cannot plausibly touch.** The full
  `byEventType` histogram (`newround`, `turn`, `sail`, `fish`, `battle`, `dock`, `anchor`,
  `blocked`, `windmove`, `dodge`, `blownOut`, `moored`, `battleflee`, `trade`, `finish`,
  `tradewind`, `end`, `__final__`, `anchorHold`, `bakeoff`, `aground`) is the same cascade shape
  14-01 already found for D-18 alone (state/tokens/round/wind/storm dominate because one player's
  `pos` diverging cascades through every subsequent event's full-state snapshot) — no new event
  TYPE appears that wasn't already explainable, and no seed's divergence is isolated to
  `battle`/`trade`/`dock`/`fish` alone with nothing storm/routing-related upstream.
- **D-26's replacement criterion (attribution, not narrowness) is satisfied for both of this
  plan's changes**: `wind2`'s additive nature is directly provable via `--ignore-keys=wind2`
  (same divergent-seed count with or without it — an additive field, not a behavioral one), and
  `reason`'s scope is directly bounded to `moored` events only (`byEventType.moored` count and
  `byKey.reason` count are of the same order, ~157-159, versus thousands of `state`/`tokens`/`wind`
  deltas from the D-18 cascade) — neither change introduces an unexplained divergence outside its
  own known mechanism.

## 4. The D-26 criterion, honestly stated

D-26's literal criterion: no seed diverges before its first storm round (`preStormStructuralDivergence`
must be `false` for every seed). **Implemented exactly as worded, run for real, and it FAILS for
16 of the 19 divergent seeds:** 12345, 12346, 12347, 12349, 12352, 12354, 12361, 12363, 12364,
12365, 12366, 12368, 12370, 12372, 12373, 12374 all show `preStormStructuralDivergence: true`.
Only 3 divergent seeds (12351, 12353, 12357) diverge exclusively from their first storm round
onward.

**The measured mechanism, exactly as anticipated in planning:** every player spawns on a Tortuga
berth (`src/engine/index.js:206-209`, one of the four squares immediately N/S/E/W of home), so from
round 1 at least one player sits directly downwind of home whenever the wind blows from that
direction. `leeward()` — and therefore `sailBudget()` — is a **wind** effect that applies every
round, not a **storm** effect; D-18 makes it apply correctly for the first time, and it bites on
calm rounds exactly as much as stormy ones. Concretely, seed 12345's first structural divergence is
at line 7, a `sail` event in round 1 with `storm:false` — a bot's position differs by one square
(`[9,5]` vs `[9,6]`) purely from the corrected sail budget, 17 lines before that seed's first storm
event at line 24. Three seeds (12354, 12366, 12373) never roll a storm at all in this 30-round
playthrough (`firstStormEventIndex: -1`) yet still diverge — confirming the effect is wind-driven,
not storm-gated.

**This is a finding to report, not a reason to weaken the assertion.** D-26 itself anticipated
exactly this outcome and named the replacement evidence: per-key attribution that separates an
additive serialization delta from a real behavioral change. That attribution is what Section 3
above provides — every divergent line's cause traces to the same one-line `leeward()` change via
the `state`/`pos` cascade, and `--ignore-keys` is available so 14-04's checkpoint can attribute
each divergence to a named decision (D-18 here; D-15/D-21 when they land). **This finding is marked
here as awaiting Wyatt's confirmation at 14-04's checkpoint — it is not presented as settled.**

## 5. Verdict

**PENDING — completed in 14-04 before --capture.**
