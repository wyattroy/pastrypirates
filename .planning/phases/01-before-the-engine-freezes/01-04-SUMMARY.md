---
phase: 01-before-the-engine-freezes
plan: 04
subsystem: engine + narration
tags: [RULE-01, RULE-02, determinism, copy, D-06, D-50]
requires:
  - "4/src/engine/index.js — Game.ev(), Game.doDock(), Game.nextSeaCreature()"
  - "4/src/ui/util.js — seaLine(), isLocalTo(), pn()"
  - "4/src/shared/index.js — SEA_CREATURES, emojify(), COIN_IMG, WAVE_IMG (read only, unmodified)"
  - "01-01 — 4/scripts/stage_import_check.js, the first gate in this repo that loads 4/"
  - "01-03 — 01-BALANCE-BASELINE.md, the before side of the measurement plan 06 completes"
provides:
  - "Game.prototype.doPass(p) — the one place a pass pays and is recorded"
  - "The pass narration tag `Recipe idea! (+1🌕)` appended by EVENT_NARRATION.pass"
  - "4/scripts/pass_coin_test.js — the RULE-01 gate"
  - "4/scripts/pass_narration_test.js — the RULE-02 gate"
affects:
  - "01-06 — the after side of the balance measurement; this is the change it measures"
  - "Phase 3 — the determinism corpus records the event stream this plan finalises"
tech-stack:
  added: []
  patterns:
    - "mutate-then-record: state changes before this.ev(), because ev() snapshots at call time"
    - "one shared engine method behind every UI-tier emission site"
    - "raw emoji character in a narration builder, resolved at panel()'s single emojify chokepoint"
    - "structural source-text assertion for flow.js invariants that need a DOM to run"
key-files:
  created:
    - 4/scripts/pass_coin_test.js
    - 4/scripts/pass_narration_test.js
  modified:
    - 4/src/engine/index.js
    - 4/src/ui/flow.js
    - 4/src/ui/util.js
decisions:
  - "D-06 honoured verbatim — the tag is Wyatt's exact wording, appended in one place, with all 100 hand-written sea-creature strings untouched"
  - "D-50 honoured — the coin is a raw character resolved at panel()'s emojify chokepoint, never hand-rolled markup"
  - "The sea-cursor advance stays outside doPass — per-device narration bookkeeping owned by one seat, not shared behaviour"
  - "The payment is not conditioned on this.record — ev() self-gates, the dubloon is a rule"
metrics:
  duration: "~1h"
  completed: 2026-08-19
  tasks: 2
  commits: 4
  files_created: 2
  files_modified: 3
status: complete
---

# Phase 1 Plan 04: Passing Pays, and the Narration Says So — Summary

Passing now pays exactly one dubloon through a single `Game.prototype.doPass(p)` called from all
three pass-emission sites, and the pass narration carries Wyatt's tag `Recipe idea! (+1🌕)` on all
100 renderings — with the purse mutated **before** the event records it, proven by a gate that was
watched failing when that order is reversed.

## What Was Built

### RULE-01 — one method, three sites, paid before it is recorded

`Game.prototype.doPass(p)` in `4/src/engine/index.js`, seated next to `doDock` and shaped exactly
like it:

```js
doPass(p){
  p.coins+=1;
  this.ev({t:"pass",p:p.idx,sea:this.nextSeaCreature(p)});
}
```

**All three surfaces were checked individually** (CLAUDE.md §2 consistency), and all three now call
that one method:

| Site | File | Path | Now calls |
|---|---|---|---|
| The engine fallback in `takeTurn` | `4/src/engine/index.js` | headless / simulator | `this.doPass(p)` |
| The animated bot fallback in `botTurn` | `4/src/ui/flow.js` | **real browser games** | `g.doPass(p)` |
| The human pass menu in `humanAct` | `4/src/ui/flow.js` | **real browser games** | `appState.game.doPass(p)` |

**Both bot paths pay.** `botTurn` does not call `takeTurn` — it reimplements the turn so each step
can animate, which is why its fallback is deliberately duplicated rather than inherited. A dubloon
added only to the engine would have paid the simulator and left every real browser game exactly as
broken. Bots and humans have identical rules and affordances, so bots pass and bots are paid; that
was never raised as an open question.

