---
phase: 01-before-the-engine-freezes
verified: 2026-08-19T11:21:51Z
status: human_needed
score: 22/22 must-haves verified
behavior_unverified: 0
overrides_applied: 0
requirements_verified: [FIX-01, TEST-01, TEST-02, RULE-01, RULE-02, FIX-06]
gates_red_proofed: 3
deferred:
  - truth: "The six new `4/scripts/*` gates are hand-run only — no npm script, no CI, nothing re-runs them automatically."
    addressed_in: "Phase 3"
    evidence: "Phase 3 'The Safety Net' goal: 'The game being promoted gets the mechanical guarantees v1 had — before the largest piece of work in the milestone is built on top of it.' 01-CONTEXT.md also states explicitly: 'Not in this phase: ... any gate or corpus work (Phase 3).'"
flagged_prohibitions:
  - statement: "The balance verdict must not be auto-decided, and the question must not be skipped because the numbers look acceptable to the executor (D-07)."
    plan: "01-06"
    verification: judgment
    disposition: unverified-prohibition — human review recommended
    note: "Everything checkable is consistent with a genuine human ruling (payout still 1, held-out family not run, ladder not re-run, decision recorded verbatim in its own appended section). But no codebase artifact can prove Wyatt actually said the words. Only Wyatt can confirm this."
  - statement: "The accessor exclusion must not be broadened into a general loosening of the call-site scan."
    plan: "01-01"
    verification: judgment
    disposition: evidenced by verifier sabotage — see Gate Red-Proofs #2
  - statement: "The balance measurement must not carry a hardcoded threshold for what counts as materially more."
    plan: "01-03"
    verification: judgment
    disposition: evidenced — `bot_ladder4.js --json` output contains no threshold or verdict field; report carries none
  - statement: "Replacing a produced quantity with a derived one must not make an existing check vacuous."
    plan: "01-03"
    verification: judgment
    disposition: evidenced by verifier sabotage — see Gate Red-Proofs #3
  - statement: "The published bot numbers in the design docs must not be deleted or quietly corrected in this phase."
    plan: "01-05"
    verification: judgment
    disposition: evidenced — `docs/` is absent from the entire phase diff
  - statement: "Git state must never be reported from memory or from earlier in the session."
    plan: "01-06"
    verification: judgment
    disposition: evidenced — verifier re-ran the counts independently; 0 ahead, 0 behind
human_verification:
  - test: "Confirm you personally made the D-07 call. The record says: on 2026-08-19 you were shown the before/after ladder numbers at a blocking checkpoint, given three options — ship at one coin, lower the payout before the freeze, or spend one more run on the held-out seeds — and you said \"ship it\"."
    expected: "You remember making that call, and one dubloon is what you meant."
    why_human: "No file can prove a person said something. Everything downstream of the decision is consistent with it, but the decision itself is only yours to confirm. It matters because Phase 3 freezes the engine on this payout, and changing it afterwards costs a re-record."
  - test: "Open playpastrypirates.com/4 on your phone (look for build stamp 2026-08-18e), start a solo game and pass a turn. Watch the Pass button and the narration line."
    expected: "The Pass button reads 'Pass (+1🌕)' with the coin as a real coin image, the button text never splits across a line, your purse goes up by exactly one, and the narration ends '... Recipe idea! (+1🌕)' — again with a real coin image, and the whole tag staying on one line."
    why_human: "I proved the text is correct as a string, in all 100 renderings, and that the purse rises before the event is recorded. What I cannot see is the browser: whether the coin image actually resolves, and whether the no-break wrapping holds at your phone's width."
  - test: "On the same phone, after visiting /4 at least once: go to playpastrypirates.com (the live game) and check the turn clock is still set the way you left it. Then reload /4 and check again."
    expected: "The live game's clock setting is untouched from the second visit onward. /4's clock stays off. Neither game changes the other."
    why_human: "The one-time cleanup is proven against a fake store, but the thing FIX-01 exists to protect is two real games sharing one real browser's storage. That only happens on a real device."
  - test: "Read the plain-English opening of 01-BALANCE-DELTA.md ('The short version, in plain words') and confirm it describes what you were actually shown."
    expected: "Bots pass a little more (55.6 per 100 turns vs 55.0), voyages got slightly shorter not longer (14.84 rounds vs 15.16), the trader captain won noticeably less (86 vs 101 of 400), every game finished."
    why_human: "This is the summary the decision rested on. Worth one read-back before Phase 3 freezes the engine on it."
