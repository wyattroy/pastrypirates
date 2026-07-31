---
phase: 08-engine-extraction-node-harness-migration
plan: 05
subsystem: infra
tags: [determinism, oracle, source-hash-rebase, browser-verification, storm, corpus-blind-path]

# Dependency graph
requires:
  - phase: 08-engine-extraction-node-harness-migration
    provides: "Plan 03 (engine relocated to src/engine/ + src/shared/, load_engine.js native-import seam) and Plan 04 (scripts/engine_contract_check.js, docs/MODULES.md) — the final code state this plan's browser check and hash re-base run against"
provides:
  - "Chrome-verified proof that the classic live turn loop's corpus-blind bridge dependencies (game.r(), rollStorm, PERP, DIRS, windStepCost) all still work with the engine living outside index.html — closing the coverage gap 08-03-SUMMARY.md explicitly recorded as open"
  - "scripts/rebase_source_hash.js — a gated, zero-flag tool that is now the second (and only other) legitimate write path to manifest.json, alongside --capture, but incapable of touching anything but engineSourceHash"
  - "manifest.engineSourceHash re-based from the pre-extraction value to the post-relocation value, in its own dedicated commit"
  - "scripts/determinism_baseline.js's playSeed/serializeSeed/hashBytes/MANIFEST_PATH exported (minimal factoring, disclosed) so the re-base tool reuses verify()'s exact comparison-2 logic instead of a second implementation"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Gate-before-write for any tool with a second write path to a frozen oracle: replay-and-compare against every frozen assertion first, refuse non-zero on any divergence, only then perform the surgical single-field mutation."
    - "Reuse the oracle's own comparison logic via minimal, disclosed factoring (export existing functions) rather than reimplementing a parallel copy — a second, subtly-different comparison is how an oracle quietly stops being one."
    - "Entry-point guard for scripts with top-level side-effecting code (`if (import.meta.url === \`file://${process.argv[1]}\`)`) — needed the moment a script becomes importable for its helpers rather than only ever invoked directly."

key-files:
  created:
    - scripts/rebase_source_hash.js
  modified:
    - scripts/determinism_baseline.js
    - scripts/fixtures/determinism/manifest.json

key-decisions:
  - "Factoring determinism_baseline.js's playSeed/serializeSeed/hashBytes/MANIFEST_PATH to `export` (rather than duplicating the logic inside rebase_source_hash.js) is a real touch to the oracle file, per the plan's explicit instruction to disclose rather than do it quietly. Landed as its own `refactor(08-05)` commit, separate from the re-base commit, so the re-base commit's diff stays exactly what D-02 and acceptance criterion 8 require: only `scripts/rebase_source_hash.js` and `scripts/fixtures/determinism/manifest.json`."
  - "Discovered and fixed a real bug surfaced by the refactor itself: `determinism_baseline.js`'s top-level `if (mode === \"capture\") { await capture(); } else { await verify(); }` ran unconditionally on `import`, not just on direct invocation — so `import { playSeed, ... } from \"./determinism_baseline.js\"` (exactly what the re-base tool does) triggered a full, unwanted `verify()` run as a side effect of the import itself. Fixed by guarding that dispatch with an entry-point check (`import.meta.url === file://${process.argv[1]}`), confirmed to leave `node scripts/determinism_baseline.js [--capture|--verify]` behavior byte-identical for every existing caller. Folded into the same refactor commit (Rule 1 — bug in code being introduced this plan, found before the commit landed)."
  - "Amended the re-base commit's message once, before anything else was built on top of it, because its first draft used the literal substring \"sha256\" in prose (describing what the tool does NOT touch) — which made the plan's own acceptance criterion 5 (`git show HEAD -- manifest.json | grep -c 'sha256'` → `0`) fail, even though the actual manifest.json diff content was already clean (confirmed via `git diff HEAD~1 HEAD -- manifest.json | grep -c sha256` → `0` both before and after the reword). Reworded to \"per-seed content hashes\" — same meaning, criterion now passes literally, not just in substance."

requirements-completed: [ENGINE-01, ENGINE-02, ENGINE-03]