**The sea-cursor advance was deliberately left OUTSIDE the shared method.** `advanceSeaCursor(p)`
still sits on the line after the human-menu site in `flow.js`, where it always was. It is per-device
narration bookkeeping owned by one seat — bots walk their own derived offsets and must never touch
it — so folding it into `doPass` would have handed a cursor to every bot. The gate asserts both
halves: it is still in the human menu, and `4/src/engine/index.js` contains zero occurrences of it.

**The payment is not conditioned on `this.record`.** `ev()` self-gates with its own early return;
the dubloon does not. A game that happens not to be recording is still a game being played.

### RULE-02 — one appended fragment, 100 renderings

Exactly **one line of code** changed in `4/src/ui/util.js` (the rest of that diff is the rationale
comment):

```js
txt:`🌊 ${seaLine(e.sea,isLocalTo(e.p,viewerSeat),pn(e.p))} <span class="nobrk">Recipe idea! (+1🌕)</span>`,
```

**All 100 hand-written strings are untouched** — `4/src/shared/index.js` does not appear in this
plan's diff at all. The tag is a subjectless fragment appended by the renderer in one place, which
is what makes that possible: about twenty of the fifty sightings end on the *creature* as the
nearest grammatical subject, so any appended clause carrying a verb hands the pen to the shrimp.
Nothing is conjugated, no article is guessed, no agreement is derived — the three things the
`seaLine` contract forbids and the three things the deleted `seaSighting()` did.

The coin is a **raw character** resolved to the coin image by `emojify()` at `panel()`'s single
chokepoint (D-50), like every other coin-amount line in that table. The tag is wrapped **whole** in
the no-break span rather than just the parenthetical — a unit and its amount are one readable thing
(the sailing-order precedent, G27/P7).

## The Rendered Copy

Printed by `4/scripts/pass_narration_test.js` on every run, so it can never be described instead of
shown. Three lines at both persons — `#04` is the donut-shrimp line that broke every earlier draft,
`#00` opens the list, `#49` closes the ring:

```
#00 addressed     🌊 Crustbeard — ye peep into the clear water and see a pokey pistachio pufferfish gettin' sassy. Recipe idea! (+1🌕)
#00 third-person  🌊 Crustbeard peeps into the clear water and sees a pokey pistachio pufferfish gettin' sassy. Recipe idea! (+1🌕)

#04 addressed     🌊 Crustbeard — ye catch sight of the bottom, and a dozen donut shrimp bounce past. Recipe idea! (+1🌕)
#04 third-person  🌊 Crustbeard catches sight of the bottom, and a dozen donut shrimp bounce past. Recipe idea! (+1🌕)

#49 addressed     🌊 Crustbeard — ye drift near a reef, and a honey lavender sea cucumber lies there, doing nothing. Recipe idea! (+1🌕)
#49 third-person  🌊 Crustbeard drifts near a reef, and a honey lavender sea cucumber lies there, doing nothing. Recipe idea! (+1🌕)
```

The `#04` third-person line is **byte-identical to the rendered check D-06 was written against**.

As the panel actually receives it, before the chokepoint resolves the coin:

```
🌊 <b style="color:#1d96a6">Crustbeard</b> catches sight of the bottom, and a dozen donut shrimp bounce past. <span class="nobrk">Recipe idea! (+1🌕)</span>
```

## The Two Gates

### `4/scripts/pass_coin_test.js` — RULE-01

Two halves. The **engine half** imports `../src/engine/index.js` and drives the real thing, because
source shape cannot tell you what a recorded snapshot actually contains. The **structural half**
reads `4/src/ui/flow.js` as raw text (the convention of `scripts/narration_flow_test.js`), because
`botTurn` and `humanAct` need a DOM and can never run headless. Both flow regions are located by the
code around them, never by line number, and the gate prints where it anchored.

The load-bearing assertion reads the purse **out of the pass entry's own state snapshot** and
compares it to the post-call purse. `ev()` builds that snapshot at the instant it is called, so
recording before paying writes a captain in one dubloon short at the exact tick their narration
claims payment — and Phase 3 freezes this stream into a corpus, after which the same fix costs a
gated re-record.

The event-shape check is **derived** from a recorded `{t:"turn"}` entry in the same run rather than
hand-typed, so it stays a real check if `ev()` ever gains a field instead of becoming a list nobody
updates. It confirmed the pass entry's key set is unchanged:
`p, round, sea, state, storm, t, tokens, wind, wind2`.

39 assertions, exit 0.

### `4/scripts/pass_narration_test.js` — RULE-02