---

# Phase 1: Before the Engine Freezes — Verification Report

**Phase Goal:** The development build stops harming the live game, the largest new module becomes testable, and the last gameplay rule lands — so that nothing after this point forces the v2 determinism corpus to be recorded twice.

**Verified:** 2026-08-19T11:21:51Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## The headline, in plain English

**Everything this phase promised is actually in the code, and I proved it by breaking things on purpose.**

The new game no longer touches the live game's clock setting. The biggest new file can now be loaded and tested outside a browser. Passing pays a dubloon at all three places a pass can happen — human, bot-in-the-browser, and bot-in-the-simulator — and every one of the 100 possible pass narrations tells the captain they were paid, in your exact approved words. The dead second bot brain is gone, and the one that ships is untouched.

**I did not take the summaries' word for any of it.** I re-ran every check myself, wrote three of my own from scratch that do not use the phase's own tests, and then deliberately planted three faults to confirm the tests can actually go red. All three caught their fault and named it. A test that has only ever been seen passing is indistinguishable from a test that cannot fail — these can fail.

**Four things need you, not me.** The biggest is that the record says you were shown the balance numbers and said *"ship it"* — no file can prove a person said something, and this one matters because Phase 3 locks the engine on that answer. The other three are things only a real phone can show: the coin picture actually appearing, the tag not splitting across a line, and the two games genuinely leaving each other's settings alone.

---

## Goal Achievement

### Observable Truths