coverage:
  - id: D1
    description: "Chrome browser verification: engine loads and plays entirely outside index.html (window.__pp_module_ok=true, __pp_boot_count=1, console clean), and the classic live turn loop's corpus-blind path (game.r(), rollStorm(game), PERP, DIRS, windStepCost) is exercised through a forced storm with both the first-gust and second-gust narration observed"
    requirement: "ENGINE-01, ENGINE-03"
    verification:
      - kind: manual_procedural
        ref: "Chrome MCP transcript, run by the coordinator prior to this executor's invocation — recorded verbatim below under Task 1"
        status: pass
    human_judgment: false
  - id: D2
    description: "scripts/rebase_source_hash.js refuses to run on a corrupted per-seed hash (naming the seed, leaving engineSourceHash untouched) and succeeds on a clean tree"
    requirement: "ENGINE-03"
    verification:
      - kind: integration
        ref: "Refusal-drill transcript below: corrupted seed 12350 to 64 zeros, node scripts/rebase_source_hash.js exits 1 and names seed 12350; git checkout -- restored; tool then exits 0"
        status: pass
    human_judgment: false
  - id: D3
    description: "The re-base is its own commit containing exactly scripts/rebase_source_hash.js and scripts/fixtures/determinism/manifest.json (one changed line, no perSeed[] touched); the 30 corpus .jsonl files remain at exactly one commit in their history and manifest.json at exactly two"
    requirement: "ENGINE-03"
    verification:
      - kind: unit
        ref: "git show --stat HEAD (2 files, 1 insertion + 1 deletion in manifest.json); git show HEAD -- manifest.json | grep -c '^[+-][^+-]' = 2; git show HEAD -- manifest.json | grep -c sha256 = 0; git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l = 1; git log --oneline -- manifest.json | wc -l = 2"
        status: pass
    human_judgment: false
  - id: D4
    description: "node scripts/determinism_baseline.js --verify reports SOURCE: unchanged with all 30 seeds passing after the re-base; npm test and scripts/engine_contract_check.js both exit 0"
    requirement: "ENGINE-03"
    verification:
      - kind: integration
        ref: "node scripts/determinism_baseline.js --verify (exit 0, 30 PASS lines, SOURCE: unchanged); npm test (exit 0); node scripts/engine_contract_check.js (exit 0, 4 PASS lines)"
        status: pass
    human_judgment: false

# Metrics
duration: ~45min
completed: 2026-07-24
status: complete
---

# Phase 8 Plan 5: Browser Verification & engineSourceHash Re-base Summary

**Closed Phase 8 honestly: proved in Chrome that the classic live turn loop's corpus-blind storm/second-gust path still works with the engine living entirely outside `index.html`, and re-based `manifest.engineSourceHash` in its own dedicated commit using a purpose-built, gated tool — never `--capture`.**

## Performance

