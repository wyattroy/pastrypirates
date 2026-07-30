---
phase: quick-20260730-playtest-notes-fixes
plan: 01
subsystem: narration, coin-safety, flow
tags: [playtest-fixes, narration, coin-audit, determinism-safe, ui-timing]
status: complete
requires:
  - ".planning/quick/20260729-playtest-bug-fixes/COIN-AUDIT.md"
  - ".planning/phases/15-narration-audit-fixes/15-PLAYTEST-NOTES.md"
provides:
  - "coinShortfall() — one shared coin re-validation, applied at 7 at-risk debit sites + site 13's belt"
  - "docs/DETERMINISM-RERECORD-NEXT.md — the queued engine-purity spec"
  - "G8 ghost-overlay cross-fade in panel(), 180ms"
affects: [src/ui/util.js, src/ui/flow.js, src/ui/panel.js, src/orchestrator.js, index.html, art-review/, scripts/]
tech-stack:
  added: []
  patterns:
    - "shared pure helper beside counterHeadroom"
    - "absolutely-positioned ghost clone for cross-fade"
    - "fixture re-pin with reason in _provenance"
key-files:
  created:
    - docs/DETERMINISM-RERECORD-NEXT.md
    - .planning/todos/pending/human-trade-counter-offer.md
    - .planning/todos/pending/flee-not-offered-when-broke.md
  modified:
    - src/ui/util.js
    - src/ui/flow.js
    - src/ui/panel.js
    - src/orchestrator.js
    - index.html
    - art-review/narration-core.js
    - art-review/narration-table-baseline.json
    - art-review/narration-inventory.json
    - scripts/narration_test.js
    - scripts/narration_flow_test.js
    - docs/DETERMINISM-RERECORD.md
    - .planning/REQUIREMENTS.md
    - .planning/STATE.md
decisions:
  - "T7's reorder swaps ONLY the two awaited UI calls; the silent RNG-consuming setup stays put"
  - "G8 is a short OVERLAP cross-fade at 180ms, not a strict fade-then-show — a strict sequence would delay every line"
  - "G6 site 11 re-validates the LOSING branch only; a win is a credit and must not be clawed back"
  - "G3 is an INTERIM display-layer fix; the proper fix is queued for the next gated re-record"
metrics:
  duration: single session, 2026-07-30
  tasks: 9
  commits: 9
  completed: 2026-07-30
---

# Quick Task 20260730 — Playtest Notes Fixes (G1–G9) Summary

Nine findings from Wyatt's 2026-07-30 playtest notes closed in nine atomic commits, each green on
`npm test`, with `src/engine/index.js` left byte-identical so none of the 31 determinism fixtures
moved.

## What landed

| ID | Commit | What |
|----|--------|------|
| G4 | `de29b07` | Intro banner opens with "Choose a recipe"; recipe prompt cut to one line |
| G7 + OOS-1 + OOS-2 | `b69b483` | NARR-06 reworded to hold length; counter-offer backlogged; flee ruling recorded |
| G2 | `c83ca8b` | A gust shoving ye onto the Tortuga berth reads as a lucky break, not "still docked" |
| G1 | `01ddf89` | Addressed dock lines say what happened to ye, not where ye are |
| G3 | `d1e8a30` | Battle spoils render the coin icon; engine diff empty |
| G9 | `d695d65` | `docs/DETERMINISM-RERECORD-NEXT.md` — the queued engine-purity spec |
| G5 | `0ecc8af` | Recipe selection moved ahead of the turn-order intro |
| G8 | `267983b` | The outgoing narration line fades when — and only when — one replaces it |
| G6 | `3d559df` | One shared coin re-validation at every debit site that can interleave |

## Final verification (the plan's own six checks)

1. `npm test` — **exit 0**, 23/23 assertion groups PASS, 16 gate scripts.
2. `git diff --stat 9dd36c0..HEAD -- src/engine/index.js` — **prints nothing.** The single most
   important check in the plan.
3. `git diff --stat 9dd36c0..HEAD -- package.json package-lock.json` — **prints nothing.**
4. `node scripts/determinism_baseline.js --verify` — **All seeds passed.**
5. `git log --oneline 9dd36c0..HEAD` — **nine commits**, one per task.
6. `git diff --numstat .planning/REQUIREMENTS.md` — **`1 1`**, exactly one line changed.

