---
phase: 03-the-safety-net
plan: 01
subsystem: test-harness
status: complete
tags: [gates, tree-selector, red-proof, citations, determinism-door]
requires: [02.15-01 pickTree/D-28]
provides:
  - "scripts/lib/pick_tree.js — one shared spelling of --tree, used by six gates"
  - "scripts/lib/js_region_tokenizer.js stripCommentSegments() — one shared definition of a comment, used by four gates"
  - "scripts/gate_count_check.js — npm test states its own coverage, asserted against the chain"
  - "4/scripts/gate_citation_check.js — no comment in 4/ may claim protection that does not exist"
  - "4/scripts/lib_twin_check.js — scripts/lib/ twins cannot drift silently"
affects: [package.json, npm test chain, 4/src comments]
tech-stack:
  added: []
  patterns: [shared tree selector, per-tree pinned inventories, two-token citation markers, both-ways red-proof]
key-files:
  created:
    - scripts/lib/pick_tree.js
    - scripts/gate_count_check.js
    - 4/scripts/gate_citation_check.js
    - 4/scripts/lib_twin_check.js
    - docs/DETERMINISM-CAPTURE-4.md
    - .planning/phases/03-the-safety-net/03-UI-CONTRACT-TRIAGE.md
  modified:
    - package.json
    - scripts/module_graph_check.js
    - scripts/engine_contract_check.js
    - scripts/net_contract_check.js
    - scripts/state_contract_check.js
    - scripts/wind_dot_contract_check.js
    - scripts/host_guest_parity_check.js
    - scripts/lib/js_region_tokenizer.js
    - 4/scripts/lib/js_region_tokenizer.js
    - "4/src/** and 4/index.html — COMMENTS ONLY, proven"
decisions:
  - "TEST-03 deferred: the determinism door stays open for Phases 4 and 5. Alternative recorded in docs/DETERMINISM-CAPTURE-4.md §2."
  - "The plan's diagnosis of parity assertion 4 was wrong; re-anchored to what 4/'s code actually is."
  - "Two citation markers, not one — ROOT-TREE-CITATION (true as written) and UNGATED-IN-4 (a debt)."
  - "scripts/lib/ twins gated, never deduped — deduping would re-root the engine loader at the root tree."
  - "The ten existing 4/scripts gates measured green but NOT added to npm test — unproven gates stay out."
requirements: [TEST-04, TEST-05, TEST-06, TEST-07]
deferred_requirements: [TEST-03]
metrics:
  gates_before: 21
  gates_after: 30
  gates_reading_4_before: 0
  gates_reading_4_after: 8
  suite_runtime: "~3s"
---

# Phase 3 Plan 01: the gates learn to read the game we are actually shipping — Summary

**Before tonight `npm test` ran 21 green gates and NOT ONE of them opened `4/`. It now runs 30, and
8 of them read the game Wyatt plays. Every one of those 8 has been seen RED against a fault planted
in a `4/` file while the root aim stayed GREEN at the same moment.**

**Nothing he plays changed.** `PP4_STAMP` is still `2026-08-23a`, `4/src/ui/stage.js` is untouched,
and the only edits inside `4/src` are comments — proven, not asserted (see §7).

---

## 1. THE HEADLINE NUMBER, quoted from a real run

```
$ node scripts/gate_count_check.js
gates in `npm test`: 30 — 8 of them read 4/ (the game under development), 22 read the root tree.
  reads 4/: node scripts/engine_contract_check.js --tree=4
  reads 4/: node scripts/net_contract_check.js --tree=4
  reads 4/: node scripts/state_contract_check.js --tree=4
  reads 4/: node scripts/module_graph_check.js --tree=4
  reads 4/: node scripts/wind_dot_contract_check.js --tree=4
  reads 4/: node scripts/host_guest_parity_check.js --tree=4
  reads 4/: node 4/scripts/gate_citation_check.js
  reads 4/: node 4/scripts/lib_twin_check.js
PASS gate count matches the chain (declared total 30, reading 4/ 8)
```