- **Duration:** ~45 min active execution (Task 1's Chrome verification was run by the coordinator prior to this agent's invocation and is recorded here verbatim; this agent executed Task 2's tool build, red-proof drill, commit, and full verification sweep)
- **Tasks:** 2 (Task 1 browser verification — pre-completed by coordinator, recorded here; Task 2 source-hash re-base — executed by this agent)
- **Files modified:** 2 code files (`scripts/rebase_source_hash.js` created, `scripts/determinism_baseline.js` minimally factored) + 1 fixture (`scripts/fixtures/determinism/manifest.json`, one line)

## Accomplishments

- **Task 1 (Chrome, run by coordinator, recorded here):** proved the engine boots and plays end-to-end from `src/engine/`/`src/shared/` — `window.__pp_module_ok === true`, `window.__pp_boot_count === 1`, `Object.keys(window.PP).length === 128` (matching 08-04's final export count) — then forced a storm and drove the game through round 3, observing both the first-gust storm narration and the second-gust `windNow2` narration (`"— Round 3: STORM! Wind blows west, then north —"`), with ships pushed twice in the round. This is the exact path 08-03-SUMMARY.md's "Coverage Gap" section named as unverified by the 30-seed corpus, and it is now closed.
- **Task 2 (this agent):** built `scripts/rebase_source_hash.js` — a zero-flag, gated tool that replays every seed fresh, compares each against its frozen `manifest.perSeed[].sha256` (reusing `determinism_baseline.js`'s own comparison-2 logic via three exported helper functions, not a reimplementation), refuses non-zero on any divergence, and otherwise mutates only `manifest.engineSourceHash` on the already-parsed object before writing it back.
- Proved the refusal path is real, not decorative, before trusting the success path: corrupted `perSeed[5]` (seed 12350)'s `sha256` to 64 zeros, ran the tool, confirmed it named seed 12350 and exited 1 with `engineSourceHash` left untouched, then restored via `git checkout --` and confirmed the tool then ran clean.
- The refusal drill itself surfaced a real bug in the plumbing before it ever reached a commit: importing `determinism_baseline.js` for its helpers also ran its top-level `verify()` as an unwanted side effect of the import (because `mode` defaults to `"verify"` when no `--capture` flag is present on `process.argv`). Fixed with an entry-point guard; confirmed direct invocation (`node determinism_baseline.js --verify`) is behaviorally unchanged.
- `engineSourceHash` re-based from the pre-extraction value `15ad68996befca5130ba11b0cf79d59b0d871956cc11ab961fe32add384d874a` to the post-relocation value `bdc641620a4d28261bdef57cde4ded24174864c1584c78f0eeb16e988508e42e` — a value 08-03-SUMMARY.md had already recorded as the expected target, now landed.
- `node scripts/determinism_baseline.js --verify` now reports `SOURCE: unchanged` (30/30 seeds, event hashes match, and `engineSourceHash` now matches too) — the phase's terminal, honest state.
- `--capture` was never run. The 30 corpus `.jsonl` files remain at exactly one commit in their entire git history; `manifest.json` is at exactly two (Phase 7's capture + this re-base).

## The Updated Storm-Forcing Recipe for Phases 9–12

Recorded here per the plan's output spec, since 07-03-SUMMARY.md's version predates the bridge:

- Address the game with the bare identifier `game`, **not** `window.game` — `let game` at the top of the classic script lives in script scope and never lands on `window`; a `<div id="game">` exists and `window.game` silently resolves to it instead, returning `undefined` for `.cfg`.
- **New in Phase 8:** `rollStorm` is now a property published onto the global object by the `window.PP` bridge (from `src/engine/index.js`) rather than a classic-script function declaration. Plain reassignment (`rollStorm = function(g){...}`) still works exactly as before — confirmed by Task 1's forced-storm playthrough — but it is now overriding a bridge-published binding, not a locally-declared classic function. This is a real behavioral difference from the pre-extraction tree, worth knowing for Phase 9–12 storm-forcing.
- The override must still consume exactly one `g.r()` call before returning, and set `g.stormStreak` — omitting either shifts every subsequent seeded RNG draw or fails to register the storm as active.

## Task 1: Chrome Verification (run by coordinator prior to this agent's invocation)

Recorded verbatim, per this plan's explicit instruction not to re-run it:

**Server:** port 8777, cwd confirmed as this worktree (`/Users/wyattroy/Documents/Projects/pastrypirates/.claude/worktrees/new-session-d6e9d7`). Fresh page load.

Bridge and engine symbols resolving as bare identifiers from classic-parsed code:
```
window.__pp_module_ok    → true
window.__pp_boot_count   → 1
typeof firebase          → "object"
Object.keys(window.PP).length → 128

typeof Game          → "function"    // the class itself, now module-defined
typeof roundCfg      → "function"
typeof rollStorm     → "function"
typeof mulberry32    → "function"
typeof DIRS          → "object"
typeof PERP          → "object"
typeof windStepCost  → "function"

game.constructor.name → "Game"
game.players.length   → 4
game.round            → 2
```

Forced storm (`game.cfg.storm = 1; rollStorm = function (g) { g.r(); g.stormStreak = 1; return true; };`), then played forward through a parley/trade chain into round 3:
```
round        → 3
stormNow     → true
windNow      → "W"
windNow2     → "N"     // second gust present, perpendicular — PERP["W"] is ["N","S"] ✓
boardStorming    → true
overlayOpacity   → "1"
rlayers          → 4
```
Narration banner, verbatim: `— Round 3: STORM! Wind blows west, then north —`

That second-gust narration is `DIRNAME[game.windNow2]` rendering from the classic region — the exact code path headless `Game.play()` never exercises and the 30-seed corpus structurally cannot see. **This closes the coverage gap 08-03's SUMMARY recorded.**

Console: clean. Zero errors across page load, a trade/parley chain, and the storm round.

## Task 2: Re-base engineSourceHash (executed by this agent)

### Pre-flight — precondition confirmed

`node scripts/determinism_baseline.js --verify` on the clean tree, before touching anything: 30/30 `PASS`, `SOURCE: moved, behavior identical` — the expected pre-rebase state, confirming the gate condition ("`--verify` already green") held before the re-base tool was even written.

### Minimal, disclosed factoring of the oracle file

`scripts/determinism_baseline.js`'s `MANIFEST_PATH`, `playSeed`, `serializeSeed`, and `hashBytes` were changed from module-private to `export`ed — no logic changes to any of the four. This is a real touch to the oracle file, called out here per the plan's explicit instruction, and landed as its own commit (`5b8c632`, `refactor(08-05)`) separate from the re-base commit.

**Bug found and fixed by the refusal drill, before any commit landed:** the file's bottom-of-file dispatch (`if (mode === "capture") { await capture(); } else { await verify(); }`) ran unconditionally at module-evaluation time — including on `import`, not just on direct `node determinism_baseline.js` invocation. The very first run of the refusal drill (below) printed a full, unrequested `verify()` transcript before the rebase tool's own output, because `import { playSeed, ... }` triggered it as a side effect. Fixed by guarding the dispatch with `if (import.meta.url === \`file://${process.argv[1]}\`)`, confirmed to leave `node scripts/determinism_baseline.js --verify` (and `--capture`) behaviorally identical to before the change for every existing caller (`real_game_test.js`, `dlog_replay_test.js`, direct CLI use).

### Refusal-drill transcript

Corrupted `manifest.perSeed[5]` (seed 12350)'s `sha256` to 64 zeros:

```
$ node scripts/rebase_source_hash.js; echo "exit=$?"
FAIL rebase: refusing to re-base engineSourceHash — the following seed(s) diverged from their frozen hash:
  seed 12350: fresh=7b5a83394c7f83b68d545b11970a5fcdcbffafbf9ffa8889adb37417b987a9f9 want=0000000000000000000000000000000000000000000000000000000000000000

Behaviour changed. The source hash was NOT touched. Fix the code, not the fixture — run
node scripts/determinism_baseline.js --verify for the full divergence report.
exit=1
```

`engineSourceHash` in the working tree confirmed unchanged (still the pre-extraction value) after this run. Restored via `git checkout -- scripts/fixtures/determinism/manifest.json`, then re-ran:

```
$ node scripts/rebase_source_hash.js; echo "exit=$?"
All 30 seed(s) matched their frozen hash on fresh replay — gate passed.
engineSourceHash: 15ad68996befca5130ba11b0cf79d59b0d871956cc11ab961fe32add384d874a
               -> bdc641620a4d28261bdef57cde4ded24174864c1584c78f0eeb16e988508e42e
exit=0
```

That second, clean run performed the real re-base (the plan's own drill sequence — corrupt, confirm refusal, restore, confirm success — naturally lands on the success path as its final step).

### Old and new `engineSourceHash`, side by side

| | value |
|---|---|
| Before (pre-extraction, Phase 7) | `15ad68996befca5130ba11b0cf79d59b0d871956cc11ab961fe32add384d874a` |
| After (post-relocation, this plan) | `bdc641620a4d28261bdef57cde4ded24174864c1584c78f0eeb16e988508e42e` |

Matches the value 08-03-SUMMARY.md had already recorded as the expected target computed by `loadEngine()` at the end of that plan.

### `git show --stat` for the re-base commit

```
$ git show --stat HEAD
commit 23092a5 feat(08-05): re-base engineSourceHash after the Phase 8 engine relocation
 scripts/fixtures/determinism/manifest.json |  2 +-
 scripts/rebase_source_hash.js              | 74 ++++++++++++++++++++++++++++++
 2 files changed, 75 insertions(+), 1 deletion(-)
```

`manifest.json`'s own diff, isolated: `1 file changed, 1 insertion(+), 1 deletion(-)` — the `engineSourceHash` line only. `grep -c '^[+-][^+-]'` on that diff → `2` (one removed, one added). `grep -c sha256` on the diff content → `0` (no `perSeed[]` line touched).

### Post-rebase verification sweep

```
$ node scripts/determinism_baseline.js --verify | tail -3
  SOURCE: unchanged — hashes match and engine source hash matches.

All seeds passed.
exit=0

$ npm test; echo exit=$?
... (determinism oracle 30/30, engine_contract_check 4/4 PASS, dlog_replay_test all cases pass) ...
exit=0

$ node scripts/engine_contract_check.js; echo exit=$?
PASS purity (ENGINE-01)
PASS annotations (ENGINE-04)
PASS DAG direction (SPLIT-01/02)
PASS moved-symbol completeness
exit=0
```

## Task Commits

Each task committed atomically, plus one disclosed refactor commit ahead of the re-base commit:

1. **Task 1: Browser verification** — no commit (verification only, modifies no files; recorded above per the plan's explicit instruction not to re-run it)
2. **Refactor (disclosed touch to the oracle file, ahead of Task 2's re-base commit)** — `5b8c632` (refactor) — exports `MANIFEST_PATH`/`playSeed`/`serializeSeed`/`hashBytes` from `determinism_baseline.js` and adds the entry-point guard that fixes the import-side-effect bug the refusal drill surfaced
3. **Task 2: Re-base engineSourceHash** — `23092a5` (feat) — `scripts/rebase_source_hash.js` + the one-line `manifest.json` change, amended once (before anything built on top of it) to reword the commit message away from the literal substring "sha256" so acceptance criterion 5's literal grep passes, not just its substantive intent

**Plan metadata:** committed alongside this summary (see final commit below).

## Files Created/Modified

- `scripts/rebase_source_hash.js` — new, 74 lines. No flags. Gate (replay every seed fresh, compare to frozen `perSeed[].sha256`, abort non-zero naming any divergent seed) runs before the write (mutate `engineSourceHash` only, on the parsed object, write back with the same serialization `capture()` uses). Contains no code path invoking `capture()` or spawning `determinism_baseline.js --capture`; the literal string "capture" appears only in explanatory prose and one error message.
- `scripts/determinism_baseline.js` — `MANIFEST_PATH`, `playSeed`, `serializeSeed`, `hashBytes` changed from module-private to `export`ed (no logic change); bottom-of-file `capture()`/`verify()` dispatch guarded to run only when the file is the entry point (fixes the import-side-effect bug).
- `scripts/fixtures/determinism/manifest.json` — one line changed: `engineSourceHash` re-based to the post-relocation value. `perSeed`, `capturedAt`, `coverage`, `formatVersion`, `seedBase`, `seedCount`, `botStrategies`, `seatRotation`, `requiredEventTypes` all byte-identical (mechanically guaranteed by mutating the single field on the already-parsed object rather than rebuilding the manifest).

## Decisions Made

See `key-decisions` in frontmatter for the three load-bearing decisions from this plan: the disclosed, separately-committed factoring of the oracle file; the import-side-effect bug found and fixed by the refusal drill itself; and the one-time commit-message amendment (before anything built on the commit) to make acceptance criterion 5 pass literally rather than only in substance.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `determinism_baseline.js`'s top-level dispatch ran on import, not just on direct invocation**
- **Found during:** Task 2, first run of the refusal drill (immediately after writing `rebase_source_hash.js` and exporting the shared helpers)
- **Issue:** `import { playSeed, serializeSeed, hashBytes, MANIFEST_PATH } from "./determinism_baseline.js"` also executed the file's bottom-of-file `if (mode === "capture") { await capture(); } else { await verify(); }` as a side effect of the import itself, because `mode` defaults to `"verify"` whenever `process.argv[2]` is not `"--capture"` — true for any importing script that isn't itself invoked with that flag. This printed a full, unrequested `verify()` transcript ahead of the rebase tool's own output on every run.
- **Fix:** Guarded the dispatch with `if (import.meta.url === \`file://${process.argv[1]}\`)`, so it only fires when `determinism_baseline.js` is the actual entry point.
- **Files modified:** `scripts/determinism_baseline.js`
- **Verified:** Re-ran `node scripts/determinism_baseline.js --verify` directly (unchanged behavior, 30/30 PASS) and `node scripts/determinism_baseline.js --capture`'s guard logic by inspection (same `if/else` body, now reachable only at the entry point); re-ran the refusal drill — clean single-tool output, no unrequested `verify()` transcript.
- **Commit:** `5b8c632` (folded into the disclosed refactor commit — caught during the same drill session, before any commit landed)

**2. [Rule 1 - Bug] Re-base commit message's own prose broke acceptance criterion 5's literal grep**
- **Found during:** Task 2, running the plan's own acceptance-criteria sweep against the just-created re-base commit
- **Issue:** The commit message's first draft explained what the tool does *not* touch using the literal word "sha256" twice in prose ("frozen manifest.perSeed[].sha256", "Per-seed sha256 values are untouched"). `git show HEAD -- manifest.json` includes the full commit message, so criterion 5's `grep -c 'sha256'` counted those two prose occurrences and returned `2` instead of the required `0` — even though the actual `manifest.json` diff content was already clean (`git diff HEAD~1 HEAD -- manifest.json | grep -c sha256` → `0`, both before and after the fix).
- **Fix:** Amended the commit message (nothing had been built on top of it yet) to reword the two occurrences to "per-seed content hashes" — same meaning, no literal substring match.
- **Files modified:** none (commit-message-only correction)
- **Verified:** Re-ran `git show HEAD -- scripts/fixtures/determinism/manifest.json | grep -c 'sha256'` → `0`; re-ran the full acceptance-criteria sweep — all 16 criteria pass.
- **Commit:** `23092a5` (the re-base commit itself, amended once before this SUMMARY was written)

### Rule 4 items

None — no architectural changes were needed. Both discoveries were bugs surfaced by this plan's own mandated red-proof process (the refusal drill) and its own acceptance-criteria sweep, not gaps in the Phase 8 code this plan verifies.

## Known Stubs

None. This plan produces tooling (a gated re-base script) and a one-field fixture change plus a minimal, disclosed refactor of an existing oracle file — no new UI surface, no hardcoded empty values, no placeholder text.

## Issues Encountered

None beyond the two bugs caught and fixed by this plan's own red-proof/acceptance-sweep process (see Deviations above) — both found and fixed before any commit was left in a state that would mislead a later reader.

## User Setup Required

None — no external service configuration required. Zero dependencies added; `package.json` untouched by this plan.

## Next Phase Readiness

- Phase 8 closes with `ENGINE-03` proven two ways: byte-for-byte across the frozen 30-seed corpus in Node (`--verify` green, `SOURCE: unchanged`), and behaviourally in a real browser on the live turn loop the corpus structurally cannot reach (Task 1's forced-storm second-gust transcript).
- The oracle's integrity is provable from git history alone, exactly as D-01/D-02 require: the 30 `.jsonl` corpus files have exactly one commit across their entire history; `manifest.json` has exactly two (Phase 7's capture, this plan's re-base); `--capture` was never invoked anywhere in this plan.
- `scripts/rebase_source_hash.js` is now a standing, reusable tool — any future phase that genuinely relocates engine source again (none currently planned) has a safe, gated path to re-base the hash without touching `--capture`.
- Safari re-verification is deliberately deferred to Phases 11 and 12 per D-18 — no human Safari checkpoint was created here.
- No blockers. Phase 8 (Engine Extraction & Node Harness Migration) is complete.

## Self-Check: PASSED

- `scripts/rebase_source_hash.js` — FOUND, confirmed via `node scripts/rebase_source_hash.js` (exit 0) and `git log --oneline --all | grep 23092a5` (found, contains the file)
- `scripts/determinism_baseline.js` exports — FOUND, confirmed via `grep -q 'export function playSeed' scripts/determinism_baseline.js` and direct invocation unchanged
- `scripts/fixtures/determinism/manifest.json` — engineSourceHash confirmed re-based via `node -e "..."` check (exit 0, value differs from pre-extraction hash, matches 64-hex-char format, `perSeed.length === 30`, `coverage`/`capturedAt` present)
- Commit `5b8c632` — FOUND in `git log --oneline --all`
- Commit `23092a5` — FOUND in `git log --oneline --all`, contains exactly `scripts/fixtures/determinism/manifest.json` and `scripts/rebase_source_hash.js`
- `git status --porcelain` — clean

---
*Phase: 08-engine-extraction-node-harness-migration*
*Completed: 2026-07-24*
