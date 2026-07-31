---
phase: 14-engine-adjacent-gameplay-fixes-determinism
reviewed: 2026-07-26T00:00:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - src/engine/index.js
  - src/ui/board.js
  - src/ui/flow.js
  - src/ui/panel.js
  - src/ui/util.js
  - scripts/determinism_baseline.js
  - scripts/determinism_diff.js
  - scripts/bot_storm_narration_test.js
  - scripts/hail_ranking_test.js
  - scripts/storm_moored_reason_test.js
  - docs/DETERMINISM-RERECORD.md
findings:
  critical: 1
  warning: 3
  info: 2
  total: 6
status: issues_found
---

# Phase 14: Code Review Report

**Reviewed:** 2026-07-26T00:00:00Z
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

Reviewed the phase's three engine-adjacent behavior changes (two-gust storm simulator alignment,
bot-hail-costs-an-action, per-square storm rendering) plus the determinism re-record tooling and
its own record-keeping doc. All five automated gates (`hail_ranking_test.js`,
`storm_moored_reason_test.js`, `bot_storm_narration_test.js`, `determinism_baseline.js --verify`,
`determinism_diff.js --assert-clean`) were re-run and pass green against the current tree, and
`npm test`'s full nine-gate chain exits 0 — the tests this phase added are internally consistent
and the 31-seed corpus matches HEAD exactly. `docs/DETERMINISM-RERECORD.md`'s specific factual
claims (manifest `seedCount`/`extraSeeds`/`coverage.shipwrecked`/`engineSourceHash`/`capturedAt`)
were cross-checked against the actual committed `manifest.json` and all match.

Despite the green test suite, one real functional defect was found by tracing `botTurn()`'s new
hail block end-to-end (not exercised by any of the DOM-free unit tests, which only cover the pure
`rankHailTargets`/`priceHailOffer`/`hailWorthIt` helpers, never the orchestration around them) — a
double-fired narration/render call that will visibly double-flash the same message to every player
after any resolved bot hail. Two further consistency/design gaps were found in the engine's own
"newround" event shape and in the determinism-diff tool's line-alignment strategy, both currently
latent but worth a maintainer's attention given how central the "identical narration everywhere"
and "identical behavior live vs. headless" invariants are to this file set. Per the phase context's
specific ask, `src/ui/board.js`'s deliberately-duplicated whose-turn-is-it scan (`render()` vs. the
new `renderLiveShips()`) was diffed line-by-line and has NOT drifted — both copies are identical in
logic (only the position source and epilogue differ, exactly as the header comment describes).

## Critical Issues

### CR-01: Bot hail resolution double-fires botBeat(), double-narrating and double-rendering every hail

**File:** `src/ui/flow.js:719` and `src/ui/flow.js:723`
**Issue:** `botTurn()`'s new bot-hail block (D-02/D-24) calls `await botBeat();break;` at the end of
the `for(const ing of g.needs(p))` loop body once an offer has been made and resolved, and then,
immediately after the loop, unconditionally calls `await botBeat();return;` again whenever
`hailed===true`:

```js
      g.ev({t:"parley",a:p.idx,b:human.idx,offer:finalPrice+" coins",want:ing,ok:dealt,kind:"hail"});
      if(dealt){ /* ...trade event... */ }
      await botBeat();     // <-- first call
      break;
    }
  }
  if(hailed){await botBeat();return;}   // <-- second call, same evIdx, same event
```