One verdict per rendering, so each of the 100 names its own fault instead of hiding behind a count.
Asserted on the string the builder **actually returns**, never on the source literal — that is the
encoding edge this file exists for. The coin is looked for by code-point iteration rather than
substring match (a lone surrogate would satisfy a substring match), every rendering is swept for
unpaired surrogates, and `emojify()` is run over all 100 to prove the raw character resolves to the
coin image and leaves nothing raw behind.

Fixture validated before anything is measured (HARD-WON-LESSONS §3): every sighting is read out of
`SEA_CREATURES` rather than typed, the pair shape and name marker are asserted, no entry carries the
tag itself, and the two persons are confirmed to render **differently** — a builder that ignored its
viewer argument would otherwise have sailed through 100 identical assertions.

100 renderings + 12 supporting assertions, exit 0.

## Failure Demonstrations

Both required by the plan, both observed, both reverted (CLAUDE.md §4 — a check nobody has seen fail
is not yet a check).

**1. The reversed ordering.** `doPass`'s two statements swapped so the event is recorded before the
payment:

```
FAIL  ORDERING: the pass entry's own snapshot shows the purse AFTER the payment      got=3 want=4
FAIL  ORDERING: and that snapshot purse is one higher than before the call           got=3 want=4
FAIL  ORDERING: the recorded snapshot for that turn shows the post-payment purse     got=3 want=4
  2 source anchor(s) located, 3 failure(s)
```

**Exit code 1.** Note that only the three ORDERING assertions moved — the purse still ended up
correct and every other assertion still passed, which is precisely why this had to be asserted off
the snapshot and not inferred from the order of two lines. Restored: exit 0.

**2. The removed closing span.** `</span>` deleted from the appended tag:

```
FAIL  #00 addressed  got="does not end with the tag wrapped whole in a no-break span; the no-break
                          wrapping is missing or duplicated; the tag renders ahead of the sighting
                          sentence" want="ok"
```

All **100** renderings failed on the wrapping assertion by name. **Exit code 1.** Restored: exit 0.

## Verification

| Check | Result |
|---|---|
| `node 4/scripts/pass_coin_test.js` | exit 0 |
| `node 4/scripts/pass_narration_test.js` | exit 0, 100 renderings |
| `node 4/scripts/no_undef_check.js` | exit 0 |
| `node 4/scripts/stage_import_check.js` | exit 0 |
| `node 4/scripts/pp4_timeroff_check.js` | exit 0 |
| `node 4/scripts/seat_arg_check.js` | exit 0 |
| `node 4/scripts/dlog_quantity_check.js` | exit 0 |
| `npm test` (root, 21 gates) | exit 0 |
| `grep -c 'doPass' 4/src/engine/index.js` | **3** — the definition (`:956`), the engine call (`:3021`), and one comment line pointing at it — ≥2 required |
| `grep -c 'doPass' 4/src/ui/flow.js` | **2** — exactly the two UI-tier sites |
| `grep -c 'ev({t:"pass"' 4/src/ui/flow.js` | **0** — no bare emission survives in the UI tier |
| `grep -c 'ev({t:"pass"' 4/src/engine/index.js` | **1** — emitted in one place |
| `grep -c 'advanceSeaCursor' 4/src/engine/index.js` | **0** — the human-only cursor did not migrate |
| `grep -c 'Recipe idea!' 4/src/ui/util.js` | **1** — appended in one place only |
| `grep -c 'nobrk' 4/src/ui/util.js` | 11 → **12**, exactly +1 |
| `Math.random` / `Date.now` / `performance.now` under `4/src/engine/` | **0 / 0 / 0** across both files — unchanged |
| Planning health check | 0 errors, 8 warnings (all W019, the known permanent noise), 3 info |

**Diff scope** (CLAUDE.md §3). `git diff --name-only` across this plan's four commits lists exactly
five files and nothing else:

```
4/scripts/pass_coin_test.js       (new)
4/scripts/pass_narration_test.js  (new)
4/src/engine/index.js
4/src/ui/flow.js
4/src/ui/util.js
```

**`4/src/shared/index.js` does not appear.** Nothing under `v2/`, `v2bakeoff/`, `3/` or root `src/`
appears. Proven unchanged by explicit diff: `scripts/bot_ladder4.js`, `01-BALANCE-BASELINE.md`, and
`4/src/ui/stage.js` — `PP4_STAMP` is still `"2026-08-18b"`, which the orchestrator owns.