Truths 1–5 are the ROADMAP contract (Success Criteria). Truths 6–22 are the plan-level must-haves that add detail beyond them.

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | The new game still defaults its clock OFF but stores it under its own key — no leak to the other game, none pushed to the room | ✓ VERIFIED | All five `4/` sites write `pp4_timerOff` (`stage.js:915,1537`; `orchestrator.js:184,1574,1579`). The seed at `stage.js:1537` still sets `timerOff=true` when nothing is stored — default unchanged (D-03). `orchestrator.js:1579`, the read that pushes to the room, now reads the per-game key |
| 2 | `4/src/ui/stage.js` imports under Node without throwing, and `4/scripts/no_undef_check.js` exits 0 | ✓ VERIFIED | `node 4/scripts/stage_import_check.js` → `PASS TEST-01 — 4/src/ui/stage.js imported under Node without throwing`, exit 0. `node 4/scripts/no_undef_check.js` → `Scanned 25 file(s)... PASS`, exit 0. The bare call at `:190` is now `if (typeof window !== "undefined") { window.addEventListener(...) }` |
| 3 | A captain who passes receives one dubloon at every one of the three `{t:"pass"}` emission sites | ✓ VERIFIED | Exactly one emission (`engine/index.js:960`), reached through one shared `doPass`. Three call sites: `flow.js:1882` (human menu), `flow.js:2163` (animated bot fallback), `engine/index.js:2742` (engine fallback). Independent probe: purse 3 → 4, delta 1 |
| 4 | The pass narration tells the captain they were paid, in both renderings, across all 50 sea-creature entries | ✓ VERIFIED | My own probe (not the phase's gate) rendered all 100: `SEA_CREATURES length = 50`, `checked = 100  failures = 0`. Every one ends `<span class="nobrk">Recipe idea! (+1🌕)</span>` — D-06's exact approved wording at the shipped default |
| 5 | The engine ships exactly one bot planner; the `planTurnClassic` subtree is gone | ✓ VERIFIED | `planTurnClassic` returns zero hits in `4/src/engine/index.js`. Only two planner methods remain: `planTurn(p){ return this.planTurnV3(p); }` at `:2081` and `planTurnV3` at `:2433` |
| 6 | The two `no_undef` checkers stay byte-identical | ✓ VERIFIED | `diff scripts/no_undef_check.js 4/scripts/no_undef_check.js` → no output, exit 0. Root copy also exits 0 (`Scanned 21 file(s)`) |
| 7 | The accessor heuristic narrows false positives **without weakening the check** — a bare module-scope browser-global call is still reported | ✓ VERIFIED | Red-proofed by verifier sabotage. See Gate Red-Proofs #2 |
| 8 | Exactly one quoted occurrence of the legacy key remains under `4/src/**/*.js`, inside `cleanupLegacyTimerKey` | ✓ VERIFIED | One hit: `4/src/ui/stage.js:1522  store.removeItem("pp_timerOff")`, inside `cleanupLegacyTimerKey` (`:1519-1526`). The five other mentions in the tree are all deliberately unquoted prose in comments |
| 9 | D-02 — the cleanup runs at most once per browser; a re-planted legacy key survives untouched | ✓ VERIFIED | My own probe against a fake store (does not use the phase's gate): second call returns `false`, re-planted key survives as `"0"`, and `removeItem` was **not even attempted** (0 calls) |
| 10 | FIX-01 empty edge — absent, empty-string and `"1"` legacy values all reach the same terminal state; a fully-throwing store returns without throwing | ✓ VERIFIED | Same independent probe: `""` and `"0"` both removed (not skipped as falsy), marker set in all three cases including "nothing to delete"; throwing store returned `false` and did not throw |
| 11 | D-04 — the three shared identity keys are still un-prefixed | ✓ VERIFIED | `pp_muted` (`audio.js:49`), `pp_id` (`util.js:1931-1932`), `pp_lastName` (`util.js:1942,1945`). Zero occurrences of `pp4_id` / `pp4_lastName` / `pp4_muted` anywhere in `4/src` |
| 12 | The live game's own files under root `src/` were not modified | ✓ VERIFIED | `git diff --name-only a23af98..HEAD -- src/` → empty across the whole phase |
| 13 | All three sites call one shared `Game.prototype.doPass(p)` rather than three inline increments | ✓ VERIFIED | `doPass` defined once at `engine/index.js:958`; three call sites, no inline `coins+=` at any pass site |
| 14 | RULE-01 ordering (hard predicate) — the purse is raised **before** the event is recorded | ✓ VERIFIED | Source: `p.coins+=this.cfg.passCoin` (`:959`) precedes `this.ev({t:"pass"...})` (`:960`). **Behaviourally proven**: the recorded pass event's own state snapshot reads `coins: 4` for the acting seat and `3` for the other three — the post-payment purse. Red-proofed by sabotage (Gate Red-Proofs #1) |
| 15 | The coin is never conditioned on the record flag; the human-only sea-cursor advance stays outside `doPass` | ✓ VERIFIED | `doPass`'s body is two statements with no `this.record` guard. `advanceSeaCursor(p)` sits at `flow.js:1883`, outside the shared method, guarded by `p.idx===appState.game.seaSeat` |
| 16 | All 100 hand-written sea-creature strings are untouched | ✓ VERIFIED | `4/src/shared/index.js` — which holds the 50 `{y,t}` entries — is **absent from the entire phase diff**. Independent of any test claim |
| 17 | The four deleted helpers are the un-suffixed originals only; the v3-suffixed ones are present and live | ✓ VERIFIED | `turnsToWin`, `turnsToWinIf`, `denialValue`, `legTurns` — zero word-boundary hits. `legTurns3` (7), `turnsToWin3` (3), `turnsToWin3If` (10), `tour3` (5) all present and called from the shipping planner |
| 18 | The divergent float epsilon is resolved — one tie-break tolerance remains | ✓ VERIFIED | `1e-9` → zero hits under `4/src/engine/`. `1e-12` → 3 hits, matching the plan's "three sites" claim exactly |
| 19 | The engine gains no new source of nondeterminism | ✓ VERIFIED | `grep -rn "Math\.random\|Date\.now\|performance\.now" 4/src/engine/` → **zero occurrences**. Asserted independently, and also as a control inside two of the phase's own gates |
| 20 | `scripts/bot_ladder4.js` runs one brain, still runs after the deletion, and prints no verdict of its own | ✓ VERIFIED | `node scripts/bot_ladder4.js 20 7919 --json` → exit 0, emits per-seat wins/turns/passes/passRate, `meanRoundsPerVoyage`, `unfinished`, `winsBySeat`, `passRateSpreadAcrossSeats`. No threshold or verdict field. No `CLASSIC_PLAN`, no prototype monkey-patch |
| 21 | The delta report uses the identical command and seeds, reports every quantity as a before/after pair, and carries no threshold or verdict | ✓ VERIFIED | Field-by-field identity table in `01-BALANCE-DELTA.md` (command, games, seedMult, ruleset, brain, strategies — all TRUE). Pass rate, mean rounds, unfinished and win distribution all appear as pairs. The decision lives in a separate appended section headed "recorded, not concluded" |
| 22 | No site-identity file left this repository; build stamp bumped; `main` and `origin/main` at zero divergence | ✓ VERIFIED | `CNAME`, `robots.txt`, `sitemap.xml` — zero hits in the phase diff. `PP4_STAMP` `2026-08-15d` → `2026-08-18e`. Re-ran the counts after `git fetch`: **0 ahead, 0 behind** (see note below on which commit carries the stamp) |

**Score: 22/22 truths verified** (0 present-but-behaviour-unverified, 0 overrides applied)

---

## Gate Red-Proofs — I planted three faults and confirmed the gates caught them

CLAUDE.md §4: *"check that a check can FAIL before believing it passing."* Each sabotage was reverted immediately and the tree confirmed byte-identical afterwards.

### #1 — the ordering rule (RULE-01's hard predicate)

**Fault planted:** swapped the two lines in `doPass` so the event is recorded before the coin is paid.

```
FAIL  ORDERING: the pass entry's own snapshot shows the purse AFTER the payment      got=3 want=4
FAIL  ORDERING: and that snapshot purse is one higher than before the call           got=3 want=4
FAIL  LEG B: and the recorded snapshot still shows the post-payment purse at 7       got=3 want=10
FAIL  ORDERING: the recorded snapshot for that turn shows the post-payment purse     got=3 want=4
  5 source anchor(s) located, 4 failure(s)     EXIT=1
```

**Reverted** → `git status` clean, gate back to exit 0, file byte-identical to backup.

### #2 — the loosened accessor heuristic (TEST-02's real risk)

The heuristic was widened this phase to stop flagging `set subject(v)`. The danger is that it also stops catching real faults.

**Fault planted:** a bare module-scope `addEventListener("resize",()=>{})` in `4/src/ui/stage.js` — exactly the class of bug TEST-02 exists to catch.

```
FAIL no-undef (module-internal D-04) — 1 undeclared call-position identifier(s)
  - src/ui/stage.js:1519: "addEventListener(" — addEventListener("resize",()=>{});
EXIT=1
```

**Caught, with the exact line.** The exclusion narrowed the false positives without blinding the check. **Reverted** → clean.

### #3 — the payout gates after the interleaved quick task made the amount derive

The quick task `260818-vot` moved the payout to `cfg.passCoin`. CLAUDE.md §2 warns that replacing a written-out number with a derived one *"breaks every test that reads it — making them vacuous, unable to fail, which still reads as protection."*

**Fault planted:** `passCoin:1` → `passCoin:2`.

```
pass_coin_test:      FAIL  LEG A: the shipped default payout is one dubloon    got=2 want=1
                     FAIL  doPass raises the acting captain's purse by exactly one dubloon  got=2 want=1
                     EXIT=1
pass_narration_test: FAIL  LEG A: the shipped default payout is one dubloon    got=2 want=1
                     FAIL  #00 addressed ... the tag appears 0 times, not once
                     EXIT=1
```

**Both gates are still falsifiable.** Each keeps a hand-typed `const SHIPPED_PAYOUT = 1` that pins the config rather than reading it back — the narration gate even labels it *"hand-typed, never read back off the config it is pinning"*. **Reverted** → clean, both exit 0.

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `4/scripts/stage_import_check.js` | TEST-01 gate | ✓ VERIFIED | Exit 0. Exits explicitly via `process.exit(0)` rather than disabling the module-scope watchdog |
| `4/scripts/no_undef_check.js` | TEST-02 gate, heuristic fixed | ✓ VERIFIED | Exit 0, 25 files scanned, red-proofed |
| `scripts/no_undef_check.js` | Same fix, byte-identical | ✓ VERIFIED | Exit 0, 21 files, `diff` empty |
| `4/scripts/pp4_timeroff_check.js` | FIX-01 gate — source shape + runtime behaviour | ✓ VERIFIED | Exit 0. Asserts D-02 marker semantics, D-03 default, D-04 identity keys (as **presence**, not absence-of-prefix — an absence assertion would go green on an empty tree) |
| `cleanupLegacyTimerKey` in `4/src/ui/stage.js` | Exported one-time cleanup | ✓ VERIFIED | `:1519`, exported, takes `store` so it is drivable headlessly. Called from `initStage()` at `:1532` before the seed reads anything |
| `Game.prototype.doPass(p)` | Shared pass method | ✓ VERIFIED | `engine/index.js:958`, three call sites |
| `4/scripts/pass_coin_test.js` | RULE-01 gate | ✓ VERIFIED | Exit 0, red-proofed twice |
| `4/scripts/pass_narration_test.js` | RULE-02 gate, 100 renderings | ✓ VERIFIED | Exit 0, `100 renderings checked, 0 failure(s)`, red-proofed |
| `4/scripts/planner_singleton_check.js` | FIX-06 gate | ✓ VERIFIED | Exit 0, `131 prototype member(s) inspected`. Asserts both directions — dead helpers absent AND v3 helpers present and callable |
| `scripts/bot_ladder4.js` (rewritten) | One-brain ladder | ✓ VERIFIED | Runs, exit 0, no `CLASSIC_PLAN`, no monkey-patch |
| `01-BALANCE-BASELINE.md` | Before-run with provenance | ✓ VERIFIED | Command, SHA `a019253`, node v25.9.0, full JSON record. Baseline SHA is before `8a9cafd` (the dubloon), confirmed by commit order |
| `01-BALANCE-DELTA.md` | After-run diff, no verdict | ✓ VERIFIED | Same command/seeds, pairs throughout, decision appended as a separate dated event |
| Bumped `PP4_STAMP` | Wyatt can see the work | ✓ VERIFIED | `2026-08-18e`. See note below |

**Note on the stamp.** Plan 06's must-have said *this plan* bumps the stamp. It did not, and that is correct: the checkpoint answer was "ship as is", so plan 06 changed no `4/` code. The stamp was bumped by commit `07a7731`, and `git diff --name-only 07a7731..HEAD -- 4/` is **empty** — every commit after it is documentation. So the stamp on `main` points at exactly the code Wyatt can play. A second bump would have sent him to look for a build identical to the one he already had.

---

## Key Link Verification

| From | To | Via | Status |
|---|---|---|---|
| `initStage()` | `cleanupLegacyTimerKey(localStorage)` | Direct call at `stage.js:1532`, before the seed read | ✓ WIRED |
| `orchestrator.js` room push | `pp4_timerOff` | `:1579` reads the per-game key before `netSetTimerOff` | ✓ WIRED |
| `4/scripts/pp4_timeroff_check.js` | `cleanupLegacyTimerKey` | `await import("../src/ui/stage.js")` — only possible because plan 01 made stage.js load under Node | ✓ WIRED |
| `flow.js` human menu | `doPass` | `appState.game.doPass(p)` at `:1882` | ✓ WIRED |
| `flow.js` bot fallback | `doPass` | `g.doPass(p)` at `:2163` | ✓ WIRED |
| `engine` takeTurn fallback | `doPass` | `this.doPass(p)` at `:2742` | ✓ WIRED |
| `doPass` | `p.coins += cfg.passCoin` → `this.ev(...)` | Arrow order is the predicate; proven by snapshot read | ✓ WIRED |
| `EVENT_NARRATION.pass` | `panel()`'s emojify chokepoint | Raw `🌕` in the builder body at `util.js:528`, no hand-rolled markup | ✓ WIRED |
| Pass button label | `cfg.passCoin` | `flow.js:1825` reads the same field the engine pays from | ✓ WIRED |
| `planTurn(p)` | `planTurnV3` | Unconditional dispatch at `engine/index.js:2081-2083` | ✓ WIRED |
| `scripts/bot_ladder4.js` | `4/src/engine/index.js` | `import { Game, roundCfg }` — the only script in the repo that loads `4/` | ✓ WIRED |
| `01-BALANCE-BASELINE.md` | `01-BALANCE-DELTA.md` | Before numbers parsed out of the baseline's own JSON block, never re-keyed | ✓ WIRED |

---

## Data-Flow Trace (Level 4)

| Artifact | Data | Source | Produces real data | Status |
|---|---|---|---|---|
| Pass narration (`util.js:528`) | `appState.game.cfg.passCoin` | Live round config, the same field `doPass` pays from | Yes — rendered `(+1🌕)` on all 100 | ✓ FLOWING |
| Pass button (`flow.js:1825`) | `appState.game.cfg.passCoin` | Same field | Yes — label derives, no literal | ✓ FLOWING |
| `doPass` payment | `this.cfg.passCoin` | Same field | Yes — purse 3→4 measured | ✓ FLOWING |
| Ladder JSON record | `g.events` | Engine's existing event stream — no new instrumentation | Yes — real per-seat counts from 20 games | ✓ FLOWING |
| Delta report before-column | `01-BALANCE-BASELINE.md` fenced JSON | Parsed, not re-typed | Yes | ✓ FLOWING |

**The one field that matters most:** payment, Pass button and narration all read the *same* `cfg.passCoin`. The interface cannot drift from what the player was actually paid.

---

## Behavioural Spot-Checks

| Behaviour | Command | Result | Status |
|---|---|---|---|
| stage.js imports under Node | `node 4/scripts/stage_import_check.js` | `PASS TEST-01`, exit 0 | ✓ PASS |
| `4/` no-undef scan | `node 4/scripts/no_undef_check.js` | 25 files, PASS, exit 0 | ✓ PASS |
| Root no-undef scan | `node scripts/no_undef_check.js` | 21 files, PASS, exit 0 | ✓ PASS |
| Checkers identical | `diff scripts/no_undef_check.js 4/scripts/no_undef_check.js` | no output, exit 0 | ✓ PASS |
| FIX-01 gate | `node 4/scripts/pp4_timeroff_check.js` | `PASSED — 0 failing check(s)`, exit 0 | ✓ PASS |
| RULE-01 gate | `node 4/scripts/pass_coin_test.js` | `5 source anchor(s) located, 0 failure(s)`, exit 0 | ✓ PASS |
| RULE-02 gate | `node 4/scripts/pass_narration_test.js` | `100 renderings checked, 0 failure(s)`, exit 0 | ✓ PASS |
| FIX-06 gate | `node 4/scripts/planner_singleton_check.js` | `131 prototype member(s) inspected, 0 failure(s)`, exit 0 | ✓ PASS |
| Ladder still runs | `node scripts/bot_ladder4.js 20 7919 --json` | exit 0, full parseable record | ✓ PASS |
| **Independent:** 100 pass narrations | verifier's own probe, does not use the phase's gate | `SEA_CREATURES length = 50`, `checked = 100  failures = 0` | ✓ PASS |
| **Independent:** ordering invariant | verifier's own probe reading the event snapshot | purse 3→4; snapshot seat 0 = 4, seats 1-3 = 3 | ✓ PASS |
| **Independent:** D-02 one-time cleanup | verifier's own probe against a fake store | 13/13 checks pass, including "no removal was even attempted" on the second load | ✓ PASS |
| Root workspace suite (regression) | `npm test` — run **once** | exit 0, `PASSED — 0 failing check(s)` across all 21 scripts | ✓ PASS |
| Planning health | `gsd-tools validate health` | 0 errors, 8 warnings — **all W019**, matching the known-noise list in `docs/PLANNING-HEALTH.md` item for item. Nothing new appeared | ✓ PASS |

---

## Requirements Coverage

Every ID declared in the six plans' frontmatter, cross-referenced against `.planning/REQUIREMENTS.md`.

| Requirement | Source plans | Description | Status | Evidence |
|---|---|---|---|---|
| **TEST-01** | 01-01 | `4/src/ui/stage.js` imports under Node without throwing | ✓ SATISFIED | Truth 2; `stage_import_check.js` exit 0 |
| **TEST-02** | 01-01 | `4/scripts/no_undef_check.js` exits 0 (failed today, exit 1) | ✓ SATISFIED | Truths 2, 6, 7; red-proofed |
| **FIX-01** | 01-02 | Turn-clock preference stored under its own key; default must not change | ✓ SATISFIED | Truths 1, 8–12 |
| **RULE-01** | 01-04, 01-06 | A captain who passes receives 1 dubloon; all three sites pay | ✓ SATISFIED | Truths 3, 13–15; red-proofed twice |
| **RULE-02** | 01-04 | Pass narration says so, both renderings, all 50 entries, `(+1🌕)` in a `nobrk` span | ✓ SATISFIED | Truths 4, 16; 100/100 by independent probe |
| **FIX-06** | 01-03, 01-05, 01-06 | The dead bot brain is resolved | ✓ SATISFIED | Truths 5, 17–20 |

**Orphaned requirements: none.** `REQUIREMENTS.md`'s traceability table maps exactly six IDs to Phase 1 — FIX-01, TEST-01, TEST-02, RULE-01, RULE-02, FIX-06 — and all six are claimed by a plan and verified above. No ID appears in a plan without appearing in REQUIREMENTS.md, and none appears in REQUIREMENTS.md's Phase 1 mapping without a plan.

---

## Interleaved Work Accounted For

| Change | Sanctioned? | Verified effect |
|---|---|---|
| Quick task `260818-vot` (`2eb7b80`…`2de0a63`) — moved the pass payout into `roundCfg().passCoin`, added the amount to the Pass button | Yes — Wyatt's call, 2026-08-18, with its own SUMMARY and a READERS enumeration written **before** the change | Plan 01-04's required **behaviour** still holds in full: one dubloon per pass at all three sites (truth 3), increment still ordered before the event is recorded (truth 14), narration still rendering D-06's exact wording `Recipe idea! (+1🌕)` at the shipped default (truth 4). The gates did **not** go vacuous — red-proof #3 |
| `.claude/CLAUDE.md` rule 4 added (plain-English rule) | Yes — Wyatt's own words, written into the rulebook by the same quick task | Present in the phase diff, correctly named rather than filtered away in 01-06's scope proof |
| `docs/` untouched | Yes — deliberate, deferred to Phase 9 | `docs/` is absent from the entire phase diff. The published bot numbers were neither deleted nor quietly corrected (01-05 prohibition) |

**One observation, not a gap.** The tombstone comment at `engine/index.js:2070-2080` still uses the phrases "byte-identical", "control arm" and "head-to-head". Plan 01-05's truth said those comments should be *gone*. They were instead **rewritten in the past tense** — *"was kept here byte-identical as the control arm of a head-to-head that has since been decided… All five are gone."* That satisfies the truth's stated purpose (a comment describing a function that no longer exists is a lie the next reader has to disprove) better than deletion would have, because it explains the absence rather than leaving a silent hole. Marked verified.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|---|---|---|---|---|
| — | — | — | — | **None found** |

Every file modified by this phase — five under `4/src/`, six under `4/scripts/`, two under `scripts/` — was scanned for `TBD` / `FIXME` / `XXX` (blocker tier) and `TODO` / `HACK` / `PLACEHOLDER` (warning tier). **Zero hits at either tier.** No stub returns, no empty handlers, no hardcoded-empty data reaching a render path.

---

## Deferred Items

Not a gap — explicitly out of this phase's scope and covered later.

| # | Item | Addressed in | Evidence |
|---|---|---|---|
| 1 | The six new `4/scripts/*` gates are hand-run only — no npm script, no CI, nothing re-runs them | Phase 3 | Phase 3 "The Safety Net": *"The game being promoted gets the mechanical guarantees v1 had."* `01-CONTEXT.md` states directly: *"Not in this phase: … any gate or corpus work (Phase 3)."* |
| 2 | `docs/BOT-V3-RACE-PLANNER.md`'s published bot numbers are now unreproducible against this tree and carry no note saying so | Phase 9 | `01-CONTEXT.md` Deferred Ideas → Phase 9; 01-05's own backstop truth records the deliberate non-edit |
| 3 | `3/src/engine/index.js` and `scripts/bot_ladder3.js` still contain `planTurnClassic` | Phase 6 | `01-CONTEXT.md`: *"`scripts/bot_ladder3.js` points at `3/`, which Phase 6 deletes. Out of scope here."* Confirmed: those are the only remaining `planTurnClassic` hits outside the gate's own name string |

---

## Human Verification Required

Four items. The first is the one that matters most.

### 1. Confirm the D-07 call was yours

**Test:** The record says that on 2026-08-19, at a blocking checkpoint, you were shown the before/after ladder numbers and given three options — ship at one coin, lower the payout before the freeze, or spend one more ~90-second run on the held-out seed family — and you said **"ship it"**.

**Expected:** You remember making that call, and one dubloon is what you meant.

**Why human:** No file can prove a person said something. Everything I *can* check is consistent with a genuine ruling — the payout is still 1, the held-out family was not run, the ladder was not re-run, and the decision was recorded as a dated event in its own section rather than folded into the measurements. But the decision itself is only yours to confirm, and it matters because Phase 3 freezes the engine on this payout; changing it afterwards costs a gated re-record.

### 2. See the dubloon on your phone

**Test:** Open `playpastrypirates.com/4` (build stamp **2026-08-18e**), start a solo game, and pass a turn. Watch the Pass button and the narration line.

**Expected:** The Pass button reads `Pass (+1🌕)` with the coin as a real coin image, and its text never splits across a line. Your purse goes up by exactly one. The narration ends `… Recipe idea! (+1🌕)`, again with a real coin image, the whole tag staying on one line.

**Why human:** I proved the text is correct as a string in all 100 renderings, and that the purse rises before the event is recorded. What I cannot see is the browser — whether the coin image actually resolves through `panel()`'s emojify step, and whether the no-break wrapping holds at your phone's width.

### 3. Confirm the two games leave each other alone

**Test:** On the same phone, after visiting `/4` at least once: go to `playpastrypirates.com` (the live game) and check the turn clock is set the way you left it. Then reload `/4` and check again.

**Expected:** From the second visit onward, the live game's clock setting is untouched. `/4`'s clock stays off. Neither game changes the other.

**Why human:** The one-time cleanup is proven against a fake store, thirteen ways. But the thing FIX-01 exists to protect is two real games sharing one real browser's storage — and that only happens on a real device.

### 4. Read back the balance summary

**Test:** Read the plain-English opening of `01-BALANCE-DELTA.md` ("The short version, in plain words").

**Expected:** Bots pass a little more (55.6 per 100 turns, up from 55.0). Voyages did not drag — they got slightly shorter (14.84 rounds, down from 15.16). The trader captain won noticeably less (86 of 400, down from 101). Every game finished, both runs.

**Why human:** This is the summary the decision rested on. Worth one read-back before Phase 3 freezes the engine on it.

---

## Gaps Summary

**No gaps.** All 22 must-haves are verified in the codebase, all six requirement IDs are satisfied, no requirement is orphaned, and no anti-pattern was found in any file this phase touched.

The status is `human_needed` rather than `passed` for one structural reason and three practical ones. Structurally: D-07's verdict is a human decision, and no amount of code reading can attest to it — the phase deliberately placed that call with Wyatt, so the phase cannot certify itself closed without him. Practically: three of this phase's outcomes are things only a real browser on a real phone can show — the coin image resolving, the tag not splitting across a line, and two games genuinely leaving each other's stored settings alone.

**Verifier hygiene.** Three faults were planted and reverted during this verification. After each revert, `git status --porcelain` printed nothing and the affected file was confirmed byte-identical to a pre-sabotage backup. Final state re-checked after `git fetch origin`: **0 commits ahead, 0 behind**, working tree clean, no headless browsers or local servers started, no stray processes left running. Nothing was committed or pushed.

---

_Verified: 2026-08-19T11:21:51Z_
_Verifier: Claude (gsd-verifier)_