Every code path that reaches the inner `await botBeat();break;` (i.e., the offer was sold,
countered, or refused without the shot clock expiring) always falls through to the outer
`if(hailed)` check too, since no event is appended between the two calls and `hailed` was already
set `true` before the `await ask(...)`. `botBeat()` is `netHandlers().onLiveRender();await
narrateCurrent();`, and `narrateCurrent()` re-reads `appState.game.events[appState.evIdx]` — since
`evIdx` hasn't moved between the two calls, the exact same `parley`/`trade` line gets displayed,
held, and faded out TWICE in a row, and `onLiveRender()` re-renders twice. Live, this means every
hail a bot resolves flashes the identical narration line twice back-to-back, adding a full extra
`botMsgHoldMs()` hold (up to 1300ms) of dead time and reading as a broken/stuttering UI — directly
undercutting this same phase's own "bots ride the storm in the open, at a snappier beat" (D-09/D-10)
pacing goal, and ironic given the adjacent storm code explicitly comments "no separate summary emit
or botBeat() here, or every storm outcome double-narrates" while this exact mistake ships one block
below it. Not caught by `hail_ranking_test.js` because that suite only unit-tests the pure
`rankHailTargets`/`priceHailOffer`/`hailWorthIt` helpers, never `botTurn()`'s own orchestration.

**Fix:** Remove the redundant inner call — keep only the loop's `break;` and let the existing outer
check narrate/render once:
```js
      if(dealt){ /* ...trade event... */ }
      break;             // no botBeat() here — the outer `if(hailed)` below already covers it
    }
  }
  if(hailed){await botBeat();return;}
```

## Warnings

### WR-01: Engine's own `newround` event omits `dir2`/`streak`, fields `EVENT_NARRATION.newround` unconditionally reads

**File:** `src/engine/index.js:777` (compare `src/ui/util.js:262-279`)
**Issue:** `Game.play()`'s per-round loop emits its `newround` event as
`this.ev({t:"newround",dir:wind,windStreak:this.noteWind(wind)});` — no `dir2` or `streak` field.
`Game.ev()` auto-injects `wind`/`storm`/`wind2` (not `dir2`/`streak`) onto every event. The live
orchestrator's own hand-built `newround` call (`src/orchestrator.js:681-684`, not touched this
phase) additionally sets `dir2:appState.game.windNow2` and `streak:appState.game.stormNow?
appState.game.stormStreak:0` on the object literal before handing it to `ev()` — so only events
produced through the live/replay path actually carry `dir2`/`streak`.
`EVENT_NARRATION.newround` (`src/ui/util.js`) reads both unconditionally:
```js
const D=DIRNAME[e.dir],D2=DIRNAME[e.dir2];
...
if(e.storm){
  if(e.streak>=2)return {... "The storm's baked in and refuses to cool down!" ...};
```
`DIRNAME` (`src/shared/index.js:145`) has no fallback entry, so `DIRNAME[undefined]` is
`undefined` — narrating a `newround` event produced by the pure engine's own `play()`/`takeTurn()`
during a storm would literally interpolate the string `"undefined"` for the second wind direction,
and could never trigger the "storm's baked in" copy since `e.streak` would also be `undefined`.
Currently latent (only `scripts/determinism_baseline.js`'s headless corpus calls `play()`, and it
never narrates events — it only hashes them), but it is a real drift between the two code paths
that are both supposed to feed the SAME narration function, in the same file set this phase
explicitly hardened for "narration must read identically live, on every guest, and on replay."
**Fix:** Either have `Game.play()`'s `newround` emit include `dir2`/`streak` the same way the
orchestrator does (best: derive both from state the engine already tracks — `this.windNow2` and
`this.stormStreak` — so both code paths build the exact same event shape), or give
`EVENT_NARRATION.newround` defensive fallbacks (`e.dir2||e.dir`, `e.streak||0`) so a
differently-shaped `newround` event degrades gracefully instead of rendering "undefined".

### WR-02: `determinism_diff.js` diffs by raw line index, which stops being a like-for-like comparison once event counts diverge