**That number is not typed anywhere.** `gate_count_check.js` parses `package.json`'s own
`scripts.test` string, splits the `&&` chain, counts the `node` invocations and the subset reading
`4/`, and exits non-zero if either declared figure disagrees — naming both. It runs FIRST, so a
green suite opens by stating its own coverage. It also fails outright if the `4/` count ever returns
to zero.

`npm test` exits 0 in ~3 seconds. Root suite behaviour unchanged.

---

## 2. RED-PROOF BLOCKS — one per gate, both halves

**§3 of the plan, non-negotiable: a one-sided red-proof proves nothing about a gate's AIM.** Every
block below shows the `4/` aim RED and the root aim GREEN **on the same planted fault, at the same
moment**. Every plant was reverted and `git diff --name-only -- 4/` proved empty afterwards.

### module_graph_check.js — the tracer

Planted a real import cycle in `4/src/ui/board.js` (`import { localAsk } from "./flow.js"`;
flow.js already imports board.js).

```
$ node scripts/module_graph_check.js --tree=4                        exit 1
tree: 4/ (the game actually being developed) — 25 .js file(s) under src/
FAIL no import cycle detected among src/**/*.js
  - CYCLE: 4/src/ui/board.js -> 4/src/ui/flow.js -> 4/src/ui/board.js
  - CYCLE: 4/src/ui/board.js -> 4/src/ui/flow.js -> 4/src/ui/panel.js -> 4/src/ui/board.js
  - CYCLE: 4/src/ui/board.js -> 4/src/ui/flow.js -> 4/src/ui/lobby.js -> 4/src/ui/board.js

$ node scripts/module_graph_check.js                                 exit 0
tree: root (the OLD game — not the tree under development) — 21 .js file(s) under src/
PASS no import cycle detected among src/**/*.js      (+ 6 more PASS)
```

### gate_count_check.js — the count itself

```
total 23 -> 24:       GATE-COUNT-TOTAL: package.json declares "gates.total": 24, but the
                      scripts.test chain actually contains 23 node invocation(s). Declared 24,
                      counted 23.                                              exit 1
readingFour 1 -> 0:   GATE-COUNT-4: declares "gates.readingFour": 0, but 1 chain entr(y/ies)
                      actually read 4/. Declared 0, counted 1.                 exit 1
```

### host_guest_parity_check.js — two faults, two assertions

```
Planted a SECOND sail builder in 4/src/ui/flow.js:
$ node scripts/host_guest_parity_check.js --tree=4                   exit 1
FAILURES — tree: 4/ (the game actually being developed)
  - PARITY-SAILRECT: 2 builder(s) in src/ui/flow.js apply the sailCell class (counted across all
    three spellings: class:"sailCell", .className="sailCell", .classList.add("sailCell")),
    expected exactly 1. Two builders is how D-55 happened — the guest's squares were a different
    orange, dimmer, unanimated and unhoverable for a whole phase.
$ node scripts/host_guest_parity_check.js                            exit 0   PASS assertion 2

Planted a SECOND ride (animateRimSweepStormRun building its own curve) in 4/src/ui/flow.js:
$ node scripts/host_guest_parity_check.js --tree=4                   exit 1
  - PARITY-SWEEPARRIVE-ONERIDE: rimSweepCurve( is built in 2 place(s) in src/ui/flow.js, expected
    exactly 1 (animateRimSweepRun). Every property above is asserted against ONE body; a second
    ride is a second set of arrival, glide-restore and elapsed-time properties that nothing checks.
$ node scripts/host_guest_parity_check.js                            exit 0   PASS assertion 4
```

**AND THE ONE THAT MATTERS FOR TEST-06 — `npm test` itself:**

```
$ npm test          (with the second sail builder planted)           exit 1
```

### state_contract_check.js

