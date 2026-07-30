---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Playtest Fixes & Polish
current_phase: 15
current_phase_name: narration-audit-fixes
status: verifying
stopped_at: Quick task 20260730-playtest-notes-fixes — all 9 tasks (G1-G9) committed; T8 fade at 180ms awaits Wyatt's eye in the recorded playthrough
last_updated: "2026-07-30T00:00:00.000Z"
last_activity: 2026-07-30
last_activity_desc: Quick task 20260730-playtest-notes-fixes — 9/9 tasks, G1-G9 from Wyatt's morning playtest notes
progress:
  total_phases: 12
  completed_phases: 3
  total_plans: 15
  completed_plans: 15
  percent: 25
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-26)

**Core value:** The game must stay playable and fair end-to-end in both Safari and multiplayer — a storm must not crash the game, and pausing the multiplayer timer must never destroy game state.
**Current focus:** Phase 15 — narration-audit-fixes

## Current Position

Phase: 15 (narration-audit-fixes) — EXECUTING
Plan: 6 of 6
Status: Phase complete — ready for verification
Last activity: 2026-07-27 — Phase 15 execution started

Progress: [██████████] 100% (v1.2)

## Performance Metrics

**Velocity (v1.2):**

- Total plans completed: 9
- Average duration: — min
- Total execution time: 0 hours

*(Prior milestones: v1.0 shipped 2026-07-24; v1.1 shipped 2026-07-25 — 32 plans across Phases 7–12. Per-plan history retained in git and prior SUMMARY files.)*

**By Phase (v1.2):**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 13. Multiplayer Turn Clock | TBD | — | — |
| 14. Storm Movement & Determinism | TBD | — | — |
| 15. Narration Audit & Fixes | TBD | — | — |
| 16. UI/UX Polish, Social Preview & Support | TBD | — | — |
| 17. Final Multiplayer Verification | TBD | — | — |
| 13 | 3 | - | - |
| 14 | 6 | - | - |

*Updated after each plan completion*
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 14 P01 | 30min | 2 tasks | 3 files |
| Phase 14 P02 | 25min | 3 tasks | 3 files |
| Phase 14 P03 | 30min | 2 tasks | 3 files |
| Phase 14 P04 | 25min | 3 tasks | 34 files |
| Phase 14 P05 | 45min | 3 tasks | 4 files |
| Phase 14 P06 | 119min | 3 tasks | 7 files |
| Phase 15 P01 | 12min | 2 tasks | 5 files |
| Phase 15 P02 | 8min | 2 tasks | 3 files |
| Phase 15 P03 | 25min | 3 tasks | 3 files |
| Phase 15 P04 | 15min | 3 tasks | 3 files |
| Phase 15 P06 | large-session | 2 tasks | 9 files |

## Quick Tasks Completed