**File:** `scripts/determinism_diff.js:62-139`
**Issue:** `diffOneSeed()` compares `storedLines[li]` against `freshLines[li]` for every index `li`
up to `Math.max(storedLines.length, freshLines.length)`. This is sound while stored/fresh event
COUNTS match (or diverge only briefly), but this phase's own re-record (documented in
`docs/DETERMINISM-RERECORD.md` §5) shows every seed's fresh event count differs from the old
baseline once D-15/D-18 change routing/movement. Once counts diverge, a line index no longer
identifies "the same logical event" on both sides — e.g. the `__final__` line is always pushed
last (`serializeSeed()`, `determinism_baseline.js:112-116`), so it lands at a different index
whenever the two runs have different total event counts, meaning the tool ends up diffing a
`__final__` line against whatever ordinary game event happens to occupy that same index on the
other side. `docs/DETERMINISM-RERECORD.md` §5.4 partially surfaces this itself ("the `other` key's
appearance/disappearance ... appears at a shifted line position, not a new field") but the tool's
own key/type histograms (`byEventType`, `byKey`) do not distinguish "these two lines are the same
event with a changed field" from "these two lines are unrelated events that happen to share an
index" — both count identically. This did not affect the actual capture-now/add-a-seed decisions
(which relied on `--ignore-keys` and the coverage assertion, not the raw histograms, for the
load-bearing evidence), but a future maintainer re-running this tool after the NEXT engine change
could be misled by the histogram's face-value "what changed" summary once counts diverge again.
**Fix:** No change required for this phase's already-closed decision, but consider a follow-up: align
by event `t`+`p`+`round` (or a stable per-seed sequence number) rather than raw array index before
diffing, or at minimum annotate the report with each seed's stored-vs-fresh event COUNT so a reader
can tell at a glance whether line-by-line alignment is still meaningful for that seed.

### WR-03: `botMsgHoldMs()` duplicates `msgHoldMs()`'s formula body verbatim

**File:** `src/ui/util.js:534-541` vs. `569-577`
**Issue:** The two functions share the exact same `base`/`charTime`/pause-counting logic
(`base=1000,charTime=50`, then `raw+=pauses*300`), differing only in the clamp bounds
(`[1200,7000]` vs. `[900,2600]`) and the final multiplier (`MSG_HOLD_MULTIPLIER=0.8` vs.
`BOT_MSG_HOLD_MULTIPLIER=0.5`). This is the same class of drift risk the file's own header
comments elsewhere warn about for duplicated render-state (`cell`/`shipEls`) — any future tuning of
the shared pacing shape (e.g., changing the per-pause bonus, or how trailing punctuation is
stripped) has to be applied in two places by hand, and nothing enforces that it is.
**Fix:** Extract the shared `raw` computation into one helper, e.g.
`function rawHoldMs(text){...}`, and have both `msgHoldMs`/`botMsgHoldMs` call it with their own
floor/ceiling/multiplier, so the pacing shape itself has one source of truth.

## Info

### IN-01: `flash()`'s `ms` parameter is fully vestigial

**File:** `src/ui/panel.js:374-390`
**Issue:** `flash(msg,ms,holdMs)`'s `ms` parameter has never been used to size the hold (the
function's own comment says so: "ms is no longer used to size the hold"), and this phase's new
`holdMs` third parameter is the only override that actually changes timing. Every call site in the
reviewed files still passes `ms` positionally (usually as a stale number or `null`), which reads as
though it does something. Low priority, but worth a follow-up cleanup (drop the parameter, or
rename it to make its dead status obvious) since a future reader will otherwise reasonably assume
passing a number there changes pacing.

### IN-02: `botTurn()`'s second-gust hold duration is sized off HTML-bearing text, not the visible text

**File:** `src/ui/flow.js:657-659`
**Issue:** `secondLegMsg` (built solely to size `botMsgHoldMs()`) still embeds `pn(p.idx)`'s inline
`<b style="color:#…">Name</b>` markup, so the hold duration counts markup characters as if they
were read time — inconsistent with `flash()`'s own DOM-based `el.textContent` (tag-stripped) hold
calculation used everywhere `holdMs` is NOT explicitly overridden. In practice this has no
observable effect today, since `botMsgHoldMs`'s 2600ms ceiling clamp saturates for essentially any
message long enough to include a colored captain name plus real narration text — but it's worth
trimming to the plain name (or just reusing `pname(p.idx)`) for correctness if the clamp bounds are
ever retuned.

---

_Reviewed: 2026-07-26T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