```
Planted `appState = {}` in 4/src/ui/usage.js:
$ node scripts/state_contract_check.js --tree=4                      exit 1
FAILURES — tree: 4/ (the game actually being developed)
  - STATE-REASSIGN: 4/src/ui/usage.js:73 — the `appState` binding itself appears reassigned,
    not just its properties
$ node scripts/state_contract_check.js                               exit 0   PASS
```

### engine_contract_check.js — three faults

```
(a) `document.body` in 4/src/engine/index.js:
    --tree=4  exit 1   PURITY: 4/src/engine/index.js:3104 matched "document.<prop>" ("document.body")
    root      exit 0   PASS purity
    ...and the SAME words inside a /* */ block: --tree=4 exit 0. The strip is real and correct.

(b) one ORDER IS LOAD-BEARING comment removed:
    --tree=4  exit 1   ANNOTATIONS: expected exactly 9 ... in the 4 tree, found 8.
                       Declared 9, counted 8.
                       ANNOTATIONS: OPPOSITE (src/shared/index.js:222) has no annotation
    root      exit 0   PASS annotations

(c) `export const AW={steal:6}` added to 4/src/shared/index.js:
    --tree=4  exit 1   EXPORTS-EXEMPTION-STALE: "AW" is listed in TREE_INVENTORY["4"].absentByDesign
                       ("v1 bot weight table, superseded by the v3 race planner") but it IS exported
                       by a barrel in that tree. Remove the exemption — an exclusion nobody
                       re-checks is a blind spot, not a decision.
    root      exit 0   PASS
```

### net_contract_check.js — THE COMMENT-VS-CODE PAIR

**This pair is the proof that adding comment stripping did not make the check vacuous.**

```
COMMENT-ONLY plant in 4/src/net/writers.js, naming isHost/mySeat/evIdx in prose:
$ node scripts/net_contract_check.js --tree=4                        exit 0   GREEN. Correct.

REAL CODE in the same file (`const isHost = true`):
$ node scripts/net_contract_check.js --tree=4                        exit 1
  - NO-APP-STATE: 4/src/net/writers.js:252 references app-state name "isHost"
$ node scripts/net_contract_check.js                                 exit 0   GREEN
```

The code plant carried a trailing `// RED-PROOF PLANT (real code)` comment and was still caught — a
trailing comment does not hide the code on its line.

### wind_dot_contract_check.js — the same pair

```
`const windDotHack` in 4/src/ui/panel.js:
  --tree=4  exit 1   WINDDOT-OWNERSHIP: 4/src/ui/panel.js:1336 contains "windDot" — D-14 reserves
                     wind-dot symbols to src/ui/board.js only
  root      exit 0   PASS
The same word in PROSE: --tree=4 exit 0. GREEN.
```

### 4/scripts/gate_citation_check.js — three

```
(a) a comment citing scripts/imaginary_gate_check.js:
    CITATION-MISSING: 4/src/ui/panel.js:1336 cites "scripts/imaginary_gate_check.js",
    which does not exist.                                                          exit 1
(b) a comment citing the real-but-root-only scripts/economy_guard_test.js:
    CITATION-BLIND: ... which does NOT read 4/. It is not under 4/scripts/ and it is not invoked
    in package.json's test chain with --tree=4, so it has never opened the file this comment
    sits in.                                                                       exit 1
(c) --tree=4 REMOVED from module_graph in the chain: satisfied fell 36 -> 19 and 17 module_graph
    citations went straight into the failure list. THE COVERAGE SET IS READ FROM THE CHAIN, not
    from a list typed in the gate.                                                 exit 1
```

### 4/scripts/lib_twin_check.js — three

```
one byte appended to 4/scripts/lib/tiny_dom.mjs:
  TWIN-DRIFT: scripts/lib/tiny_dom.mjs and 4/scripts/lib/tiny_dom.mjs are NO LONGER byte-identical
4/scripts/lib/load_engine.js moved away:
  TWIN-MISSING: scripts/lib/load_engine.js has no counterpart at 4/scripts/lib/load_engine.js
one byte appended to 4/scripts/no_undef_check.js:
  TWIN-DRIFT: scripts/no_undef_check.js and 4/scripts/no_undef_check.js are NO LONGER byte-identical
```