| Date | Task | Tasks | Commits | Outcome |
|------|------|-------|---------|---------|
| 2026-07-29 | `20260729-phase15-verification-gaps` — close the 5 gaps in `15-VERIFICATION.md` | 8 of 9 | 8 (`0cc674d`..`8b18467`) | **Awaiting Task 9 checkpoint (Wyatt).** All 5 gaps closed; `npm test` 14 -> 15 gates; `src/engine/index.js` diff empty, 31/31 determinism seeds verify. Four copy rulings open for him. |
| 2026-07-30 | `20260729-narration-audit-tool-hardening` — resurrect `narration-audit.html` and make it re-enterable | 7 of 10 | 7 (`04c41ad`..`0c91966`) | **PARTIAL — Tasks 5, 6, 7 NOT DONE; Task 11 checkpoint open (Wyatt).** The tool was DEAD at HEAD (0 cards, first lookup threw, whole render aborted); it now renders 210 cards from live source with zero placeholders, and `npm run audit:check` proves it browser-free. Line-number keying 91 distinct/147 occurrences -> 0/0. All 209 reviewed dispositions carried across (`209 == 203 aliased + 6 retired`, every retirement merge-tagged by Wyatt himself), seed of record moved from his browser into the repo. F11 (greyed Trade reason suppressed) and F7 (spectator line never reached any client) both fixed with gates red-proofed against the real `ab98e04` code. `npm test` 15 -> 16 gates, `ui_contract_check` 5 -> 7 assertions. **STILL MISSING: the 155 approval fields have never been compared to shipped text (Task 5), there is no applier (Task 6), and `src/ui/board.js`'s player-facing copy is still not in the audit at all (Task 7).** Engine diff empty, 31/31 determinism. |
| 2026-07-30 | `20260730-playtest-notes-fixes` — G1-G9 from Wyatt's morning playtest notes | 9 of 9 | 9 (`de29b07`..`3d559df`) | **COMPLETE.** Two urgent correctness fixes (G2 the mis-told Tortuga storm rescue; G6 seven coin-debit paths that could drive a purse negative), three copy corrections (G1, G3, G4), one flow reorder (G5), one narration-timing refinement (G8, 180ms), one requirements reword (G7), and one queued engine-purity spec (G9, `docs/DETERMINISM-RERECORD-NEXT.md`). `npm test` exit 0 at every commit; **`src/engine/index.js` byte-identical to `9dd36c0`**; `package.json` untouched; all determinism seeds pass. Three fixtures re-pinned with reasons in their own provenance (table baseline 50->51 for G2, 3 addressed dock cards for G1, 2 battle cards for G3) — no pattern widened, no equality loosened, no disposition file touched. No player-facing string invented. **Open for Wyatt: the G8 fade duration (180ms) is a taste call no gate can answer.** |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table. Recent decisions affecting v1.2 work:

- v1.2 splits the second punch list — fixes/polish now (CLOCK, STORM, NARR, UI, META, KOFI); the tutorial, sound effects, and island redesign are deferred (island redesign touches deterministic board generation).
- CLOCK-01 (multiplayer clock stall) is the critical headline fix and is front-loaded as Phase 13 so multiplayer is playable as early as possible.
- STORM-01 is the one engine-adjacent change; it is grouped with VERIFY-02 in Phase 14 so determinism re-verification is deliberate, not incidental. **Settled at Phase 14 close: the corpus is now 31 seeds, not 30** (a 31st was added to preserve `shipwrecked` coverage), and the gate is 31/31 green.
- NARR-01 is an approval-gate deliverable — the narration audit goes to Wyatt for review before the NARR-02…06 pruning/fixes are applied.
- Ko-Fi "Buy me a cookie" button (KOFI-01) approved for v1.2 despite the third-party ko-fi.com script embed.
- [Phase ?]: D-18: leeward() now tests the upwind square against isHome() as well as isIsland() — Tortuga casts a wind shadow like every other island (fixture-perturbing, deliberate)
- [Phase ?]: Determinism gate is deliberately RED (19/30 seeds diverge) after D-18 — re-record deferred to 14-04 per D-16; docs/DETERMINISM-RERECORD.md seeded with real per-seed measurements
- [Phase ?]: D-06 rule 2's 'hurts least' proxy uses humanTrade's essential idiom (recipe.includes+cnt<=1), not RESEARCH's broken needs(q) proxy, per <planner_corrections>
- [Phase ?]: Hail action-cost commits (p.lastOffer + hailed flag) the instant an offer reaches the table, before the await, so a shot-clock expiry mid-hail still counts as a spent action with no partial trade
- [Phase ?]: D-15: the all-bot simulator's takeTurn now applies both storm gusts (up to 4 squares) sharing one dodgedOnce, matching the live game; play() rolls windNow2 from PERP at the exact orchestrator RNG draw point
- [Phase ?]: D-19/D-21: Game.mooredReason(p) tags every moored event with its actual cause (justDocked/dock/home); moored(p) is unchanged behaviorally; the D-19 berth-protection invariant is now proven by scripts/storm_moored_reason_test.js, not assumed
- [Phase ?]: All three fixture-perturbing decisions for Phase 14 (D-15, D-18, D-21) are now landed; determinism gate deliberately RED (30/30 seeds diverge) until 14-04's single, gated --capture re-record
- [Phase ?]: Wyatt: capture-now for the 14-04 determinism re-record, explicitly confirming D-26's pre-storm assertion is superseded by per-key attribution evidence (Tortuga wind-shadow is wind-driven, not storm-gated)
- [Phase ?]: Wyatt: add-a-seed to resolve the shipwrecked coverage gap that --capture surfaced — corpus grows from 30 to 31 seeds (seed 12379 appended, first-match), REQUIRED_EVENT_TYPES left unweakened
- [Phase ?]: STORM-01: windLeg/botWindLeg both render every ordinary-water square before the next outcome narrates (D-22 fix); botWindLeg delegates per-square to windPush rather than re-deriving the ladder, narrating every event a square records (D-11); EVENT_NARRATION.moored now branches on reason into three DRAFT lines (D-21) pending 14-06 approval alongside the pacing constants and 14-02's refused-hail clause
- [Phase ?]: D-14/D-27: Wyatt authored/approved final storm+hail copy (rewrote moored/justDocked and the refused-hail parley clause, approved moored/dock as drafted, collapsed moored/home onto justDocked at the narration layer only)
- [Phase ?]: The three new Phase 14 test scripts (hail_ranking_test.js, storm_moored_reason_test.js, bot_storm_narration_test.js) are now permanent npm test gates, 9 -> 12
- [Phase ?]: First live Safari playtest of 14-05's per-square storm rendering FAILED (board painted from a stale event snapshot, not live positions); root-caused and fixed same-day at the UI tier only (commit 14d8258), re-confirmed by Wyatt; multiplayer guests keep the non-animated behavior by design since the determinism corpus forbids adding events
- [Phase ?]: 15-01: NEUTRAL_VIEWER is a numeric sentinel (-1), not a Symbol, so it stays type-number per the plan's export-type check and can never collide with a real 0-3 seat index.
- [Phase ?]: 15-01: dodge's addressed second-person copy is DRAFT pending Wyatt's D-04 review, same convention as Phase 14's moored/D-21 draft lines.
- [Phase ?]: 15-02: CHAT_BUBBLE_HOLD_MULTIPLIER set to 0.8 (msgHoldMs's pre-Phase-15 value, not 1.0) per plan's planner_correction, so bubbles reproduce exactly today's timing rather than holding 25% longer
- [Phase ?]: 15-02: MSG_HOLD_MULTIPLIER 0.8->0.72 and BOT_MSG_HOLD_MULTIPLIER 0.5->0.45 — identical 0.9 ratio on both curves so human and bot narration stay in proportion
- [Phase ?]: 15-03: The plan's own listed awk verify commands for humanTurn/botTurn ranges are self-defeating (start pattern also matches the generic end pattern on the same line) — narration_flow_test.js uses string-index slicing instead, which is immune to the trap
- [Phase ?]: 15-03: humanWind's second-leg flash always renders "you" unconditionally with no viewer selection (doesn't call pn()/poss(), so it's outside this plan's literal scope) — left as a discovered gap for a future narration pass
- [Phase ?]: 15-04: bribe/cleaned-out battle spoil boundary is spoilN>=5 exactly (both real spoil paths clamp coin take to 5); cleaned-out wording is the real-prose form of the simulator-only '(all they had)' parenthetical, never a literal carried suffix
- [Phase ?]: 15-04: moored's addressed branch is a full sibling object (LA) beside the untouched L object, not an isLocalTo() conditional threaded into L's own values — keeps byte-identical third-person text a structural guarantee
- [Phase ?]: 15-04: bakeoff's loser gets its own commiseration line rather than reusing the neutral text verbatim, since narrationVariants() filters out any addressed rendering equal to the neutral one — a byte-identical loser line would have silently produced zero variant entries for that seat
- [Phase ?]: D-19 SIMPLIFIED: accepted bot hails emit only a trade event (no more duplicate parley+trade double-narration); Parley renamed Trade everywhere a player reads it
- [Phase ?]: D-57/D-58: guest narration (showNarration) now holds and fades non-blockingly on the same curve as host flash() narration
- [Quick 2026-07-29]: D-25 reinterpreted for the audit page: because `pirateVoice()` ran LIVE at the msgBox chokepoint, a card tagged `keep` with empty notes DISPLAYED converted text — so that converted text is what Wyatt approved. 15-06's reading of `keep` + empty notes as "no source change" is what produced Gap 2.
- [Quick 2026-07-29]: D-29's conversion ships as plain literals, NOT as a runtime `pirateVoice()` helper — a helper nothing calls at runtime would be dead code (the thing D-33/D-34/D-40 exist to prevent). The audit page's regex is used as the spec and as the verifier instead: each shipped literal is proven byte-equal to `pirateVoice(its own baseline text)`.
- [Quick 2026-07-29]: D-54's three approved loser-view battle lines restructure the sentence (winner named, one sentence not two), so the loser gets a composite branch of its own; the winner-addressed and neutral renderings stay byte-unchanged. The score slot remains attacker–defender order — that is pre-existing and deliberately not "fixed".
- [Quick 2026-07-29]: D-17's `fmtItem()` fix requires the `ING_IMG[x] ?` guard — the else-branch input is not always an ingredient key (`offerLabel` display strings, `"nothing"`), so an unguarded lookup would emit `<img src="undefined">`.
- [Quick 2026-07-29]: `npm test` is now 15 gates — `scripts/extract_narration_lines.js` joined the chain, so the D-21/D-31/D-32/D-33 narration coverage guard is CI-enforced. `ui_contract_check.js` gained assertion 5 (the standing D-29 register + the `layout` intactness probe), red-proof drilled with 5 fixtures including a negative control.
- [Quick 2026-07-29 playtest-bug-fixes]: **F12 was not an arithmetic slip, it was the first VISIBLE instance of a structural pattern.** `humanTrade` capped a bot's counter-demand against the full purse while debiting `give.coins+askFor`, double-counting pledged coins. Fixed by a pure exported `counterHeadroom()` (405-point invariant grid). But COIN-AUDIT.md found **8 more live paths** that can still go negative, all for ONE shared reason: affordability is checked when an option list is BUILT, the purse is debited AFTER the click, and `applyShotClockPenalty()` fires at 20s inside that window. `appState.turnExpired` does not protect against it — that flag is set at 30s. Awaiting Wyatt's ruling; recommendation is one shared re-validation helper.
- [Quick 2026-07-29 playtest-bug-fixes]: **the engine has zero negative-coin risk for a STRUCTURAL reason, not a careful one** — `Game.play()` is fully synchronous, so no timer can interleave between a gate and its debit. Every UI debit is separated from its check by at least one `await ask(...)`. This is also why a headless fixture invariant would NOT have caught F12: it only exercises the path already proven safe.
- [Quick 2026-07-29 playtest-bug-fixes]: **D-29's register has a LABEL class exception** (F1). The pirate voice applies to text the game SPEAKS; a demonstrative label pointing AT a seat/row/field to say "this one is the reader" is UI chrome and takes plain "you". `name — ye` is a grammar error, not pirate voice. Exactly 3 sites, each named/scoped-per-file/content-anchored in `ui_contract_check.js`, with a staleness check that FAILS on an anchor matching nothing, plus 3 new drill cases (spoken string in the same file still fails; stale anchor fails; per-file scoping proven).
- [Quick 2026-07-29 playtest-bug-fixes]: **an icon insertion point inside an authored phrase CANNOT be derived from the string** (F5). `iname("cocoa")` is "Cacao Pods" while the flavour reads "Luscious Cacao Beans" — no substring match, and a regex would silently produce "a pod of Luscious 🍫 Cacao Beans". `DOCK_FLAVOR` is now 7 `{prefix,name}` pairs and `dockFlavorIcon()` is the ONE place that decides placement. `dockFlavor()` kept byte-identical so Wyatt's 7 reviewed rows never moved.
- [Quick 2026-07-29 playtest-bug-fixes]: **a new symbol used in a shipped copy site must be added to `narration-core.js`'s `CTX_BASE`**, or EVERY snippet in that file fails to render and the file's local-variable resolution is poisoned — unrelated cards look broken. Also: **run `extract_narration_lines.js` BEFORE `narration_audit_check.js`** after any source edit; local resolution is line-based, so a stale inventory produces the same misleading cascade.
- [Quick 2026-07-29 playtest-bug-fixes]: **a sub (helper text) card needs a `SUB_BRANCH_AXES` entry or the copy is invisible to review.** F9's new reason rendered SILENT under the review tool's default 4-coin context — present in source, reachable at runtime, never on the page. A sub reuses its ask's `@copy` id, so no new marker and no page edit were needed; the missing piece was the branch axis. Cards 210 → 212, silent 6 → 7, errors 0.
- [Quick 2026-07-29 playtest-bug-fixes]: **F6 narrowed by Wyatt to a DISPLAY-only change.** "Never fade the last line — only fade when something replaces it… the blue box should never be empty." The HOLD is preserved (`flash()` still awaits `msgHoldMs(text)`, `MSG_HOLD_MULTIPLIER` 0.72 and the chat-bubble curve untouched); only the trailing fade-to-empty and its `sleep(500)` are gone, and `_narrToken` died with them as dead code. NARR-06's "10% less time before it begins fading" is now inapplicable to a trailing line and needs RE-WORDING, not re-verifying — `REQUIREMENTS.md` deliberately untouched.
- [Quick 2026-07-29 playtest-bug-fixes]: **three plan-supplied source assertions were themselves buggy and had to be corrected rather than satisfied.** (1) `indexOf("renderSeatList")` matched the file-header comment, not the function; (2) a flip-prompt check filtered on `"Dock at"`, which never matches `"Docking at"`; (3) an "is the coin test out of the branch condition" check sliced from `if(` to the prompt and so read the NEXT statement's `const canBuy=p.coins>=3` as part of the condition. Each was replaced with a precise locator (balanced-paren extraction for the third). A green assertion that cannot fail is worse than none.

