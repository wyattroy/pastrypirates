# Phase 1: Before the Engine Freezes - Research

**Researched:** 2026-08-18
**Domain:** Internal codebase archaeology (vanilla JS, no build step, no external packages) — a
localStorage namespace fix, a Node-importability fix to a UI module, a heuristic fix to a
source-text checker, a new gameplay rule threaded through three call sites, and a dead-code removal
whose only non-obvious caller is a bot-tuning script.
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**FIX-01 — the clock preference**
- **D-01: Namespace to `pp4_timerOff`, and DELETE the old `pp_timerOff` outright.** Not migrate, not
  leave. Wyatt, 2026-08-18. Blast radius is small and known (`/4` is `noindex, nofollow`/`Disallow`ed,
  so only browsers Wyatt personally sent the link to carry the old key). Reversible: any player who
  had deliberately changed either game's clock preference re-taps the toggle once.
- **D-02: The deletion is a ONE-TIME cleanup guarded by a marker, not delete-on-every-load.**
  Claude's call, stated to Wyatt and not contested. Delete-on-every-load would mean `/4` permanently
  vandalises the live game's preference — the exact bug FIX-01 exists to fix, from the other direction.
- **D-03: The clock default stays OFF everywhere, including once multiplayer returns — ONE key, no
  solo/multiplayer split.** Wyatt, 2026-08-18: *"multiplayer is played between friends, who can
  communicate through the chat. the host's game would be 'hung'... even if the timer was on."* The
  shot clock is not the mechanism that handles a dropped player — MP-13's presence-loss fallback is.
- **D-04: The standing storage rule is "share who you are, split how you play."** Identity (`pp_id`,
  `pp_lastName`, `pp_muted`) stays shared across both games; anything that changes how a game behaves
  gets its own per-game key. `pp_rematch`/`pp_seaIdx` are `4/`-only and cannot leak. An earlier framing
  claiming "five more keys leak" was wrong and is corrected — do not re-derive it.

**FIX-06 — the dead bot brain**
- **D-05: Delete `planTurnClassic` and its dead subtree, and rewrite the ladder to run one brain.**
  Wyatt, 2026-08-18: *"we should never use the old bot brain, it's done... this follows one of my
  design principles — elegance."* `REQUIREMENTS.md:130` and `CODE-QUALITY.md:59`'s "zero callers"
  claim is WRONG — `scripts/bot_ladder4.js` is the one external caller (re-confirmed in this research
  pass). The rewrite: seat all bots with `planTurnV3`, compare before vs after the pass dubloon on
  fixed seeds. Reversibility: costly — code is recoverable from git history, but
  `docs/BOT-V3-RACE-PLANNER.md`'s numbers become permanently unreproducible (accepted by Wyatt).
  Dead subtree (re-verified in this research pass, callers confirmed internal-only):
  `planTurnClassic:2739-2875`, `turnsToWin:2085-2127`, `turnsToWinIf:2128-2142`,
  `denialValue:2143-2157`, `legTurns:2048-2059`. Do not confuse with the live v3-suffixed versions
  (`legTurns3`, `turnsToWin3`, `turnsToWin3If`, `tour3`). `scripts/bot_ladder3.js` (targets `3/`) is
  out of scope — Phase 6 deletes `3/`.

**RULE-01/RULE-02 — passing pays, and says so**
- **D-06: The pass narration tag is `Recipe idea! (+1🌕)`.** Wyatt's pick, after rejecting two longer
  drafts: *"core idea: you're getting recipe inspo from the sea creatures. core constraint: must be
  short and easy to read."* A subjectless fragment, appended by the renderer in ONE place; all 100
  hand-written `SEA_CREATURES` strings stay untouched. Treatment: wrap the whole tag in
  `<span class="nobrk">`, same reasoning as G27/P7 (`4/src/ui/flow.js:2231`). The 🌕 is emoji
  shorthand; `emojify()` swaps it for `COIN_IMG` at `panel()`'s chokepoint (D-50) — do not hand-roll
  markup for the coin.
- **D-07: The balance check is a GATE on this phase, not a note.** Wyatt, 2026-08-18: if the ladder
  shows bots passing materially more and voyages dragging, that is a bug to fix before the engine
  freezes (most likely by lowering the payout), and the planner reports exactly what moved and why.
  Signal: pass rate and voyage length, measured before and after on fixed seeds — same piece of work
  as D-05's ladder rewrite.

### Claude's Discretion
- **Where the dubloon is applied.** `Game.ev()` is a recorder, not a reducer (`if(!this.record)return;`
  at `4/src/engine/index.js:320`) — the coin cannot be paid "inside" the pass event. Prefer a single
  shared `doPass(p)`-style method over three inline `+1`s, per CLAUDE.md §2 (the elegant version
  deletes code). Sites: `4/src/ui/flow.js:1861` (human menu), `4/src/ui/flow.js:2140` (bot fallback,
  animated), `4/src/engine/index.js:2993` (engine fallback). Both bot paths must pay — the fallback is
  deliberately duplicated (`4/src/ui/flow.js:2130-2137` explains why), and fixing only the engine
  "would fix the simulator and leave every real browser game exactly as broken."
- **TEST-02 is two problems, not one.** One real bug (`4/src/ui/stage.js:190`, bare
  `addEventListener` — fix with `window.` behind a `typeof` guard, matching `4/src/main.js:157`'s own
  pattern). The other two are checker false-positives on `set subject(v){…}`/`get subject(){…}` at
  `4/src/ui/stage.js:1483`. Fix the heuristic, not the working code.
- **Keep the two checkers identical.** `scripts/no_undef_check.js` and `4/scripts/no_undef_check.js`
  are currently byte-identical; apply the heuristic fix to both in the same commit.
- **Sweep all five `pp_timerOff` sites in `4/`**, not just the one FIX-01 names:
  `4/src/ui/stage.js:1478` (force-write), `:909` (menu toggle), `4/src/orchestrator.js:184` (sheet
  toggle), `:1570` (read), `:1575-1576` (read that pushes to the room). State in the reply which
  sites were checked, per CLAUDE.md §2 consistency.
- **Which reads of the removed classic-planner helpers are safe to delete** — re-verify callers before
  deleting, per CLAUDE.md §2: *"List what reads a quantity, gates included, before you change how it
  is produced."*

### Deferred Ideas (OUT OF SCOPE)

**To Phase 2 — Multiplayer Revival**
- Guest reconnect criterion — `pp4_sess` is read synchronously before a pixel is drawn, but that path
  has never executed in `4/`; Phase 2's criterion 4 names only the host reloading. Add a guest
  criterion there, not here.
- Multiplayer chat has nowhere to appear in the new game — `body.pp4Stage #chatBubbles { display:none; }`
  switches the on-board speech bubbles off entirely in the new stage layout. Design job, not a
  one-liner. Not this phase.

**To Phase 9 — The Written Record**
- `docs/BOT-V3-RACE-PLANNER.md`/`docs/FABLE-BOT-BRIEF.md` citing `planTurnClassic` as the control arm
  become historical once D-05 lands. Add a note saying so; do not delete the numbers. Not this phase.

**Reviewed, not folded (todos)** — 38 keyword matches reviewed, none address a Phase 1 requirement;
all v1-era. Three named as adjacent but out of scope: the broader bot/human parity audit (RULE-01 is
one live instance of it, not the whole audit); v1's timer-toggle responsiveness complaint (superseded
by `/4`'s rebuilt toggle); v1's "disabled clock button for consistency" (superseded by `/4`'s working
toggle).

