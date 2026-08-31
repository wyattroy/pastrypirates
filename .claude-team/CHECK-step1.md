# CHECK — Step 1 (checker, fresh context, 2026-08-31). IN PROGRESS.

## Diff actually read (not the builder's account)
`git diff e2d52878~1 HEAD -- src/ scripts/ package.json`
Touched: src/shared/storyboard.js (new, 93 lines), src/ui/board.js, src/ui/util.js,
src/ui/flow.js, src/orchestrator.js, scripts/qa/whose_turn_one_fact_check.mjs (new), package.json.
Builder's file list matches the diff. No stray tree touched.

## board.js header — read it myself (src/ui/board.js:8-13)
"CRITICAL: this file carries the v1.0 BUG-01 storm-crash fix (pre-baked PNG rain tile,
snap-not-animate narration height) — drawBoard()/buildStormLayers()/render()'s bodies below are
moved BYTE-IDENTICAL to the classic source. Do not refactor..."
The header ALSO establishes the form every prior deliberate change to those bodies took:
a "SCOPED EXCEPTION TO THE ABOVE" block IN THE HEADER, naming who approved it and
"WHY THAT IS SAFE, stated in terms of what BUG-01 actually fixed" (board.js:15-27 for G19,
:31-52 for WIND-00). Two precedents, both in the header, both with a named approval.

## Q1 — IS THE MODULE ACTUALLY PURE? **YES, AND THE GATE GENUINELY COVERS IT.**
`scripts/module_graph_check.js:198` — `checkTierShape("shared", [], "shared imports nothing from src/")`.
Red-proofed in a throwaway copy (scratchpad/chk, `git archive HEAD`):
- prepend `import { pn } from "../ui/util.js";` to storyboard.js -> exit **1**, and it NAMES the file:
  `SHAPE (shared imports nothing from src/): src/shared/storyboard.js:1 imports "../ui/util.js"` (+ a CYCLE failure too)
- prepend `import { appState } from "../state/index.js";` -> exit **1**, same shape failure naming `state`.
Baseline in the same copy: exit 0, `PASS shared imports nothing from src/ (leaf tier)`.
**LIMIT, stated honestly:** this is an IMPORT-GRAPH gate. It would NOT catch a bare `document.` /
`globalThis.` / `window.` reach inside storyboard.js, because that needs no import.
Checked by hand: `grep -nE "\b(document|window|globalThis|appState|localStorage|fetch)\b" src/shared/storyboard.js`
returns only two COMMENT lines (12, 71). No bare global reach today. Purity is gated for imports,
eyeballed for globals.

## Q2 — CAN THE NEW GATE FAIL? **YES, THREE WAYS, ALL EXERCISED.**
`node scripts/qa/whose_turn_one_fact_check.mjs` on the real tree: 6/6 anchors `yes`, 0 direct calls, **exit 0**.
In the copy:
- reintroduce `setActor(p.idx)` at flow.js humanAct -> `DIRECT setActor() CALLS: 1` ... **exit 1**
- re-`export` setActor in util.js -> **exit 2, "INCONCLUSIVE — the code this gate describes has moved"**
- rename `applyActiveSeat` -> **exit 2, INCONCLUSIVE**
The exit-2 path is LIVE and was not turned into a pass. The builder's account of P4 holds.
**LIMIT:** the gate is textual on `setActor(`. A bypass writing `appState.curSeat=` directly would
not be caught. Checked: `grep -rn "curSeat\s*=" src/` returns exactly ONE writer,
`src/ui/util.js:1828: function setActor(s){appState.curSeat=s;}` (+1 comment). And `__pp4.actor(`
has exactly one caller, `src/ui/util.js:1855`. So the one-writer claim is true today by measurement,
not only by the gate.

## Q4 — GATE COUNT: **DERIVED, not hand-checked.**
`scripts/gate_count_check.js` parses `package.json`'s own `scripts.test` string, splits on `&&`,
counts `node` invocations, and FAILS if that count != the declared `gates.total`. The typed 55 is
an assertion the parser falsifies, not documentation. Red by construction if the chain and the
number disagree. `npm test` line 1: `gates in npm test: 55`.

## Q5 — `npm test` **EXIT 0**, 55 gates, 0 failures. Run by me, log at
scratchpad/npmtest-checker.log.

## Q3 — IS THE ANSWER UNCHANGED? **YES for every consumer. "byte-for-byte" is very slightly overclaimed.**
Differential harness (scratchpad/equiv.mjs): the three OLD walks copied verbatim out of
`git show e2d52878~1` vs `deriveActiveSeat`, over **20,000 randomized event streams**
(1-120 events, 12 event kinds incl. turn/ovens/bake/newround, seats 0-3, and deliberately
10% `p:undefined` / 6% `p:null`), playhead uniform in range:

    trials=20000 oldThrew=0
    mismatch render()=0  activeTurnSeat()=0  currentTurnSeat()=0
    STRICT (===) differences: render=1387 activeTurnSeat=816
    sabotaged-walk mismatches=163   <- harness red-proof: comparing old vs lookback:5 DOES go red

**Read that carefully — there IS one real difference.** Under `==null` collapsing, zero mismatches.
Under strict `===`, 1387/816 differ, and every one of them is the same conversion: where an
establishing event carried `p === undefined`, the old walks returned `undefined`; the new returns
`null` (`storyboard.js:88  return e.p == null ? null : e.p;`).
**No consumer can tell**, verified at each site:
- `board.js:1741` render(): `if(active!=null&&st[active].done)` then `if(active!=null)` — `!=null`.
- `board.js:1449`: `const a=activeTurnSeat(); if(a!=null&&live[a]...)` — `!=null`.
- `board.js:1571,1586,1602,1614`: `activeTurnSeat()===seat` — seat is an integer, so both
  `undefined===n` and `null===n` are false.
- `util.js:currentTurnSeat()` — grep shows **no caller** (the file says so too).
Second difference, in the safe direction: the old render() walk did `events[i].t` unguarded and
would THROW on an out-of-range playhead or a hole; the new clamps (`Math.min(playhead,
events.length-1)`) and skips holes. Strictly more defensive; cannot introduce a crash.
Verdict on the claim: the ANSWER is unchanged. The TYPE of "no seat" changed from `undefined` to
`null` at 7% of samples, and nothing reads it. Say "same answer", not "byte-for-byte".