### Pending Todos

None yet.

### Blockers/Concerns

- ~~**Determinism risk (Phase 14)**~~ — **RESOLVED at Phase 14 close (2026-07-26).** The one-time re-record happened exactly once, behind a blocking human decision, after a full per-seed divergence report attributed every change. The corpus grew 30 → 31 seeds (a 31st was added when the coverage guard found no seed produced a `shipwrecked` event any more; `REQUIRED_EVENT_TYPES` was left unweakened). VERIFY-02 is green at **31/31** against the new baseline. Full record: `docs/DETERMINISM-RERECORD.md`.
- **Standing determinism rule (carried forward):** the 31-seed corpus is the multiplayer lockstep oracle and there is no cheap re-record. Any future change to what `src/engine/index.js` emits into the event stream — including adding a field to an existing event — invalidates all 31 fixtures and requires another gated re-record. Prefer UI-tier fixes. This is what forced STORM-02 (guest storm animation) to the backlog rather than into Phase 14.
- **Safari re-verification:** Storm rendering has a prior Safari-specific crash precedent; storm-movement work (Phase 14) and the final playtest (Phase 17) must both re-verify in Safari, not Chrome alone.
- **MP test-harness gotcha:** Same-machine two-tab multiplayer shares localStorage `pp_id`, causing a transient host-reload collision during Phase 12 tests — re-set the host's own `pp_id` before reloading. Use synthetic-prompt injection for deterministic remote-render checks (see MEMORY.md).
- **Backlog UAT findings (from v1.1 Phase 12 Safari playthrough, pre-existing, not regressions):** EOV narration box not cleared (still open, tagged `resolves_phase: 16`; may intersect Phase 15 narration work). ~~Bot hail + action on the same turn~~ — **closed by Phase 14 (AI-01/plan 14-02)**; the todo is filed under `.planning/todos/completed/`.
- 15-06's browser-based human-check steps (Chrome solo, Safari solo, two-tab multiplayer) were not performed — no browser available in the execution environment. Needs a human pass, especially for D-57/D-58 (guest narration fade) and D-35 (sail-prompt merge).
- **OPEN — quick task `20260729-phase15-verification-gaps` Task 9 is a blocking review gate awaiting Wyatt.** Four copy rulings: (1) `src/ui/recipe.js:34,69,146` cookbook prose — recommend LEAVE; (2) `index.html:743` credits paragraph — recommend LEAVE; (3) `index.html:650`/`:761` privacy notice + form placeholder — CONVERTED, confirm he's happy; (4) `misc:battleLine:src/orchestrator.js:482`/`:486` `addressedNotes` — recommend DEFER (battle footer has no per-seat variant mechanism). If he rules "convert" on (1), also remove the `src/ui/recipe.js` exclusion from `ui_contract_check.js` assertion 5.
- The quick task's two `<human-check>` items fold into the already-scheduled two-tab playtest: **P8 flips from expected-FAIL to expected-PASS** (D-17 ingredient art in trade narration), and **P12 is now answerable**. P1–P4 and P5 remain playtest-only.
- **PARTLY ANSWERED 2026-07-30 — 7 items were raised for Wyatt in `.planning/quick/20260729-playtest-bug-fixes/MORNING-PLAYTEST-BRIEF.md`**, section "Tell me yes or no": (1) F6's no-fade-on-swap behaviour is as he pictured; (2) the blank-name fallback now applies everywhere `pname()` is used, not just the lobby; (3) the four dock lines read as copy in their newly person-shifted form; (4) the addressed EMPTY-island line was restored one line WIDER than F10 named (D-46's letter); (5) NARR-06 needs re-wording, not re-verifying; (6) the coin-floor ruling — 3 options weighed in COIN-AUDIT.md, (b) recommended as one shared re-validation helper; (7) two shipped lines (dock button, tails buy prompt) had their icon POSITION changed after he approved them — words unchanged. **His 2026-07-30 playtest notes answered four of the seven:** (3) and (4) -> G1 (he ruled the addressed dock lines drop the place entirely: *"you already know that you docked at the Flour Patch — we don't need to tell you that again"*); (5) -> G7 (NARR-06 reworded to hold length, not fade); (6) -> G6 (he chose option (b), the shared helper). (1) is superseded by G8, which changes the swap behaviour he was being asked about, so it needs re-asking in the new form. (2) and (7) remain open.
- ~~**8 coin-debit paths can still drive a purse below zero**~~ — **CLOSED 2026-07-30 by G6** (`.planning/quick/20260730-playtest-notes-fixes`, commit `3d559df`). Wyatt ruled: *"yes, build this check and apply it to all situations."* One shared `coinShortfall(debit,purse)` helper in `src/ui/flow.js` beside `counterHeadroom`, called at all seven at-risk sites (2,3,5,7,8,11,14), each falling through to a PRE-EXISTING guarded path with existing copy — no player-facing string was invented. Site 4 was already closed by F9's D-40 guard and was deliberately NOT double-guarded. Covered by DOM-free unit tests, a 169-point invariant, and a scripted (build -> 20s penalty -> settle) interleave regression test in `scripts/narration_flow_test.js`.
- ~~**NEEDS A SECOND PAIR OF EYES:** `asyncBattle` powder debit~~ — **CLOSED 2026-07-30 by G6** (commit `3d559df`). The engine's own guard (`if(att.coins<c.powder)return null`, `src/engine/index.js:524`) is now copied into `asyncBattle`, placed at the TOP of the function BEFORE the opening `flash()` — which is the direct answer to the "a battle snapshot may already be in flight" concern: nothing has been announced, no side bets collected and no battle counter incremented when it returns null. Both callers were confirmed to handle a falsy return (neither reads the value).
- **DESIGN DEBT — the engine's event contract carries rendered TEXT in two fields, and everything else is data (G3, 2026-07-30).** Wyatt, on being told the `coins` spoil wording came from the engine: *"why does this need to touch the engine, but all our other narration doesn't? that seems badly designed, or worth rechecking."* He is right. Across all 28 `this.ev({...})` sites, `spoil` (`src/engine/index.js:566-574`) and `gave` (`:455`) are the only two fields carrying display strings — `spoil` even carries literal `<img>` markup via an `ilabelImg` import (`:8`) into a module whose stated contract is DOM-free. **The proper fix is the engine emitting `spoilCoins`/`spoilIng` as DATA with the UI rendering it**, which changes the event stream and therefore invalidates all 31 determinism fixtures and requires a gated re-record. It must ride along the next time a re-record happens anyway rather than being lost. **The full spec is written and committed at `docs/DETERMINISM-RERECORD-NEXT.md`** (G9, 2026-07-30) — it covers `spoil`, `gave`, removing the `ilabelImg` import from the engine tier, deleting the config-dead `asym`/raider branch, the UI-side counterpart, and the batch-together rule; `docs/DETERMINISM-RERECORD.md` now points at it from its title block. G3 shipped an **INTERIM display-layer fix** (`spoilText` in `src/ui/util.js`'s `battle` builder) that leaves `src/engine/index.js` byte-identical; that interim fix becomes redundant at re-record time and must be REMOVED then, not left beside the new path.
- **The shipped-vs-approved copy check was NEVER BUILT, and the gate that DID reach 17 is a different one.** Read both halves of this sentence together, because the count alone is misleading: `npm test` runs **17** gates as of 2026-07-30, and the 17th is `scripts/host_guest_parity_check.js` (G26, below) — **`scripts/narration_copy_check.js` still does not exist.** The upstream `20260729-narration-audit-tool-hardening` plan's Tasks 5-7 never landed, so nothing compares shipped text to Wyatt's stored approvals, and **every post-approval wording change must still be surfaced to him BY HAND.** `narration_audit_check.js` does still pin the table fixture (assertion 7 — 51 cards since G2 added `table:moored~homeMoved` on 2026-07-30) and the 104 drift rows (assertion 8), so deliberate wording changes get caught there; that is a drift pin, not an approval check.
- **NEW STANDING PROTECTION — `scripts/host_guest_parity_check.js` (G26, 2026-07-30), gate 17.** The host/guest parity gate D-56 recommended and nobody wrote: *"they match by discipline, not by structure — nothing enforces it, and nothing would notice if they diverged tomorrow."* Four drifts proved that right. Where the four now stand: **F7** (prompt delivery leak) gated by `ui_contract_check.js` assertion 7; **D-35** (sail-prompt wording) structurally safe — the guest renders the host's `msg` — and the class vocabulary it travels in is now gated by this file's assertion 1; **D-55** (sail-highlight rect) FIXED by G25 (one shared `sailHighlightRect()`) and gated by assertion 2; **D-57** (two narration schedulers on one `.apMsg`) still UNENFORCED — recorded at `.planning/todos/pending/narration-two-schedulers-unenforced.md`, deliberately not fixed in this pass because G17 was already changing that code. Assertion 2 was red-proofed against the pre-G25 tree via `git show`, and `--drill` proves every assertion can fail against synthetic fixtures. A third assertion (added 2026-07-30 with G14) pins the ONE rim-sweep stepper: `src/orchestrator.js` must call the shared `animateRimSweepIfAny()` and must contain neither `rimCellInfo` nor `rimHead`.
- **`.planning/quick/20260730-bot-intelligence/PLAN.md` has one task that is now already done.** It planned to FLAG the `botTurn`/`takeTurn` rim-escape parity gap as a todo (`.planning/todos/pending/bot-rim-escape-live-parity.md`, never written). Wyatt ruled on 2026-07-30 that it should be FIXED — *"A boxed-in bot SHOULD escape via the rim"* — and G18 fixed it UI-tier, by having `botTurn` call the engine's existing `boxedIn()`/`rimEscape()` methods. The engine was not touched and the fixtures did not move. **That task becomes "verify already fixed", not work.** The rest of that plan still rides the single gated re-record described in `docs/DETERMINISM-RERECORD-NEXT.md` §8.
- **Storm rain no longer diverges per client (G19, 2026-07-30).** It was drawn from unseeded `Math.random()` and cached per browser, so two players in one room saw permanently different weather (measured 0.818s/200.5px vs 0.534s/264.7px). It now derives from `mulberry32(game.seed)` — a PRIVATE stream, never `game.r()`, which would have desynced every client and all 31 fixtures. `ui_contract_check.js` assertion 8 gates both failure modes, scoped by content anchor to the two rain functions.
- **The D-57 residue is the ONE host/guest item still unenforced.** `flash()` and `showNarration()` remain two independent hold/fade schedulers on the same `.apMsg`. Deliberately NOT fixed on 2026-07-30 because G17 was already changing that code in the same pass. Recorded at `.planning/todos/pending/narration-two-schedulers-unenforced.md`.

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Features | Interactive tutorial (TUT-01…03) | Deferred to a later milestone | v1.2 requirements |
| Features | Sound effects (AUDIO-01…03) | Deferred to a later milestone | v1.2 requirements |
| Features | Island redesign (ISLAND-01…04) — touches deterministic board gen | Deferred to a later milestone | v1.2 requirements |
| Networking | NETMOD-01 — modular Firebase v9+ SDK migration | Deferred to v2 | v1.1 requirements |
| DX | DX-01 — JSDoc typedefs for event objects | Deferred to v2 | v1.1 requirements |
| DX | DX-02 — isolated pure replay-runner extraction | Deferred to v2 (only if seam surfaces bugs) | v1.1 requirements |
| Networking | **STORM-02 — multiplayer guest storm-push parity.** Guests see a storm-pushed boat jump to its final square; solo play and the host see it step square by square. A guest renders only from the broadcast event feed, and the intermediate squares emit no event by design. Delivering parity means adding to the event stream, which forces another full re-record of the determinism corpus — so it is deliberately not a Phase 14 gap. Narration is already correct for guests. **NOT SOLVED BY G14 (2026-07-30), and do not conflate the two:** G14 shipped guest-parity for the TRADE-WIND RIM SWEEP with no engine change, because a rim sweep is pure GEOMETRY between two known points on a static ring every client already holds (`rimCellInfo`). A storm push is SIMULATION — its intermediate squares depend on collisions, docks, other ships and the aground ladder, which a guest cannot replay from one event. STORM-02 stays parked on its own merits. | Backlog — accepted as-is at Phase 14 close by Wyatt | Phase 14 close (2026-07-26) |

## Session Continuity

Last session: 2026-07-30T00:00:00.000Z
Stopped at: Quick task 20260730-playtest-session2-fixes COMPLETE — all 13 tasks, 13 commits. Seventeen items (G10–G26) from the recorded two-tab playtest of room NAMF. `npm test` 17 gates, exit 0; `src/engine/index.js` byte-identical throughout; 31/31 determinism. THREE BROWSER CHECKS ARE OUTSTANDING and are Wyatt's: the G17 strict fade, the G19 storm rain (incl. a Safari pass), and a G25+G14 guest-seat parity pass.
Resume file: .planning/quick/20260730-playtest-session2-fixes/SUMMARY.md

## Operator Next Steps

- Phase 13 complete (CLOCK-01/02/03 human-verified). Phase 14 context gathered — plan it with `/gsd-plan-phase 14`