No disposition file (`15-DISPOSITIONS-*.json`, `15-*-APPROVED.*`) was touched.

## T7 — all four dependency checks HELD

The reorder went ahead. Each was verified in source, not assumed:

1. **HELD** — `appState.game.shuffle(order)` consumes `game.r()` (`src/engine/index.js:228`).
2. **HELD** — `recipeDraftNet` consumes `game.r()` for bot picks (`orchestrator.js:674`) and calls
   `logDecision` for human picks (`:699`, `:715`).
3. **HELD** — `showTurnOrderIntro` -> `netIntroBarrier` (`flow.js:988`) consumes no `game.r()` and
   calls no `logDecision`, and returns immediately when `appState.replaying`. Extended beyond the
   plan's wording to its callees, since the barrier delegates: `localAsk`, `remoteDraftPrompt` and
   `passGate` consume neither either. `logDecision` exists at exactly one place — inside `ask()`
   (`orchestrator.js:391`) — which the barrier never calls.
4. **HELD** — `recipeDraftNet` reads nothing from `appState.turnOrder` and iterates `pending` in
   seat-index order.

Only the two awaited UI calls were swapped. The silent setup (shuffle, staggered coins,
`turnOrder`, `buildPlayerRows`, `netSetTurnOrder`) was left exactly where it was.

## T9 — no site had to STOP; every fallback pre-existed

All seven at-risk sites fell through to an existing guarded path with existing copy. **No
player-facing string was invented anywhere in this plan.**

| # | Site | Fallback used (confirmed in source) |
|---|------|--------------------------------------|
| 2 | trade counter settlement | the "Walk away" outcome — parley + `@copy adhoc.trade.refusalbot` |
| 3 | accepted-offer settlement | the existing decline path — `@copy adhoc.trade.refusalhuman` |
| 5 | storm anchor "pay" | the existing `flip` branch; `brokeAnchorLine` already explains a missing pay option |
| 7 | sail from action menu | the "no destination" outcome — the ship does not move, renders nothing |
| 8 | sail at turn start | same shape as #7 |
| 11 | side-bet stake settlement | treated as the free call; `settleSideBets` already renders "no bounty" |
| 14 | defender flee | `flee = false`, keep fighting; renders nothing |

- **Site 4** (dock buy) verified already closed by yesterday's D-40 guard (`if(buy&&p.coins>=3)`,
  whose own comment cites COIN-AUDIT site 4). Left untouched and **not** double-guarded — asserted.
- **Site 13** carries the engine's own guard, placed at the **top of `asyncBattle`, before the
  opening `flash()`** — the specific answer to the audit's "a battle snapshot may already be in
  flight" concern. Both callers confirmed to handle a falsy return; neither reads the return value.
- Sites the audit marked SAFE (6, 9, 10, 12, 15, 16, 17 and every engine row) were left alone.

**One refinement over the plan's table:** site 11 re-validates the **losing branch only**. The stake
is never escrowed at collection time, so a win is a pure credit — clawing it back would be a new
bug, not a fix.

## T8 — final fade duration: **180ms** (`.18s`)

Unchanged from the plan's proposal. Implemented as an absolutely-positioned ghost clone in
`panel()`, reusing the existing `.apMsg.fadeOut` rule (retuned from `.5s`), which had had no live
consumer since F6.

Both of last night's recorded objections are answered rather than overridden:

- *"delays every line by half a second"* — 180ms, and nothing is deferred or awaited. `panel()`
  stays synchronous, which is required because `flash()` reads `.apMsg._revealDone` the instant it
  returns.
- *"two live lines snap the panel height"* — the ghost is `position:absolute`, out of flow, so
  `resizePanel`'s `inner.offsetHeight` still measures only the incoming message.

`pointer-events:none` guards prompt-button clicks; removal runs on `animationend` **plus** a 250ms
`setTimeout` belt for backgrounded tabs; reduced-motion gets an instant swap with no ghost. F6's
trailing-line rule holds **by construction** — the ghost exists only when a replacement arrives, so
`showNarration` still schedules nothing.

## Fixtures re-pinned, each with its reason

Every re-pin states its reason in the fixture's own provenance/description. **No pattern was
widened, no equality loosened, no disposition file edited.**