`git diff --stat 4/src/ui/util.js` reports 17 insertions and 1 deletion; filtering comment lines out
of that diff leaves **exactly one changed line of code**, the `txt:` template. The other 16 lines are
the rationale comment, which this repository's convention requires.

## Threat Mitigations

| Threat | Disposition | How it landed |
|---|---|---|
| T-01-08 — `doPass` mutate/record ordering | mitigate | Mutate-first ordering copied from `doDock`; asserted directly off the recorded snapshot; **observed failing** with the order reversed. |
| T-01-09 — the narration tag spoofing a payment | mitigate | Both gates green; the structural half proves no bare pass emission survives in the UI tier, so the tag cannot claim a payment a missed site never made. |
| T-01-10 — new nondeterminism under `4/src/engine/` | mitigate | The new method is an integer increment and an event call, nothing else. Zero occurrences of all three sources across both engine files, asserted per-run by the gate rather than by a one-off grep. |
| T-01-11 — injection via the appended fragment | accept | Unchanged — a fixed authored string with no interpolation. |
| T-01-SC — supply chain | accept | Zero packages installed. |

## Deviations from Plan

Three, all small, all recorded rather than silently absorbed.

**1. [Rule 2 — missing critical functionality] The RULE-01 gate skips its engine half as a block
rather than throwing.**
- **Found during:** Task 1, the RED run.
- **Issue:** With `doPass` absent, `g.doPass(p)` threw a `TypeError` and killed the run at its second
  assertion, so the report never reached the structural half — the half that says *where* the method
  is missing from. The `4/scripts/` house shell requires every assertion to run before the exit.
- **Fix:** the engine half is guarded on `typeof g.doPass === "function"` and prints why it was
  skipped. The RED run then reported all 8 failures across both halves.
- **Files:** `4/scripts/pass_coin_test.js`. **Commit:** d01e3a0.

**2. [Rule 2] Both gates force an explicit `process.exit`.**
- **Issue:** importing `4/src/ui/util.js` arms module-scope timers that hold Node's event loop open
  forever after a perfectly *successful* run — the same trap `4/scripts/stage_import_check.js` and
  `pp4_timeroff_check.js` already document. A gate that hangs CI is worse than no gate.
- **Fix:** explicit exit carrying the failure count, with a header note saying why.
- **Files:** `4/scripts/pass_narration_test.js`. **Commit:** c30e133.

**3. [Rule 2] The narration gate additionally runs `emojify()` over all 100 renderings.**
- **Rationale:** D-50 says the coin resolves at one chokepoint. The plan's `<behavior>` only required
  proving the builder body hand-rolls no image call — an *absence*. That cannot tell you the raw
  character actually resolves; a coin that reaches the chokepoint and is not matched there would
  ship as a literal `🌕` beside the real coin images. Running the chokepoint proves the positive.
- **Files:** `4/scripts/pass_narration_test.js`. **Commit:** c30e133.

Nothing needed a Rule 4 architectural decision. No auth gates. No packages installed.

## Notes for Plan 06

This is the **after** side of the measurement. `scripts/bot_ladder4.js`, its arguments and its seed
family were deliberately not touched — that they hold fixed is the entire basis of the comparison.
Re-run the identical command from `01-BALANCE-BASELINE.md` (400 games, seed family ×7919, `--json`)
and diff against the baseline recorded at SHA `a019253`: 54.99% overall pass rate, 15.1575 mean
rounds, 0 unfinished, measured on a tree where passing did **not** yet pay.

D-07 makes that a **gate on this phase, not a note**: if bots pass materially more and voyages drag,
that is a bug to fix before the engine freezes — most likely by lowering the payout — and it costs a
gated re-record if it lands after Phase 3 captures.

## Known Stubs

None. No placeholder values, no skipped tests, no unrun `<verify>` commands, no TODO or FIXME markers
introduced.

## Self-Check: PASSED

All created files exist on disk and all four commits are reachable:

- FOUND `4/scripts/pass_coin_test.js`
- FOUND `4/scripts/pass_narration_test.js`
- FOUND `d01e3a0` — test(01-04): the RULE-01 gate, RED
- FOUND `8a9cafd` — feat(01-04): `doPass`, three sites, GREEN
- FOUND `c30e133` — test(01-04): the RULE-02 gate, RED
- FOUND `d17bf12` — feat(01-04): the appended tag, GREEN