**Not in this phase at all** (from ROADMAP.md's own phase boundary): anything requiring multiplayer to
run (Phase 2), any corpus/gate work beyond D-07's balance check (Phase 3), any promotion/cutover
decision (Phase 6), any second gameplay rule beyond RULE-01/02.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FIX-01 | The new game's turn-clock preference is stored under its own key (`pp4_timerOff`), so its default no longer reaches the other game; old shared key deleted once. Default stays OFF — not touched. | Architecture Patterns → "FIX-01 — namespace + one-time delete" gives the exact 5 write/read sites (re-verified line numbers), the D-02 one-time-marker pattern (no existing precedent, must be built following the try/catch-swallow convention), and flags the `4/src/ui/util.js:1893` comment that must not be misread as blocking the cleanup. Runtime State Inventory confirms zero non-localStorage state to migrate. |
| TEST-01 | `4/src/ui/stage.js` imports under Node without throwing | Architecture Patterns → "TEST-01" gives the exact fix (typeof-guard `window.addEventListener`, matching `4/src/main.js`'s pattern) AND a new finding: the module-scope `setInterval` at line 1449 will hang a bare `node -e "import(...)"` even after the throw is fixed — the verification script itself must call `process.exit(0)`, per the `module_graph_check.js` precedent (Common Pitfalls #2). |
| TEST-02 | `4/scripts/no_undef_check.js` exits 0 | Architecture Patterns → "TEST-02" gives the confirmed current failure output (3 hits, 1 real + 2 duplicate false-positives on the same line), the exact regex responsible (`CALL_RE` at line 392), and a concrete heuristic fix mirroring the file's own existing `.`-exclusion pattern. Code Examples section has the literal snippet to extend. |
| RULE-01 | A captain who passes receives 1 dubloon at all three `{t:"pass"}` emission sites | Architecture Patterns → "RULE-01/02" gives the recommended `doPass(p)` shared method (matching the existing `doDock` naming/ordering convention), the critical mutate-before-`ev()` ordering requirement (Common Pitfalls #1, backed by `doDock`'s actual code), and the human-only seaSeat-cursor exception that must NOT be folded into the shared method. |
| RULE-02 | Pass narration tells the captain they were paid, in both renderings, across all 50 sea-creature entries | Architecture Patterns → "RULE-01/02" gives the exact code change to `EVENT_NARRATION.pass` using the codebase's own established raw-emoji + `nobrk` + `emojify()`-chokepoint idiom (cited against 7+ existing precedent lines), confirming `SEA_CREATURES` itself needs no edits. |
| FIX-06 | The engine ships exactly one bot planner — `planTurnClassic` and its dead subtree removed | Architecture Patterns → "FIX-06" is this document's deepest section: full caller-safety re-verification (table), the exact end-line of `planTurnClassic` (2875), the epsilon-divergence resolution, and — the phase's largest unknown — `scripts/bot_ladder4.js` read and reproduced in full, with a concrete mechanical description of what the D-05 ladder rewrite means (time-axis before/after comparison, not seat-axis), including how pass-rate/voyage-length reporting is derived from `g.events` with zero new engine instrumentation (satisfies D-07's gate). |
</phase_requirements>

## Summary

This phase touches five self-contained corners of `4/`, and every one of them was directly
readable in the current tree — there is no framework, library, or external API to research here,
only the actual source. All line numbers and claims below were re-verified against the working
tree on 2026-08-18 (not taken on faith from CONTEXT.md or the intake reports), and every one of
CONTEXT.md's pinned locations held exactly. Two things CONTEXT.md did not flag are new findings
from this pass: (1) `4/src/ui/stage.js` registers a module-scope `setInterval(..., 500)` at line
1449 that is **unguarded** by the `typeof document` check its neighbor at line 1463 uses — fixing
only the line-190 `addEventListener` bug makes stage.js import without *throwing*, but a plain
`node -e "import(...)"` will still hang forever afterward unless the verification script forces
`process.exit(0)` after the import promise resolves (a pattern already established in this repo at
`scripts/module_graph_check.js:208,211`); and (2) `scripts/bot_ladder4.js` is now read in full
below, which resolves exactly what "seat all bots with the shipping brain and compare before vs
after on fixed seeds" has to mean mechanically, and shows that pass-rate/voyage-length reporting
needs zero new engine instrumentation — `Game.ev()`'s existing per-event log already carries
everything the D-07 gate needs.

**Primary recommendation:** Do all five pieces as small, independent, source-verified edits — this
phase has no architectural decisions left to make, only correct application of patterns the
codebase already uses elsewhere (its own `doDock`-style shared method, its own `typeof`-guard
convention, its own before/after ladder-gate convention, its own DOM-free source-text test
convention). Where CONTEXT.md already pinned a fact, this document exists to confirm it held, not
to re-derive it.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Turn-clock preference storage | Browser (localStorage) | UI orchestration (`4/src/orchestrator.js`, `4/src/ui/stage.js`) | Pure client-side persistence; no server/API involved — this is a vanilla static-hosted game with no backend beyond Firebase (currently disabled in `4/`) |
| Node-importability of `stage.js` | Build/test tooling (Node script) | UI/Browser (`4/src/ui/stage.js` itself) | The fix is inside the UI module, but the thing being satisfied is a headless Node contract, not a browser behavior |
| `no_undef_check.js` heuristic | Build/test tooling (static analysis script) | — | Pure source-text analysis tool; no runtime tier |
| Pass → dubloon rule | Game engine (`4/src/engine/index.js`) + UI orchestration (`4/src/ui/flow.js`) | — | State mutation (`p.coins+=1`) must live wherever `Game.ev()` is called, since `ev()` itself only records — see Common Pitfalls |
| Pass narration copy | UI rendering (`4/src/ui/util.js`'s `EVENT_NARRATION.pass`) | Shared data (`4/src/shared/index.js`'s `SEA_CREATURES`) | The tag is appended by the renderer; the 50 hand-written strings themselves are untouched |
| Dead bot-planner removal | Game engine (`4/src/engine/index.js`) | Bot-tuning tooling (`scripts/bot_ladder4.js`) | The deletion is engine-internal; the only external blast radius is the tuning script that references the deleted method |

## Standard Stack

Not applicable in the conventional sense — this phase installs no packages and adds no
dependencies. The project's standing stance (`.claude/CLAUDE.md` §Project: "no build step") governs:
every fix in this phase is plain ES modules, no bundler, no test framework beyond the repo's own
hand-rolled `node scripts/X.js` convention (see Validation Architecture below).

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled `check(name, actual, expected)` test harness (existing convention) | A real assertion library (`node:assert`) or test runner (`node --test`) | Out of scope for this phase — every existing gate in `scripts/` uses the hand-rolled convention (`hail_ranking_test.js`, `narration_test.js`, `narration_flow_test.js`, etc.); introducing a second convention mid-milestone would fragment `npm test`'s 21-gate chain for no benefit this phase needs |

**Installation:** None. No `npm install` step exists in this project (`npm --version` 11.12.1,
`node --version` v25.9.0 confirmed present in this environment; the project itself declares no
`dependencies`/`devDependencies` in `package.json` — verified by reading the file in full).

## Package Legitimacy Audit

**Not applicable.** This phase installs zero external packages. `package.json` (read in full) has no
`dependencies` or `devDependencies` fields at all — the project's standing "no build step" rule
means nothing to legitimacy-check here. Skip the Package Legitimacy Gate for this phase.

## Architecture Patterns

### System Architecture Diagram

```
FIX-01 (clock preference)                          RULE-01/02 (pass pays)
──────────────────────────                          ───────────────────────
localStorage["pp_timerOff"] (SHARED, legacy)         Game.takeTurn(p) [engine, headless]
        │  read by live game (src/orchestrator.js:1399,1404)   │
        │  written by /4  (4/src/ui/stage.js:1478,909;         ├─ this.ev({t:"pass",...})  ← RECORDS ONLY
        │                  4/src/orchestrator.js:184,1570,1576) │  (Game.ev() returns early if !this.record)
        ▼                                                       │
   ONE-TIME cleanup (marker-guarded)                             ▼
        │  reads pp_timerOff once, deletes it,                p.coins += 1  ← MUST happen before ev(),
        │  never touches it again                                 matching doDock's existing p.coins+=…
        ▼                                                          then-ev() ordering (line 906)
localStorage["pp4_timerOff"] (NEW, /4-only)
        │  read/written by 4/src/ui/stage.js, 4/src/orchestrator.js  UI-tier mirrors (not inherited —
        ▼                                                          flow.js:2130-2137 explains why):
   4/'s clock UI (default OFF, unchanged)                     4/src/ui/flow.js:1861 (human "pass" branch)
                                                                4/src/ui/flow.js:2140 (bot fallback, animated)
TEST-01/02 (stage.js importable, checker exits 0)                     │
──────────────────────────────────────────────────                    ▼
node -e "import('4/src/ui/stage.js')"                          EVENT_NARRATION.pass (4/src/ui/util.js:504)
        │                                                       appends `Recipe idea! (+1🌕)` inside
        ├─ line 190: bare addEventListener → ReferenceError    <span class="nobrk">, raw 🌕 char,
        │     FIX: typeof-guard + window. prefix                emojify() swaps it for COIN_IMG later
        │     (matches 4/src/main.js:32,180 pattern)             at panel()'s chokepoint (D-50)
        ├─ line 1449: unguarded module-scope setInterval
        │     (keeps Node process alive after import resolves — FIX-06 (dead planner)
        │     verification script must call process.exit(0))    ─────────────────────
        └─ line 1483: `set subject`/`get subject` accessors     scripts/bot_ladder4.js
              flagged by no_undef_check.js's CALL_RE regex       (the ONLY script that loads 4/)
              FIX: heuristic exclusion for get/set NAME(         │
              (applied to BOTH scripts/no_undef_check.js AND     ├─ imports Game.prototype.planTurnClassic
               4/scripts/no_undef_check.js — byte-identical      │     as its CONTROL ARM (line 29)
               today, must stay that way)                        │     ← breaks the instant D-05 deletes it
                                                                   └─ REWRITE: control arm becomes
                                                                        "before RULE-01" vs "after RULE-01"
                                                                        on identical seeds, reusing the same
                                                                        run()/ladder() shape, reading pass
                                                                        count + round count from g.events
                                                                        (no new engine instrumentation needed)
```

### Recommended Approach per Requirement

**FIX-01 — namespace + one-time delete.**
1. Rename every `4/`-side `localStorage` key literal `"pp_timerOff"` to `"pp4_timerOff"` (D-01)
   at the 5 confirmed sites (all line numbers re-verified 2026-08-18):
   - `4/src/ui/stage.js:1478` — the force-write (`initStage()`'s "off by default" seed)
   - `4/src/ui/stage.js:909` — the menu toggle
   - `4/src/orchestrator.js:184` — the sheet toggle
   - `4/src/orchestrator.js:1570` — the read
   - `4/src/orchestrator.js:1575-1576` — the read that pushes the value to the room via `netSetTimerOff`
2. Add a **one-time, marker-guarded** deletion of the OLD shared key (D-02) — this codebase has no
   existing precedent for a runtime localStorage migration marker (`scripts/migrate_app_state.js` is
   a *source-code* migration tool, not a runtime one), so the pattern must be built fresh, following
   the established try/catch-swallow convention (`4/src/ui/util.js:1893-1898`,
   `4/src/ui/audio.js:177-183`: `try{...}catch(e){}`, no logging). Concretely: on `/4` boot, check a
   new marker key (e.g. `pp4_timerOffCleaned`); if absent, `localStorage.removeItem("pp_timerOff")`
   and set the marker, all inside one try/catch; if present, do nothing. Do this exactly once, not on
   every load (D-02's own rationale: deleting every load re-commits the leak from the other direction
   whenever a live-game session later writes `pp_timerOff` and `/4` deletes it again).
3. **Do not misread `4/src/ui/util.js:1893`'s comment** ("pp_id/pp_timerOff are structurally
   excluded from this mechanism (D-03) — never versioned/cleared"). That comment is about the
   `SESSION_SCHEMA_V`/`SOLO_SCHEMA_V` *resumable-session-blob* clearing mechanism specifically — it
   says `pp_timerOff` is not part of that particular auto-clear-on-schema-bump system. It is **not** a
   prohibition on FIX-01's one-time cleanup, which is an unrelated, new, one-off mechanism. Flag this
   nuance in the plan so a future reader doesn't treat the comment as blocking the fix.
4. All 4 keys D-04 says "stay shared" (`pp_id`, `pp_lastName`, `pp_muted`) and the 2 keys that "cannot
   leak" (`pp_rematch`, `pp_seaIdx`) were not re-verified in this pass — CONTEXT.md's grep is already
   precise and citing the same line numbers again adds nothing. Trust D-04's table as-is.

**TEST-01 — stage.js importability, two problems not one.**
1. Fix the real bug: `4/src/ui/stage.js:190`, `addEventListener("resize", ...)` bare call. The
   established guarded pattern is at `4/src/main.js:32` (`if (typeof window !== "undefined") {`)
   wrapping `window.addEventListener(...)` calls at `4/src/main.js:180,192,211,212`. Apply the same
   shape: either wrap in the same `typeof window!=="undefined"` guard already used at
   `4/src/ui/board.js:847`/`4/src/ui/panel.js:455` (inline ternary style) or the block-guard style
   used in `4/src/main.js:32`. **Prefix with `window.`** either way — a bare `addEventListener` has no
   implicit global binding under Node, but `window.addEventListener` under a `typeof window` guard
   degrades cleanly.
2. **New finding, not in CONTEXT.md:** even after fixing line 190, `4/src/ui/stage.js:1449`'s
   module-scope `setInterval(() => {...}, 500)` is unguarded (unlike its neighbor at `:1463`, which
   correctly uses `if (typeof document !== "undefined" && document.addEventListener){`). This
   `setInterval` keeps a bare `node -e "import(...)"` process alive indefinitely after the import
   resolves — confirmed empirically: importing stage.js with a bare promise `.then(() => console.log('OK'))`
   hangs forever, while the same import with an explicit `process.exit(0)` inside the `.then()`
   callback exits immediately. Success criterion 2 only requires stage.js to **import without
   throwing** — it does not require the process to exit on its own — so the verification script for
   TEST-01 must call `process.exit(0)` on successful resolution, exactly as `scripts/module_graph_check.js:208,211`
   already does for its own dynamic imports. This is a verification-script detail, not a stage.js
   defect, and should not be "fixed" by adding a guard to the `setInterval` itself (that would be
   scope creep beyond what TEST-01 asks for — the interval running in a real browser is correct and
   deliberate, per its own header comment about the watchdog).

**TEST-02 — checker heuristic, apply to both copies.**
Ran the check live: `node 4/scripts/no_undef_check.js` currently exits 1 with exactly 3 reported
hits — one real (`stage.js:190`, same bug as TEST-01) and two duplicate false positives at
`stage.js:1483` (`set subject(v){...}` and `get subject(){...}`, both inside the `window.__pp4`
bridge object literal at `initStage()`). The checker's `CALL_RE` regex
(`4/scripts/no_undef_check.js:392`, `/\b([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g`) matches `subject(` as a
call-position identifier because it has no concept of `get`/`set` accessor syntax — it only excludes
matches preceded by `.` (property calls) and matches in `declared`/`RESERVED`/`GLOBAL_ALLOWLIST`
sets (`4/scripts/no_undef_check.js:406-412`). **Recommended heuristic fix:** before recording a
failure in `checkFile()` (around line 403-418), add the same style of backward-scan the existing `.`
exclusion already uses — look at the nearest non-whitespace token before the match; if it is the
bare word `get` or `set` (word-boundary-checked, not part of a longer identifier), skip the match.
This mirrors the file's own existing pattern exactly (the property-call exclusion at
`4/scripts/no_undef_check.js:409-412` does the identical "walk backward past whitespace, check the
token" technique) and needs no new data structures. `4/scripts/no_undef_check.js` and
`scripts/no_undef_check.js` are byte-identical today (`diff` confirms it) — apply the fix to both
files in the same commit, per CONTEXT.md's explicit instruction, even though `src/` (root) currently
has no accessor in this shape to trigger the bug.

**RULE-01/02 — one shared method, matching an existing naming convention.**
`Game` already has a `do*`-prefixed convention for a discrete, event-emitting turn action:
`doDock(p,port)` at `4/src/engine/index.js:901` mutates `p.coins` (line 906) **before** calling
`this.ev(...)` later in the same method — confirmed this is the established ordering (state mutated
first, event recorded second), which matters because `Game.ev()` (`4/src/engine/index.js:320`)
snapshots `o.state=this.players.map(p=>({pos,coins,ing,done,baking}))` **at the moment `ev()` is
called** — so if `p.coins+=1` happened *after* `this.ev({t:"pass",...})`, the recorded event's own
state snapshot would show the pre-payment purse, and anything that renders game state FROM the event
(the scrubber, replay) would show the wrong amount at that exact tick. **Recommended: add
`doPass(p)` to `Game`**, following `doDock`'s shape: `p.coins+=1; this.ev({t:"pass",p:p.idx,sea:this.nextSeaCreature(p)});`
called from all three sites instead of the bare `ev(...)` call each currently makes:
- `4/src/engine/index.js:2993` (engine fallback, inside `takeTurn`) — becomes `this.doPass(p);`
- `4/src/ui/flow.js:2140` (bot fallback, animated) — becomes `g.doPass(p);`
- `4/src/ui/flow.js:1861` (human menu) — becomes `appState.game.doPass(p);`, **but the seaSeat cursor
  advance immediately after it (`if(p.idx===appState.game.seaSeat)advanceSeaCursor(p);`, line 1862)
  is human-only and must stay outside `doPass()`** — it is not shared behavior, it is per-device
  narration-cursor bookkeeping that bots never touch.

For RULE-02, `EVENT_NARRATION.pass` (`4/src/ui/util.js:504-509`) currently returns
`` txt:`🌊 ${seaLine(e.sea,isLocalTo(e.p,viewerSeat),pn(e.p))}` ``. Append the tag using the exact
established coin-amount idiom seen at `4/src/ui/util.js:564-565,674-678,700-701` and
`4/src/ui/flow.js:1200,1242,1759,2230` — a **raw** `🌕` character (not `iconImg(COIN_IMG)`) wrapped in
`<span class="nobrk">`, because every one of those existing sites uses the raw-emoji-plus-`nobrk`
form and relies on `panel()`'s `emojify(html)` call (`4/src/ui/panel.js:434`) to swap it for
`COIN_IMG` later — never call `iconImg()` directly inside an `EVENT_NARRATION` builder body (that
would bypass the chokepoint D-50 exists to guarantee). Concretely:

```js
// Source: 4/src/ui/util.js:504-509, extended per D-06
pass:(e,at,cellPx,viewerSeat)=>({
  txt:`🌊 ${seaLine(e.sea,isLocalTo(e.p,viewerSeat),pn(e.p))} <span class="nobrk">Recipe idea! (+1🌕)</span>`,
  caps:[[e.p,"🌊 looks into the ocean"]],pops:[[at(e.p),"🌊",false,WAVE_IMG]]}),
```

This changes nothing about `SEA_CREATURES` (`4/src/shared/index.js:226`, untouched, both persons
still read out verbatim per `seaLine`'s own contract at `4/src/ui/util.js:346-349`) and nothing about
`caps`/`pops` (the "🌊 looks into the ocean" tag over the ship and the wave pop are cosmetic, separate
from the narration-box `txt`).

**FIX-06 — verified-safe deletion, plus the ladder rewrite this document treats as the phase's
deepest research item.**

Caller sweep, re-run 2026-08-18 across `4/src/`, `4/scripts/`, and `scripts/bot_ladder4.js` (the
only script anywhere in the repo that imports `4/src/engine/index.js`):

| Symbol | External callers found | Verdict |
|---|---|---|
| `legTurns` (`4/src/engine/index.js:2048`) | Only from within `turnsToWin` (2090,2098,2111) and `planTurnClassic`'s own scope — never called outside the dead subtree | Safe to delete |
| `turnsToWin` (`:2085`) | Only from within itself and `planTurnClassic` (`:2743`) — never called outside | Safe to delete |
| `turnsToWinIf` (`:2128`) | Only from within `planTurnClassic` (7 call sites, all between `:2780`-`:2869`) | Safe to delete |
| `denialValue` (`:2143`) | Only from within `planTurnClassic` (`:2798`,`:2840`,`:2843`) | Safe to delete |
| `planTurnClassic` (`:2739`-`:2875`, confirmed exact end line — the function's closing brace is
  immediately followed by a comment block introducing `chooseAction`) | **One caller outside the dead subtree**: `scripts/bot_ladder4.js:29` (`Game.prototype.planTurnClassic`) — everything else is comments (`:2194-2195`,`:2223`) | **This is the one caller that makes deletion a two-part job, exactly as CONTEXT.md's D-05 states.** `REQUIREMENTS.md:130` ("zero callers") and `CODE-QUALITY.md:59` ("exactly one occurrence") are both confirmed wrong by this re-grep — trust D-05, not the original record. |

Also confirmed live: the float-epsilon divergence CODE-QUALITY.md:121 flagged is real and reads
exactly as claimed — `planTurnClassic`'s tie-break at `4/src/engine/index.js:2774` uses `1e-9`, while
the three v3-suffixed tie-breaks (`:2591`,`:2701`,`:2725`, inside `planTurnV3`/`tour3`) all use
`1e-12`. Deleting `planTurnClassic` resolves this divergence by removing the `1e-9` copy entirely —
no epsilon needs to be reconciled, since nothing else uses `1e-9`.

**`scripts/bot_ladder4.js`, read in full (82 lines) — this is the "largest unknown" the phase brief
flagged, and it is now fully understood:**

```js
// Source: scripts/bot_ladder4.js:22-46 (current shape, before D-05's rewrite)
import { Game, roundCfg } from "../4/src/engine/index.js";
const GAMES = +(process.argv[2] || 400);
const SEEDMULT = +(process.argv[3] || 7919);
const STRATS = ["pirate", "trader", "balanced", "rusher"];
const V3_PLAN = Game.prototype.planTurnV3;
const CLASSIC_PLAN = Game.prototype.planTurnClassic;      // ← breaks the moment D-05 deletes this

function run(seatsUsingNew) {
  Game.prototype.planTurn = function (p) {
    return seatsUsingNew.has(p.idx) ? V3_PLAN.call(this, p) : CLASSIC_PLAN.call(this, p);
  };
  const wins = STRATS.map(() => 0);
  let rounds = 0, unfinished = 0;
  for (let s = 1; s <= GAMES; s++) {
    const g = new Game({ ...roundCfg(STRATS), bakeoff: true }, s * SEEDMULT, true);  // record=true
    const w = g.play();
    rounds += g.round;
    if (w == null) { unfinished++; continue; }
    wins[w]++;
  }
  Game.prototype.planTurn = function (p) { return this.planTurnV3(p); };
  return { wins, rounds: rounds / GAMES, unfinished, played: wins.reduce((a, b) => a + b, 0) };
}
```

Invocation: `node scripts/bot_ladder4.js [games] [seedMult]` — CLI args, no config file, prints to
stdout only, no exit-code contract (never wired into `npm test`; it is a manual tuning tool, not a
gate). **Cost, from `docs/BOT-V3-RACE-PLANNER.md`'s own measurement on the same architecture:** v3
runs ~420ms/game with all squares scored; a 400-game ladder with 5 arms (1 control + 4 rows) takes
roughly 7 minutes. **Determinism:** yes — `new Game(cfg, seed, record)`'s third constructor arg
(`4/src/engine/index.js:125`) is `record`, set `true` here, and `seed=s*SEEDMULT` is a plain integer
seeding `mulberry32` (`this.rng=mulberry32(seed)`, line 126) — every run with the same `GAMES`/`SEEDMULT`
plays the identical sequence of games.

**What the rewrite concretely means, mechanically.** D-05's brief ("seat all bots with the shipping
brain and compare before vs after the pass dubloon on fixed seeds") does not require any new
seat-based split logic — `planTurn` already dispatches unconditionally to `planTurnV3`
(`4/src/engine/index.js:2197-2198`, confirmed unchanged), so once `planTurnClassic` is gone there is
no "new seats vs old seats" axis left to compare *within* one run. The comparison axis becomes
**time**, not **seat**: run the identical `GAMES`/`SEEDMULT` command against the tree **before**
RULE-01/FIX-06 land and again **after**, and diff the two console outputs — the same technique the
script's own header already documents for "using it as a before/after gate for a change inside the
v3 brain" (`scripts/bot_ladder4.js:16-20`). Concretely, the rewrite should:
1. Delete the `seatsUsingNew`/`Game.prototype.planTurn=` monkey-patch entirely (nothing left to
   patch — every seat already runs `planTurnV3`).
2. Keep the `run()` loop's game-generation shape (`new Game({...roundCfg(STRATS),bakeoff:true}, s*SEEDMULT, true)`,
   same `GAMES`×`SEEDMULT` seed family) so seeds stay identical across a before/after invocation.
3. Add pass-rate and voyage-length reporting **without any new engine instrumentation** — this is
   the key finding: `record:true` is already passed to every `Game` the ladder constructs, so
   `g.events` (populated by `Game.ev()`, `4/src/engine/index.js:320-326`) already contains every
   `{t:"pass",p:idx,...}` and `{t:"turn",p:idx,...}` entry emitted during that game
   (`takeTurn`'s very first line is `this.ev({t:"turn",p:p.idx})`, `4/src/engine/index.js:2957`).
   Per-seat pass rate is therefore a pure derived quantity —
   `passes[seat] = g.events.filter(e=>e.t==="pass"&&e.p===seat).length`,
   `turns[seat] = g.events.filter(e=>e.t==="turn"&&e.p===seat).length`,
   `passRate[seat] = passes[seat]/turns[seat]` — computed by summing across the `GAMES` loop and
   reported alongside the existing `rounds`/`unfinished`/`wins` tallies. This is exactly the "derive
   it from what the game already computes" principle CLAUDE.md §2 and
   `docs/BOT-DESIGN-PRINCIPLES.md` principle 10 require — no new constant, no new engine field, no
   change to what `ev()` emits (RULE-01's `doPass` mutates `p.coins` but does not change the event's
   *shape*, only the state snapshot's *value* — see the Common Pitfalls entry below on why this
   matters for Phase 3's determinism corpus).
4. `scripts/bot_ladder3.js` is untouched — it targets `3/`, which is out of this phase's scope
   entirely (Phase 6 deletes `3/`).

**Doc citations that go stale.** `docs/BOT-V3-RACE-PLANNER.md:9,179` and `docs/FABLE-BOT-BRIEF.md`
cite `planTurnClassic` as "the control arm of every number below" — CONTEXT.md correctly defers
fixing this to Phase 9 (DOC-04/the rejection graveyard). Do not edit those docs in this phase; the
numbers stay true as history, they just become unreproducible, and Wyatt already accepted that cost.

### Anti-Patterns to Avoid
- **Weakening `no_undef_check.js`'s heuristic broadly** (e.g. excluding all `get`/`set` tokens
  anywhere, or loosening the CALL_RE regex generally) instead of the narrow "preceded by the bare
  word `get`/`set`" exclusion — the file's own header (lines 20-27) is explicit that false positives
  are the worse failure mode ("a red build for phantom reasons trains contributors to stop trusting
  it") but also that the tool is deliberately over-permissive rather than under-permissive; a
  broad fix could reintroduce exactly the class of bug (`4/src/ui/stage.js:190`'s bare
  `addEventListener`) TEST-02 exists to catch.
- **Conjugating or deriving grammar from `SEA_CREATURES`** when adding the RULE-02 tag — the tag is
  appended by the renderer as a subjectless fragment specifically so it works unmodified after any of
  the 50 hand-written sentences, regardless of grammatical subject. Do not touch
  `4/src/shared/index.js:226`'s data.
- **Putting `p.coins+=1` inside `Game.ev()`, or inside an `if(this.record)` branch** — `Game.ev()`
  returns immediately when `this.record` is false (`4/src/engine/index.js:320`,
  `if(!this.record)return;`), which happens during ordinary solo/live play outside instrumented
  replay contexts... **verify this before assuming**: check whether `record` is `true` in the live
  browser game, not just in `bot_ladder4.js`'s constructor call, since if `record` is `false` during
  normal play, gating the coin payment on `this.record` would silently break RULE-01 for every real
  player. (Flagged as an Open Question below — recommend explicit verification in the plan/execute
  phase before finalizing `doPass()`'s shape.)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|--------------|-----|
| Coin-amount narration markup | A bespoke `<img>`/coin-icon template inside `EVENT_NARRATION.pass` | The existing `🌕` raw-emoji + `<span class="nobrk">` idiom, resolved later by `panel()`'s `emojify(html)` chokepoint (`4/src/ui/panel.js:434`, `emojify` defined at `4/src/shared/index.js:113`) | Every other coin-amount narration line in the file uses this exact idiom (7+ call sites confirmed); hand-rolling one more path duplicates a chokepoint D-50 was explicitly built to centralize |
| Before/after bot-balance measurement | A new statistics framework or hardcoded "pass rate must be < X%" threshold | Derive pass rate and voyage length from `g.events` (already populated when `record:true`, which `bot_ladder4.js` already passes) | Nothing is a constant (CLAUDE.md §2, `docs/BOT-DESIGN-PRINCIPLES.md` principle 10) — the numbers must come from what the game already computes, and it already computes everything needed |
| Node-import-hang detection | A custom timeout/watchdog wrapper around the TEST-01 verification command | `process.exit(0)` inside the `.then()` callback of the dynamic `import()`, exactly as `scripts/module_graph_check.js:208,211` already does | Established precedent in this exact codebase; a bespoke timeout wrapper would be a second, inconsistent pattern for the same problem |

**Key insight:** every "don't hand-roll" in this phase is really "don't hand-roll — the codebase
already solved this exact problem somewhere else; go copy that shape."

## Runtime State Inventory

This phase is a rename/namespace-migration phase for one localStorage key (`pp_timerOff` →
`pp4_timerOff`), so the Runtime State Inventory applies.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `localStorage["pp_timerOff"]` — a single boolean-ish string (`"0"`/`"1"`) written by any browser that has visited `/4`. **No database, no server-side store** — this is a pure client-side, per-device key; there is nothing to migrate server-side because there is no server involved (Firebase tags are currently disabled in `4/`, per `4/index.html:28`). | Code edit only (rename the key literal at 5 sites) plus a one-time client-side deletion (D-02) — no data migration script needed since the *value itself* never needs to survive the rename (D-01: deliberately not migrated, the old value is simply discarded). |
| Live service config | None. `4/`'s multiplayer tags are disabled; nothing about `pp_timerOff` is pushed anywhere except a live game's own Firebase room (`netSetTimerOff`), which is unaffected by this rename since it operates on the in-memory `off` boolean, not the key name. | None. |
| OS-registered state | None — this is a browser localStorage key, not an OS-level registration (no Task Scheduler, no launchd, no pm2). | None. |
| Secrets/env vars | None — `pp_timerOff`/`pp4_timerOff` are plain client preference keys, not secrets, and are not referenced by any SOPS/env-var name. | None. |
| Build artifacts | None — no build step exists in this project; nothing compiles or bundles the key name into an artifact that could go stale. | None. |

**Nothing found in four of five categories** — the entire runtime-state footprint of FIX-01 is the
single localStorage key itself, on real devices that have visited `/4` today. Since `/4` carries
`noindex, nofollow` and is `Disallow`ed in `robots.txt`, the only browsers holding this state belong
to people Wyatt personally sent the link to (CONTEXT.md D-01's own reasoning, re-confirmed by reading
`4/index.html:10` and `robots.txt:8` directly).

## Common Pitfalls

### Pitfall 1: Paying the coin after `ev()` instead of before
**What goes wrong:** If a `doPass(p)` implementation calls `this.ev({t:"pass",...})` before
`p.coins+=1`, the event's own captured `o.state` snapshot (built inside `ev()` itself,
`4/src/engine/index.js:325`) records the captain's purse **before** the payment. Anything that
renders game state directly from the event stream — the replay scrubber, per the comment at
`4/src/engine/index.js:321-324` — would then show the wrong purse at that exact tick, even though the
narration line says the captain was paid.
**Why it happens:** `Game.ev()` is a passive recorder, not a reducer (`if(!this.record)return;`) — it
is easy to reach for "record the event, then apply its effects" ordering out of habit, especially
since most other engine events (attack, trade) *do* look like "decide → announce → apply" in prose,
even though the actual code mutates state first.
**How to avoid:** Follow `doDock`'s exact ordering (`4/src/engine/index.js:906` mutates `p.coins`,
the `this.ev(...)` call for that action happens later in the same method) — mutate first, record
second, at all three RULE-01 call sites.
**Warning signs:** A scrubbed-back replay showing a captain's purse one dubloon short at the exact
moment their pass narration claims payment.

### Pitfall 2: Fixing stage.js's `addEventListener` and declaring TEST-01 done
**What goes wrong:** `node -e "import('4/src/ui/stage.js')"` still never returns, because the
module-scope `setInterval` at line 1449 keeps the Node event loop alive. A verification script that
just awaits the import promise (without forcing exit) will appear to hang forever, and whoever runs
it manually will conclude the fix didn't work.
**Why it happens:** The line-190 bug and the line-1449 gap are two independent unguarded browser
globals in the same file; fixing one does not fix the other, and the symptom of the second (hang,
not throw) is easy to miss if the first bug's throw was masking it.
**How to avoid:** Write the TEST-01 verification command with an explicit `process.exit(0)` inside
the success branch, matching `scripts/module_graph_check.js:208,211`'s existing pattern.
**Warning signs:** A "test" that never completes and has to be manually killed.

### Pitfall 3: Assuming `planTurnClassic` has zero external callers because the record says so
**What goes wrong:** `REQUIREMENTS.md:130` and `research/v2.0-intake/CODE-QUALITY.md:59` both state
"zero callers" / "exactly one occurrence" — trusting that and deleting the function without also
rewriting `scripts/bot_ladder4.js` breaks the only script in the repo that loads `4/`, silently,
until someone next tries to run a bot-tuning ladder.
**Why it happens:** A grep for "callers" that only looked inside `4/src/` (where the intake report's
scope was presumably bounded) would miss `scripts/bot_ladder4.js`, which lives outside `4/` entirely
but imports from it.
**How to avoid:** Grep the WHOLE repo (`4/src/`, `4/scripts/`, and root `scripts/`) before deleting
anything the intake reports characterized as dead — re-confirmed in this research pass.
**Warning signs:** `docs/BOT-V3-RACE-PLANNER.md`/`docs/FABLE-BOT-BRIEF.md` both describing
`planTurnClassic` as "the control arm of every number below" should have been the tell that a
control-arm script exists somewhere and imports it.

## Code Examples

### The `doDock`/coin-then-event ordering pattern RULE-01 should follow
```js
// Source: 4/src/engine/index.js:901-910 (doDock, existing, unmodified) — the precedent for
// "mutate state, THEN call ev()"
doDock(p,port){
  const ing=port,k=port;
  if(this.cfg.singleDock&&this.dockOccupiedBy(ing,p))return false;
  p.firstFlip.add(k);p.dockedNow.add(k);p.justDocked=true;
  const h=this.flip(p);
  p.coins+=h?this.cfg.dockHeads:this.cfg.dockTails;   // ← mutate first
  const price=this.cratePrice(ing);
  // ... this.ev({t:"dock",...}) happens later in this method, after the mutation above
```

### The typeof-guard pattern TEST-01 should reuse
```js
// Source: 4/src/main.js:32-37,180 (existing, unmodified)
if (typeof window !== "undefined") {
  // `typeof window` guard — under Node there is no script ordering to ...
  window.addEventListener("resize", () => { ... });
```

### The `process.exit(0)`-on-successful-import pattern
```js
// Source: scripts/module_graph_check.js:~200-211 (existing convention, referenced by line number
// range — exact surrounding lines not reproduced here since this is cited as a pattern to reuse,
// not code to copy verbatim)
// ... dynamic import(...) resolves ...
process.exit(0);
```

### The `.` property-call exclusion `no_undef_check.js` already has, to mirror for `get`/`set`
```js
// Source: 4/scripts/no_undef_check.js:409-412 (existing) — the shape to copy for the accessor fix
let p = idx - 1;
while (p >= 0 && /\s/.test(masked[p])) p--;
if (p >= 0 && masked[p] === ".") continue;
// RECOMMENDED ADDITION, same shape: walk further back past the identifier at `p` and check
// whether IT is the bare word "get" or "set" (word-boundary-checked); if so, continue (skip).
```

## State of the Art

Not applicable — no external libraries or APIs are in scope for this phase, so there is no
"deprecated vs current" axis to research. The relevant "state of the art" is entirely intra-project:
`planTurnV3`/`tour3` (current) supersede `planTurnClassic`/`turnsToWin` (being deleted this phase),
already fully documented in `docs/BOT-V3-RACE-PLANNER.md`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `Game.record` is `true` during ordinary live/solo browser play (not only inside `bot_ladder4.js`'s instrumented runs), so gating `doPass()`'s coin payment on `this.record` (if that pattern were chosen) would not silently break payment for real players. **Not verified in this pass** — flagged as an Open Question below, and the recommended `doPass()` shape (mutate unconditionally, call `this.ev()` which self-gates) sidesteps this risk entirely by never conditioning the coin mutation on `record` in the first place. | Common Pitfalls / Anti-Patterns | If a future implementation conditions `p.coins+=1` on `this.record` by mistake (rather than only the `ev()` call being self-gating), real players might get paid inconsistently depending on whether their session happens to run with `record:true`. Low risk given the recommended pattern avoids it, but worth one grep-check during planning. |
| A2 | The recommended `no_undef_check.js` heuristic fix (exclude call-position identifiers immediately preceded by bare `get`/`set`) will not introduce a false negative for a legitimate function literally named `get` or `set` called bare (e.g. a local `function get(x){...}` called as `get(x)`). This pattern does not currently exist anywhere in `4/src/` or `src/` (not exhaustively re-verified across every file in this pass), and the file's own stated design philosophy explicitly prefers over-permissive to under-permissive, so even if this pattern existed, the tradeoff is exactly what the tool's own header endorses. | Architecture Patterns → TEST-02 | Very low — would only matter if a future file defines a bare top-level `get`/`set` function and calls it without a receiver, which is unconventional in this codebase's style (everything else uses named exports). |

## Open Questions

1. **Is `Game.record` `true` during a normal solo/live browser game, or only inside instrumented
   test/ladder contexts?**
   - What we know: `bot_ladder4.js` explicitly passes `true` as the third `Game` constructor arg
     (`4/src/engine/index.js:125`, `record`). `Game.ev()` self-gates on `this.record`.
   - What's unclear: whether the browser orchestration layer (`4/src/orchestrator.js`,
     `4/src/main.js`) also constructs `Game` with `record:true` for ordinary play, which this
     research pass did not trace end-to-end.
   - Recommendation: a quick grep of `new Game(` call sites outside `scripts/` during planning/
     execution will resolve this in under a minute; it does not block the recommended `doPass()`
     design (which never conditions the coin mutation on `record`), but is worth confirming so the
     plan's verification step can state with certainty that `ev()` is not silently a no-op during
     real play.

2. **Does the D-07 balance gate's before/after ladder comparison need to run on BOTH the dev seed
   family (×7919) and the held-out family (×104729), matching `BOT-V3-RACE-PLANNER.md`'s own
   two-family verdict convention, or is one family sufficient for a "does passing more get rewarded"
   check?**
   - What we know: the original v3-vs-classic verdict used both families specifically to guard
     against overfitting a brain to seeds it was tuned against. The pass-dubloon change is a rule
     change, not a brain change, so overfitting-to-seeds is not the same risk.
   - What's unclear: whether Wyatt would want the same two-family rigor applied here, or considers a
     single-family before/after sufA6icient given the much narrower claim being tested (one new
     incentive, not a whole new planner).
   - Recommendation: default to the single dev family (×7919, 400 games, ~7 minutes) for the gate
     itself, since that is what the existing `bot_ladder4.js` CLI already defaults to with no
     argument changes needed, and note in the plan that a held-out re-run is available in ~7 more
     minutes if the dev-family result is borderline.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All 6 requirements (every fix/check/gate in this phase runs via `node scripts/*.js` or `node -e`) | ✓ | v25.9.0 | — |
| npm | Present but unused this phase (no packages to install) | ✓ | 11.12.1 | — |
| Python 3 | Local static server only (`npm start` → `python3 -m http.server 8000`), not required for any Phase 1 verification step | ✓ | 3.9.6 | — |
| Chrome (headless, for a manual UI/UAT pass on FIX-01/RULE-02 rendering) | Confirming `pp4_timerOff` actually persists correctly in a real browser, and confirming the rendered pass narration reads correctly (per CLAUDE.md's "show rendered copy, don't describe it" precedent from D-06's own drafting) | ✓ (Google Chrome present on this machine) | Not version-checked this pass | Manual/human verification if headless driving is skipped |

No missing dependencies, no blockers. Everything this phase needs is already present and already the
project's standing toolchain.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None (hand-rolled). Every gate in `scripts/` is a standalone `node scripts/X.js` file using a local `check(name, actual, expected)` counter and `process.exit(failures?1:0)` — confirmed convention across `narration_test.js`, `narration_flow_test.js`, `ui_contract_check.js`, `no_undef_check.js`, `hail_ranking_test.js`. No `node:test`, no Jest, no Mocha anywhere in the repo. |
| Config file | none — see Wave 0 gaps below (this phase needs a NEW script for TEST-01, following the existing convention) |
| Quick run command | `node 4/scripts/no_undef_check.js` (TEST-02, ~instant); a new `node 4/scripts/stage_import_check.js` (TEST-01, proposed name, ~instant once `process.exit(0)` is added) |
| Full suite command | Root `npm test` (21 gates, **none currently load `4/`** — this phase does not add `4/`'s gates to that chain; that is Phase 3's TEST-04/05 job, explicitly out of scope here per ROADMAP.md's phase boundary) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FIX-01 | `pp_timerOff` deleted once, `pp4_timerOff` used everywhere in `4/`, old key never written by `4/` again | structural (source-text grep, house convention) + manual/headless-browser confirmation of actual localStorage behavior | A new structural check (e.g. grep-based, matching `ui_contract_check.js`'s convention) asserting no `"pp_timerOff"` string literal remains in `4/src/**/*.js` except inside the one-time cleanup function itself | ❌ Wave 0 — no existing check covers this |
| TEST-01 | `4/src/ui/stage.js` imports under Node without throwing | automated (Node script) | `node 4/scripts/stage_import_check.js` (proposed — dynamic `import()`, `process.exit(0)` on resolve per the module_graph_check.js precedent, non-zero exit on reject) | ❌ Wave 0 — script does not exist yet |
| TEST-02 | `4/scripts/no_undef_check.js` exits 0 | automated (already exists) | `node 4/scripts/no_undef_check.js` | ✅ exists, currently exits 1 (expected pre-fix state) |
| RULE-01 | All 3 pass sites pay 1 dubloon | automated (engine site, headless) + structural (UI-tier sites) | A new script asserting `p.coins` increases by exactly 1 across a forced-pass `Game.takeTurn(p,...)` call (engine site, fully DOM-free per the `bot_ladder4.js`/`narration_flow_test.js` precedent of importing `4/src/engine/index.js` directly), PLUS a structural source-text assertion (matching `narration_flow_test.js`'s own documented convention of proving `flow.js` invariants by reading its source rather than executing DOM-dependent functions) that both `4/src/ui/flow.js` pass sites call the same shared `doPass(`/`g.doPass(`/`appState.game.doPass(` method | ❌ Wave 0 — neither script exists yet |
| RULE-02 | Pass narration says "paid" in both persons, across all 50 entries | automated (headless, DOM-free) | A new script importing `EVENT_NARRATION.pass` directly from `4/src/ui/util.js` (mirrors `scripts/narration_test.js`'s exact import style) and calling it with a fabricated `{t:"pass",p:0,sea:SEA_CREATURES[i]}` event for all 50 `SEA_CREATURES` entries, at both `viewerSeat=0` (addressed) and `viewerSeat=1` (third-person, not matching `e.p`), asserting `txt` contains `"Recipe idea!"` and `"🌕"` for all 100 renderings | ❌ Wave 0 — script does not exist yet |
| FIX-06 | `planTurnClassic` and its dead subtree are gone; `scripts/bot_ladder4.js` still runs | automated (existing `bot_ladder4.js`, rewritten) + `node -e "import(...)"` sanity check that `Game.prototype.planTurnClassic` is `undefined` post-deletion | `node scripts/bot_ladder4.js` (rewritten, before/after mode) exits without throwing and prints a pass-rate/voyage-length delta | ✅ script exists, ❌ needs the D-05 rewrite described above |

### Sampling Rate
- **Per task commit:** run the specific new/modified script for that task (e.g. after the FIX-01
  commit, run its structural check; after the TEST-01 fix, run the new import-check script).
- **Per wave merge:** run all of TEST-01's, TEST-02's, RULE-01's, RULE-02's, and FIX-06's checks
  together, plus a `git diff --stat` sanity check that no file outside `4/` (or the two
  `no_undef_check.js` copies, deliberately) was touched.
- **Phase gate:** all five new/modified checks green, plus `node 4/scripts/no_undef_check.js` and
  `node scripts/no_undef_check.js` both exit 0, before `/gsd-verify-work`. Root `npm test`'s existing
  21 gates should also still be run (they don't cover `4/`, but they must not have been broken by the
  `scripts/bot_ladder4.js` rewrite or the `no_undef_check.js` heuristic change, both of which live
  outside `4/`).

### Wave 0 Gaps
- [ ] A new TEST-01 verification script (`4/scripts/stage_import_check.js` or similar) — covers TEST-01
- [ ] A new FIX-01 structural check (grep-style, house convention) — covers FIX-01
- [ ] A new RULE-01 engine-level headless test (direct `4/src/engine/index.js` import, forced-pass
      scenario) plus a structural check on the two `flow.js` sites — covers RULE-01
- [ ] A new RULE-02 narration test (direct `4/src/ui/util.js` import, all 50 `SEA_CREATURES` × 2
      viewer persons) — covers RULE-02
- [ ] `scripts/bot_ladder4.js` rewrite (before/after mode, pass-rate/voyage-length reporting from
      `g.events`) — covers FIX-06's D-07 balance gate

*(No framework install needed — every gap above follows the existing hand-rolled `node scripts/X.js`
convention already used by 20+ scripts in this repo.)*

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | This phase touches no auth surface — `pp_id`/`pp_lastName` (identity keys) are explicitly untouched (D-04: "stays shared") |
| V3 Session Management | No | No session-token or cookie handling anywhere in this phase's scope |
| V4 Access Control | No | No access-control surface in scope |
| V5 Input Validation | Marginal — the only "input" in this phase is `p.idx`/seat index (already an internal, engine-controlled integer, never taken from user-supplied text) flowing into `doPass(p)`. No new user-facing input field, form, or URL parameter is introduced. | N/A — no new validation surface |
| V6 Cryptography | No | No cryptographic operation in scope |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| localStorage key collision across two co-hosted apps sharing an origin (the actual bug FIX-01 fixes) | Tampering (unintended cross-app state mutation, not adversarial) | Per-app key namespacing (`pp4_` prefix) — already the pattern this phase applies; no further mitigation needed since this is a same-origin, same-developer, non-adversarial collision, not an XSS/injection vector |

**Overall assessment:** this phase has essentially no security surface. It is internal refactoring,
a testability fix, a static-analysis heuristic fix, a game-rule addition, and a dead-code removal —
none of it touches authentication, authorization, cryptography, or externally-supplied input in any
new way. The one item worth naming (localStorage namespace collision) is already exactly what FIX-01
is scoped to fix, and the standard mitigation (namespacing) is already the chosen approach (D-01).

## Sources

### Primary (HIGH confidence — direct codebase reads, re-verified 2026-08-18)
- `4/src/engine/index.js` (3,313 lines, read in relevant sections: 1-40, 124-160, 300-340, 895-920,
  2048-2200, 2330-2530, 2546-2760, 2860-3000) — `Game` class, `doDock`, `ev()`, `planTurn`,
  `planTurnClassic`'s exact bounds (2739-2875), `turnsToWin`/`turnsToWinIf`/`denialValue`/`legTurns`
  caller sweep, the `1e-9`/`1e-12` epsilon divergence, the `takeTurn` pass-emission site (2993)
- `4/src/ui/flow.js` (2,501 lines; sections 1845-1875, 2120-2145, 2215-2235 read) — both flow.js pass
  emission sites, the `showTurnOrderIntro` `nobrk`/`🌕` precedent
- `4/src/ui/util.js` (2,013 lines; sections 330-370, 490-520, 1885-1905 read) — `seaLine`, the pass
  narration renderer, the `pp_id`/`pp_timerOff` SESSION_SCHEMA_V exclusion comment
- `4/src/ui/stage.js` (1,545 lines; sections 180-200, 1436-1470, 1475-1500 read) — the bare
  `addEventListener` bug, the unguarded module-scope `setInterval`, the `set/get subject` accessors
- `4/src/main.js` (sections around 30-40, 150-165, 175-215 read) — the `typeof window` guard
  precedent this phase's TEST-01 fix should reuse
- `4/scripts/no_undef_check.js` (448 lines; header + lines 390-447 read in full) — `CALL_RE`, the
  `.`-exclusion pattern, the checker's own design philosophy
- `4/src/orchestrator.js`, `src/orchestrator.js` (targeted grep + read around 1560-1578, 170-185) —
  all 5 `pp_timerOff` sites, confirmed against the live game's read sites too
- `scripts/bot_ladder4.js` (82 lines, read in full) — the entire "largest unknown" of this phase
- `docs/BOT-V3-RACE-PLANNER.md` (read: architecture, cost, verdict sections) — v3 brain's own
  documented performance and the 27,867-outcome fitting reference
- `docs/BOT-DESIGN-PRINCIPLES.md` principle 10 (read in full) — the "nothing is a constant" rule
  applied to the D-07 balance gate
- `package.json`, `.planning/config.json` (read in full) — no dependencies, `nyquist_validation:true`,
  `security_enforcement:true`, `security_asvs_level:1`
- `git log --all` (multiple `--grep`/`-S` passes across "ladder", "planTurnClassic", "pass") — the
  graveyard search CONTEXT.md's brief mandated; see Metadata below for what it found

### Secondary (MEDIUM confidence)
- None used — every claim in this document traces to a direct file read or a live command run in
  this session, not to an external web search.

### Tertiary (LOW confidence)
- None. This phase required zero external/library research.

## Metadata

**Confidence breakdown:**
- Standard stack: N/A — no external packages in scope this phase
- Architecture: HIGH — every line number and call-site claim was re-verified by direct Read/grep
  against the working tree on 2026-08-18, not inherited from CONTEXT.md without re-checking
- Pitfalls: HIGH — the `ev()`-ordering pitfall is demonstrated against `doDock`'s actual code; the
  `setInterval`-hang pitfall was empirically reproduced (hung with a bare `.then()`, exited cleanly
  with `process.exit(0)`) in this session

**Git graveyard search results (per CONTEXT.md's mandate):**
- `git log --all --grep="ladder" -i`: surfaced the v3 race-planner's introduction (`8eb1a95`, "3: the
  race planner — a new bot brain, proved on the ladder") and a long trail of `/4`-era commits, none
  of which reveal a PRIOR attempt at a before/after pass-rate gate — this is genuinely new ground,
  not a re-run of a settled argument.
- `git log --all --grep="planTurnClassic" -i`: exactly one hit, `8eb1a95` — the same commit that
  introduced it as the control arm. No later commit discusses removing or reconsidering it, which is
  consistent with CONTEXT.md's finding that the "zero callers" claim in the record was simply never
  re-checked after that commit, not that removal was previously attempted and reverted.
- `git log --all --grep="pass" -i` / `-S "planTurnClassic"`: broad hits (mostly unrelated "pass and
  play" commits from the phrase "pass"), nothing indicating a prior rejected design for paying a pass
  dubloon — RULE-01/02 is genuinely new territory in this repo's history, matching REQUIREMENTS.md's
  own framing of it as "the one new gameplay rule."
- **No number or ruling in this phase's scope was found to have been previously defended and then
  reversed.** The graveyard search did not surface a "tell" (a number going up being excused because
  another stayed flat) anywhere relevant to this phase.

**Research date:** 2026-08-18
**Valid until:** This is a snapshot of an unreleased, actively-developed branch (`4/` forked
2026-08-11, no code commit on root since 2026-08-02) — treat as valid only until the next commit
touches any of the files cited above. Re-verify line numbers before executing if any time has passed
since this research or if other phase work has landed in the interim.