### And the gates' own drills still pass in full

```
$ node scripts/host_guest_parity_check.js --drill    ALL 6 ASSERTIONS RED-PROOF DRILLED OK
$ node scripts/wind_dot_contract_check.js --drill    ALL 6 ASSERTIONS RED-PROOF DRILLED OK
```

Five drills were **added** for the branches this plan wrote, because a branch nothing drills has
only ever been seen pass against one real tree: **2d** (a second builder in the DOM-property
spelling — invisible before the re-anchor), **2e** (one builder in that spelling, the `4/` shape),
**4h** (extracted shape, ride never restores the glide), **4i** (extracted guard + one correct
ride), **4j** (a guard reaching two rides).

---

## 3. THE CITATION SWEEP — three routes, with counts

**ROADMAP names TWO dangling citations in `4/`. There were NINETY.** Both of ROADMAP's line numbers
had drifted since intake and now point at unrelated code, so this was swept, not chased.

```
citations scanned: 90 across 26 file(s) in 4/src + 4/index.html — 36 satisfied by a gate that
reads 4/, 8 declared ROOT-TREE-CITATION (true as written), 46 declared UNGATED-IN-4 (KNOWN GAP —
this number is a debt and should fall), 0 unsatisfied.
```

| Route | Count | What happened |
|---|---:|---|
| **1 — now covered by the chain** | **36** | comment left alone. Tonight's six re-aimed gates did this. |
| **2 — comment corrected** | **2** | listed below — the finding of this task |
| **3a — `ROOT-TREE-CITATION`** | **8** | true as written, about the root tree on purpose |
| **3b — `UNGATED-IN-4`** | **46** | real script, does not read `4/`. **An admission, not an excuse.** |

**Two markers, not one, deliberately.** `UNGATED-IN-4`'s count is a **debt**: it should fall as
gates are ported, and any rise is somebody writing a new false claim. Collapsing the two into one
token would make `grep` return a number that means nothing.

Of the 46: **20 are `ui_contract_check.js`** (pointed at the triage and plan 03-02); the rest name
hand-run harnesses that are not in `npm test` at all (`bakeoff_baseline`, `bakeoff_test`,
`bakeoff_parity_test`, `bakeoff_recipe_check`, `bot_matrix`, `measure_race_spread`,
`analyze_classic`) or chain gates that run the root aim only (`narration_test`,
`narration_flow_test`, `rim_sweep_trace_test`, `audio_mapping_test`, `bot_storm_narration_test`,
`dlog_replay_test`).

### EVERY COMMENT THAT TURNED OUT TO DESCRIBE NO PROTECTION AT ALL

**1. `4/src/main.js:60`** said the bridge-deletion fallout was *"caught by a dedicated no-undef gate
(`scripts/no_undef_check.js`)"*. That is the **ROOT** copy, which scans the root game's `src/` and
has never opened this file. The `4/` copy is byte-identical and tree-relative, so it is the one that
actually covers this tree. **Corrected to name it** — and the comment now also says it is not yet in
`npm test`, which is true and worth knowing.

**2. `4/src/engine/bakeoff.js:187`** said `attention` *"is tuned by measurement
(`scripts/bakeoff_tune.js` sweeps it against mean attempts to solve), never picked by eye."*
**THERE IS NO `bakeoff_tune.js` IN THIS REPO AND THERE NEVER HAS BEEN** — `git log --all -S
bakeoff_tune` finds no commit that added one. The name arrived with the file it describes and was
never written, so the claim of a tuning sweep was **false from the first day**. Measured tonight:
`scripts/bakeoff_test.js` is the only script in the repo that mentions `attention`, it is not in
`npm test`, and it reads the ROOT engine. **Nothing gates that value in `4/`.** Left named rather
than deleted, because a comment that promised a measurement and delivered none IS the finding.