| Commit | Fixture | Moved | Reason recorded |
|--------|---------|-------|-----------------|
| `c83ca8b` | `narration-table-baseline.json` | 50 -> **51** cards; one ADDED (`table:moored~homeMoved`), zero moved | G2 paragraph in `_provenance`: a new door onto already-shipped approved copy; D-21 requires the card; D-28 intact |
| `01ddf89` | `scripts/narration_test.js` | 3 exact literals + `ADDRESSED_SHAPE`; D-16 icon check split in two | G1: descriptions rewritten to name the new invariant, plus a **new** positive check that no addressed branch names its place, over all 7 ingredients |
| `01ddf89` | `narration-table-baseline.json` | **3** cards, addressed variants only, count unchanged | G1 paragraph: narrows what F10 widened, at Wyatt's word; every neutral line byte-identical |
| `d1e8a30` | `scripts/narration_test.js` | 2 fabricated battle events repaired | G3: **unplanned** — see deviation 2 below |
| `d1e8a30` | `narration-table-baseline.json` | **2** cards (`table:battle`, `table:battle~cleaned`), count unchanged | G3 paragraph: `table:battle~crate` deliberately unmoved as the correctness check; `label` fields untouched (card titles, not shipped copy) |

## Deviations

**1. G1 moved three baseline cards, not the four the plan predicted.** The plan listed `table:dock`
among them, but `table:dock` is the `ing` branch, which G1 explicitly leaves unchanged. Three is the
correct number; the neutral half of all four dock cards is byte-identical, asserted.

**2. G3 also reddened two `scripts/narration_test.js` checks, which the plan did not anticipate.**
The one substantive deviation, investigated rather than papered over. Both failing fixtures
**violated the D-51 paired-field invariant** that G3's crate case relies on:

- one paired a hand-written placeholder `spoil` (`<img class="ic" src="x">Wheat`) with
  `spoilIng:"wheat"`;
- the other keyed on `spoilIng:"cacao"` — **not an ingredient the game has** (the real key is
  `cocoa`) — fabricating a spoil the game cannot emit for a crate it does not carry.

Both real emit sites (`orchestrator.js:586`, `engine/index.js:572-573`) set
`spoil=ilabelImg(pick), spoilIng=pick` together, so production renders byte-identically — proven by
`table:battle~crate` **not** moving in the audit baseline, whose fabricated events *do* satisfy the
invariant. The fixtures were repaired to values the game can actually emit, which makes the
assertions **stricter** (they now pin the real custom art). No pattern widened.

**3. `determinism_baseline.js --verify` reports `SOURCE: moved, behavior identical`, not
`SOURCE: unchanged` as the plan's verification step 4 expected.** **Pre-existing, not caused by this
work**: `engineSourceHash` is computed over `src/engine/**` + `src/shared/**`
(`scripts/lib/load_engine.js:38-50`), and `git diff 9dd36c0..HEAD -- src/engine/ src/shared/` is
empty. The message is a Phase 8 relocation artefact, as its own text says. All seeds passed.

**4. T9's barrel export needed no edit.** The plan called for exporting `coinShortfall` from
`src/ui/index.js`; that file already does `export * from "./flow.js"`, so the export exists
automatically. Only the orchestrator's import list needed the name added.

**5. T8 added source-text assertions to `scripts/narration_test.js` rather than nothing.** The plan
said to add tests to `narration_flow_test.js` only if a genuine pure function fell out, and none
did — so nothing went there. Nine source-text assertions were added beside the existing F6 panel.js
block instead, in that file's established DOM-free convention. They catch a regression to
fade-to-empty, a lost `pointer-events` guard, a `panel()` that acquires an `await`, a ghost with no
removal path, and the rejected `.5s` returning.

## Known stubs

None. No stub, placeholder, or TODO was introduced.

## Not verifiable in this environment

**T8's fade is the plan's one blocking human-verify item and could not be checked here — there is no
browser in this execution environment.** The gates confirm the code shape (ghost created only on
replacement, out of flow, `pointer-events:none`, `panel()` still synchronous, 180ms), but whether
180ms *reads* right is Wyatt's taste call. Likewise T3's lucky break is only observable when a storm
actually shoves a ship onto the Tortuga berth.

## Self-Check: PASSED

All three created files exist on disk; all nine commit hashes resolve in `git log`.