**Never delete a citation to silence the gate** — that rule is in the gate's own header.

---

## 4. FINDINGS ABOUT `4/` ITSELF — separated from findings about the gates

### Real, and marked OBSERVED, NOT YET MEASURED (rule 6)

**Four controls in `4/` grey out with no reason a player can read.** Adjacent to Wyatt's own
playtest item 2.

| File:line | Greyed by | What a player sees |
|---|---|---|
| `4/src/ui/flow.js:1354` | `!canBuy` | "Buy \<ingredient\> −N🌕" greyed, no reason string decided by `canBuy` |
| `4/src/ui/flow.js:1358` | `!canBarter` | "Trade any 2 crates fer \<ingredient\>" greyed, no reason string |
| `4/src/ui/flow.js:1646` | `!holders` | an unlabelled option greyed, no reason string |
| `4/src/ui/flow.js:2038` | — | the explanation variable is assigned across an if/else-if chain whose conditions are **independent**, so the second reason can be unreachable in the state it explains |

> **NOT ONE HAS BEEN REPRODUCED IN A BROWSER.** These come from a static scan. Nobody has stood at a
> dock with too few coins and looked. **Do not report these as confirmed defects.** Whoever picks
> them up starts by reaching that state and looking — `docs/DRIVING-THE-GAME.md` §5e poses the state
> rather than sailing to it.

### Facts about the promoted tree, worth having

- **Seven names the root barrel exports are ABSENT from `4/`'s, and that is deliberate, not
  misplaced.** `SAIL_BUDGET`, `SAIL_BUDGET_LEEWARD`, `windStepCost`, `AW`, `TW`, `DW`, `FISH_BASE`.
  Verified absent from `4/src` entirely. `4/src/shared/index.js:218` says why in its own words:
  *"The lee is gone… deleted rather than left unused — a constant nothing reads is exactly the dead
  code the house rules exist to prevent."* `AW`/`TW`/`DW` are v1's bot weight tables and `FISH_BASE`
  its fishing constant; the v3 race planner replaced all four.
- **`4/` has NINE order-is-load-bearing constructs to the root's seven.** The two extra are real:
  `SEA_CREATURES` (Wyatt, 2026-08-06 — *"each animal followed by a substantially different animal"*,
  walked as a **ring**, so the 50→1 join is a real adjacency) and the bot's trade offer being
  **composed first and only then tested** against memory.
- **`4/` split the rim-sweep guard from the ride** so a storm ride can pass the entry cell in
  explicitly — which is how it got the animation **without putting a new field in the event stream**,
  i.e. without spending the determinism door. That shape is now written down in
  `docs/DETERMINISM-CAPTURE-4.md` §5 as the first thing to try before any future engine edit.
- **Ten gates under `4/scripts/` exist, read `4/`, all exit 0 — and none is in `npm test`.**
  `no_undef_check`, `seat_arg_check`, `dlog_quantity_check`, `stage_import_check`,
  `planner_singleton_check`, `audio_map_check`, `bot_bake_pass_check`, `name_claim_check`,
  `pp4_timeroff_check`, `prompt_field_parity_check`. Measured tonight. See §6 for why they were not
  wired in.
- **Three of `state_contract_check.js`'s five assertions are reintroduction guards, not live
  coverage.** Assertions 1, 2 and 5 scan `index.html`'s classic-script region, which is GONE in
  **both** trees (D-08's terminal state). The tree line now prints `classic-script region 0 chars`
  on every run so nobody reads three free passes as three checks. Assertion 5 also sweeps every
  `.js` under `src/`, which is real.

---

## 5. DEVIATIONS FROM PLAN

### 1. [Rule 1 — the plan's diagnosis of parity assertion 4 was wrong]

**Found during:** Task 3. **The plan said** `rimSweepCurve` was extracted in `4/` and the assertion
should assert the call. **`rimSweepCurve` is its own exported function in BOTH trees** (root `:418`,
`4/` `:865`) and always was. The real difference is one level up: `4/` split the **guard** from the
**ride** — `animateRimSweepIfAny` (`:940`) is now a thin guard ending in `return
animateRimSweepRun(seat,from,to)`, and `animateRimSweepRun` (`:966`) holds the entire ride.

**Building to the plan's literal instruction would have pinned the wrong thing.** Instead the
assertion now *finds* the ride: the guard must exist, must reach exactly ONE `animateRimSweep*`
ride, and that ride must build a curve — each a named failure — then every original property runs
against it. **Files:** `scripts/host_guest_parity_check.js`. **Commit:** `af40669`.

### 2. [Rule 2 — a property the plan did not ask for: EXACTLY ONE RIDE]

The split earns an assertion that could not exist before it. Every property is checked against one
body, so a second ride leaves half of them unguarded **and green**. Red-proofed. Same commit.

### 3. [Rule 1 — the glide expression]

The assertion demanded exactly `RIM_SWEEP_TICK_MS`. `4/` writes `RIM_SWEEP_TICK_MS *
MOTION_BRIDGE_TICKS` — a glide that deliberately outlasts the tick to soak up `setTimeout` jitter
(measured; see `MOTION_BRIDGE_TICKS`). That is a **refinement** of the property, not a violation.
The two load-bearing halves — derived from the sweep tick, and linear — are still pinned. Pinning
the exact expression made an honest fix red, which is how a gate gets ignored.

### 4. [Rule 2 — one definition of "a comment", not four]

The plan said reuse the parity gate's stripper. Its line filter **could not see block-comment
continuation lines** — which is exactly what `4/src/net/writers.js:174` and `:193` are, so it would
have left both false findings standing. Replaced with `stripCommentSegments()` in the shared
tokenizer: `classify()`-backed, so a `//` inside a string is string content (the `databaseURL`
false-negative `net_contract_check.js`'s header is a whole section about), and every byte's offset
preserved. **Four gates converged onto it and every one got stronger**, which is the only acceptable
direction for a convergence. The `4/scripts/lib/` twin was kept byte-identical in the same edit.

### 5. [Rule 2 — the citation gate could not see a citation of a deleted gate]

First cut filtered candidates by "the basename exists", which silently discarded
`scripts/bakeoff_tune.js` — one of the three things the gate exists to catch. Fixed: a **prefixed**
mention is a citation whether or not the file exists. The one remaining blind spot (a **bare**
filename naming a gate that does not exist, indistinguishable from prose) is stated in the gate's
header rather than left to be discovered.

### 6. [Rule 1 — the marker's scope was too coarse, caught by its own numbers]

The first sweep scoped markers to the whole LINE. Six lines in `4/` read *"scripts/module_graph_check.js
and scripts/ui_contract_check.js both gate this mechanically"* — one now reads `4/` and the other
does not, so a line-scoped marker **silently declared a TRUE citation as a known gap**. That is the
fuzzy-scope failure the gate's own header warns about, committed by the gate itself. Caught because
the satisfied count fell 35 → 29. **A marker now declares only the script it names.**

### 7. [Rule 2 — the exemption list is checked in BOTH directions]

`engine_contract_check.js`'s per-tree "absent by design" list would otherwise become a permanent
blind spot wearing a comment. A name on it that turns out to be **present** now fails too.
Red-proofed.

### 8. [Recorded per D-56 — reversible choices taken without asking]

| Choice | Alternative, if Wyatt prefers it |
|---|---|
| Two citation markers (`ROOT-TREE-CITATION`, `UNGATED-IN-4`) | one marker; loses the debt count |
| `scripts/lib/pick_tree.js` marked ROOT-ONLY BY DESIGN rather than twinned | twin it; but a `4/` copy would resolve `--tree=4` to `4/4/` and scan nothing, green |
| The ten green `4/scripts/` gates left OUT of `npm test` | wire them in; see §6 |
| Converged four gates onto one comment stripper | leave four private copies; but that is rule 23's forbidden shape |
| Parity's private `pickTree()` converged onto the shared selector | leave two; same objection |

---

## 6. WHAT WAS LEFT UNDONE — with the measurement each would start from

| Left undone | Where it starts | Goes to |
|---|---|---|
| **TEST-03 — the determinism corpus** | `test -d 4/scripts/fixtures/determinism` prints **OPEN**. Full argument and its alternative in `docs/DETERMINISM-CAPTURE-4.md` §2. | **plan 03-03** |
| **The three engine purity fixes** | Verified in `4/`: `spoil` at `engine/index.js:1793`, `gave` at `:1140` via `offerLabel()`'s render at `:1166`, `ilabelImg` imported at `:8`. UI half measured at **~7 real edit sites**, not the plan's fifteen. | **plan 03-03**, one pass with the capture (`-NEXT.md` §7) |
| **`ui_contract_check.js` blocking against `4/`** | **9 PASS / 4 FAIL groups / 68 findings**, triaged with counts in `03-UI-CONTRACT-TRIAGE.md`. Recommended shape: 12 of 13 assertions can block; the register assertion cannot until a copy decision. | **plan 03-02** |
| **The 54 register findings** | Counted per file in the triage. Wyatt's voice, a copy pass — and rule 12's voice boundary means a blanket conversion would be a bug. | **Phase 9** |
| **The four greyed controls** | The static-scan lines in §4. **First step is to reproduce one in a browser.** | a phase to pick up |
| **The ten green `4/scripts/` gates** | All ten exit 0 today (§4). **NOT wired in, deliberately:** the plan's own stop-rule is *"do not start a task you cannot red-proof — an unproven gate in the chain is worse than no gate"*, and I red-proofed none of them tonight. Wiring them is the single cheapest coverage win available. | **plan 03-02**, red-proof then wire |
| **Content parity between host and guest** | No automated check exists anywhere and this plan did not invent one. Whether two sentences READ the same is rule 19's two-tab pass. | unchanged |

---

## 7. SAFETY — the constraints run as commands, not held in the head

- **No game code.** Every edited `4/` `.js` file is **byte-identical to HEAD once comments are
  stripped** (shared tokenizer, blank lines dropped). `4/index.html`'s single change is inside an
  HTML comment. **Proven, not asserted.**
- **`PP4_STAMP` is `2026-08-23a`** and `4/src/ui/stage.js` is untouched — `git diff --quiet` says so.
  Nothing for Wyatt to playtest, and no stamp to look for.
- **TEST-03's door is still open:** no engine emission changed, no corpus captured,
  `4/scripts/fixtures/` does not exist.
- **All ten `4/scripts/` gates still exit 0** after 15 files of comment edits.
- **No scratch survived:** `git status --short -- 4/scripts/` is clean; the `ui_contract_check`
  scratch copy was deleted.
- **No browsers were needed and none was launched** (rule 17). `pgrep` for headless Chrome and
  `http.server`: both empty.
- **Health check (rule 21):** **0 errors, 14 warnings** — 13 W019 (the known-noise class Wyatt keeps
  deliberately) and 1 W009 on a 02.1 artifact. **Identical to the reading recorded at planning
  time**; tonight's work moved nothing.
- **Another session is working in this repo.** `.planning/phases/02.2-…/playtest-2026-08-22/` and
  `.planning/phases/04-…/` and `05-…/` appeared while this ran. Nothing outside this plan's file
  list was staged; every commit named its files individually.

## Self-Check: PASSED

All six created files exist on disk. All five task commits (`b760bb3`, `af40669`, `969d7a6`,
`33d2144`, `bcba7e1`) are present in `git log`. `npm test` exits 0 with 30 gates, 8 reading `4/`.
