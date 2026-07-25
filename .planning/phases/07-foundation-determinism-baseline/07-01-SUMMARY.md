---
phase: 07-foundation-determinism-baseline
plan: 01
subsystem: testing
tags: [node, esm, vm, sha256, determinism, fixtures, ci]

# Dependency graph
requires: []
provides:
  - "Root package.json with type:module, private:true, zero dependencies (start/test/test:determinism scripts)"
  - "scripts/lib/load_engine.js — single async vm+string-slice extraction seam for Game/roundCfg, returns {Game, roundCfg, sourceHash}"
  - "scripts/determinism_baseline.js --capture/--verify — the determinism regression oracle"
  - "Committed 30-seed golden corpus at scripts/fixtures/determinism/ (seed-12345.jsonl..seed-12374.jsonl + manifest.json)"
  - "scripts/real_game_test.js and scripts/dlog_replay_test.js converted to native ESM, routed through loadEngine()"
affects: [08-engine-extraction, 09-ui-module-split, 10-globals-deglobalization, 11-networking-module-split, 12-final-validation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Single async extraction seam (load_engine.js) that every Node harness routes through — Phase 8 replaces its body with a native import and no caller changes"
    - "--verify never diffs manifest.json as a file; it compares per-seed SHA-256 hashes only, with capturedAt excluded from any comparison"
    - "Final-state snapshot lives as the seed file's last JSONL line (t:\"__final__\") so it participates in the same per-seed hash instead of a second comparison mechanism"

key-files:
  created:
    - package.json
    - scripts/lib/load_engine.js
    - scripts/determinism_baseline.js
    - scripts/fixtures/determinism/manifest.json
    - scripts/fixtures/determinism/seed-12345.jsonl (through seed-12374.jsonl, 30 files)
  modified:
    - scripts/real_game_test.js
    - scripts/dlog_replay_test.js
    - .gitignore

key-decisions:
  - "Comparison-1 (stored-file hash) and comparison-2 (fresh-replay hash) both always run in --verify, rather than short-circuiting on comparison-1 failure — needed so the D-10 divergence report still locates and names a seed even when only the manifest's recorded hash was corrupted, not the underlying fixture content."
  - "When a --verify failure's stored and fresh content are byte-identical (manifest-only corruption), the divergence report explicitly says so with event index -1, rather than fabricating a misleading line index."

patterns-established:
  - "Loud-failure-on-drift convention preserved verbatim from the harnesses being consolidated (same two guard conditions, same error messages) in load_engine.js"
  - "SOURCE classification in --verify output: unchanged / moved-behavior-identical / behavior-changed — diagnostic only, never gates exit code (D-11)"

requirements-completed: [FOUND-01, FOUND-04]

coverage:
  - id: D1
    description: "Root package.json declares type:module, private:true, three scripts (start/test/test:determinism), and no dependency keys"
    requirement: "FOUND-01"
    verification:
      - kind: unit
        ref: "node -e 'require(\"./package.json\")' field assertions (type/private/no deps/scripts present)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Both existing harnesses (real_game_test.js, dlog_replay_test.js) run under ESM in the same commit as package.json, obtaining the engine through scripts/lib/load_engine.js"
    requirement: "FOUND-01"
    verification:
      - kind: integration
        ref: "node scripts/dlog_replay_test.js (exit 0, 'All cases passed.')"
        status: pass
      - kind: integration
        ref: "node scripts/real_game_test.js 25 (exit 0)"
        status: pass
    human_judgment: false
  - id: D3
    description: "30-seed golden corpus (12345-12374) captured from an index.html byte-identical to main and committed, with coverage assertion over 12 required event types and a non-empty __final__-terminated event log per seed"
    requirement: "FOUND-04"
    verification:
      - kind: integration
        ref: "node scripts/determinism_baseline.js --capture && node scripts/determinism_baseline.js --verify (30/30 PASS)"
        status: pass
      - kind: unit
        ref: "manifest.json coverage map covers all 12 required event types (battle, battleflee, trade, dock, fish, windmove, tradewind, shipwrecked, aground, end, bakeoff, finish)"
        status: pass
    human_judgment: false
  - id: D4
    description: "--verify's failure path is demonstrated, not assumed: corrupting a manifest perSeed[].sha256 makes --verify exit 1 and name the seed with a first-divergent-event index; restoring makes it exit 0 again"
    requirement: "FOUND-04"
    verification:
      - kind: integration
        ref: "manual red-proof drill, both pre-widening (seed 12345) and post-widening (seed 12352, perSeed[7])"
        status: pass
    human_judgment: false

# Metrics
duration: ~15min
completed: 2026-07-24
status: complete
---

# Phase 7 Plan 1: Determinism Oracle & Node Module Contract Summary

**30-seed golden-fixture corpus (7,214 events, 2.89 MiB) plus a `--capture`/`--verify` regression oracle in native ESM, with the failure path proven, not assumed — `index.html` untouched throughout.**

## Performance

- **Duration:** ~15 min active execution (plus a tracer feedback-gate pause for human verification)
- **Started:** 2026-07-24T06:37:00Z
- **Completed:** 2026-07-24T06:46:55Z
- **Tasks:** 2 (Task 1 tracer + Task 2 widening)
- **Files modified:** 36 (5 code files, 1 `.gitignore`, 30 fixture files)

## Accomplishments

- Root `package.json` added with `"type": "module"`, `"private": true`, zero dependency keys, and `start`/`test`/`test:determinism` scripts (FOUND-01, D-19/D-20)
- `scripts/lib/load_engine.js` — the single indirection seam (D-12) that both existing harnesses and the new oracle route through to obtain `{ Game, roundCfg, sourceHash }`, replacing two independent copies of the same `vm`+string-slice extraction logic
- `scripts/real_game_test.js` and `scripts/dlog_replay_test.js` converted from CommonJS to native ESM in the *same commit* as `package.json`, so the test suite is never broken (RESEARCH.md Pitfall 1)
- `scripts/determinism_baseline.js` — the determinism regression oracle, built as a tracer (1 seed) then widened to the locked 30-seed range (D-03), with a coverage assertion (D-04), a `__final__` state line per seed (D-05), a divergence report (D-10), and a diagnostic-only engine-source-hash classification (D-11)
- A committed 30-seed golden corpus (`seed-12345.jsonl` … `seed-12374.jsonl` + `manifest.json`) under `scripts/fixtures/determinism/`, verified idempotent (`--capture` run twice produces byte-identical files) and verified to fail loudly when tampered with (twice — before and after widening)

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end determinism oracle on one seed — capture, verify, and prove it goes red** - `79b8e8b` (feat)
2. **Task 2: Widen the oracle to the locked 30-seed corpus with coverage assertion and divergence reporting** - `fc7e7b7` (feat)

_Task 1 is a `type="tracer"` task; per the executor's tracer feedback gate, execution paused for human verification of the tracer's `<verify>` block before Task 2 began (auto-advance was off in this project's config). The coordinator independently re-ran the automation and confirmed all claims before authorizing Task 2._

## Files Created/Modified

- `package.json` - root config, `type: module`, zero deps, three npm scripts
- `scripts/lib/load_engine.js` - shared engine-extraction seam, computes `sourceHash` (D-11)
- `scripts/determinism_baseline.js` - `--capture`/`--verify` CLI tool, the oracle itself
- `scripts/real_game_test.js` - CJS → ESM, now calls `loadEngine()`
- `scripts/dlog_replay_test.js` - CJS → ESM for the engine region via `loadEngine()`; `replayShortfall` sentinel extraction (its own separate region) is untouched
- `.gitignore` - added defensive `node_modules/` entry
- `scripts/fixtures/determinism/manifest.json` - seed list, per-seed SHA-256, coverage map, `engineSourceHash`
- `scripts/fixtures/determinism/seed-12345.jsonl` … `seed-12374.jsonl` (30 files) - one committed event log per seed, each ending in a `__final__` state line

## Decisions Made

- **Comparison ordering in `--verify` (Claude's Discretion within D-09/D-10):** the plan's Pitfall 3 guidance ("hash the stored bytes first, then replay fresh") would, if implemented as two sequential early-return checks, cause the D-10 divergence report to never fire when only the *manifest's recorded hash* is corrupted (as in the red-proof drill) rather than the underlying fixture content. Restructured so both comparisons always run per seed, and the divergence walk fires on either failure — printing a real line-level divergence when content actually differs, or an explicit "manifest is stale, not the content" message with an index of `-1` when the stored file and fresh replay agree with each other but not with the manifest's claim. This was necessary to satisfy Task 2's acceptance criterion that the divergence report "fires" (names the seed, prints an index) on the exact same corruption drill used in Task 1.
- **Engine source hash exact behavior confirmed via the widened corpus:** `engineSourceHash = 15ad68996befca5130ba11b0cf79d59b0d871956cc11ab961fe32add384d874a` (hex SHA-256 over the raw extracted engine region, computed before the `this.Game=...` export suffix is appended). Recorded here so Phase 8 can compare against it once the engine relocates — SOURCE classification should read "moved, behavior identical" at that point, not "behavior changed".

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Divergence report needed to run on both comparison paths, not just the fresh-replay path**
- **Found during:** Task 2 (post-widening red-proof drill)
- **Issue:** As initially implemented (mirroring Task 1's structure), `--verify` short-circuited on a stored-file-hash mismatch before reaching the divergence-walk logic. The Task 2 acceptance criteria require the divergence report ("names the seed and prints a first-divergent-event index") to fire on the *same* corrupt-`sha256` drill used in Task 1 — which corrupts only the manifest's recorded value, not the stored file, so it was hitting the early-return path and never reaching the walk.
- **Fix:** Restructured `verify()` to always run both the stored-hash comparison and the fresh-replay comparison per seed (instead of early-returning after comparison 1), and to run the divergence walk whenever either comparison fails. When stored and fresh content agree with each other but not with the manifest (the manifest-only-corruption case), the walk reports index `-1` with an explicit explanation rather than fabricating a misleading line number.
- **Files modified:** `scripts/determinism_baseline.js`
- **Verification:** Re-ran the exact drill from Task 2's acceptance criteria (corrupt `perSeed[7].sha256` → 64 zeros) — `--verify` exits 1, names seed `12352`, prints `DIVERGENCE — first mismatch at seed 12352, event index -1 (...)`. Restored via `git checkout -- scripts/fixtures/determinism/manifest.json`, `--verify` exits 0 again.
- **Committed in:** `fc7e7b7` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (blocking)
**Impact on plan:** The fix was required to satisfy Task 2's own acceptance criteria; no scope creep. All other behavior matches the plan exactly.

## Issues Encountered

- **macOS `wc -l` output padding breaks the plan's exact `<verify>` command.** Both tasks' `<verify><automated>` blocks end with `git status --porcelain index.html | wc -l | grep -qx '0'`. On this machine's macOS `wc` (BSD `wc`, not GNU), `wc -l` right-pads its count with leading whitespace (e.g. `       0` instead of `0`), so `grep -qx '0'` never matches even when the file genuinely has zero changes. Worked around locally by piping through `tr -d ' '` before the `grep -qx` check (`... | wc -l | tr -d ' ' | grep -qx '0' ...`) — this is an environment quirk in the verification *command itself*, not a defect in any committed code, and every actual check (`git status --porcelain index.html` producing empty output, `git diff --stat main -- index.html` producing empty output) confirmed `index.html` was untouched throughout both tasks. **Recorded here so Phase 8-12, which inherit this same gate pattern, don't rediscover it independently** — prefer `wc -l | tr -d ' ' | grep -qx 'N'` (or `[ "$(... | wc -l)" -eq N ]`) over a bare `wc -l | grep -qx` on macOS.

## User Setup Required

None - no external service configuration required. Zero dependencies, zero package-manager installs (confirmed via `package.json` having neither `dependencies` nor `devDependencies` keys).

## Measured Corpus Data (for Phase 8+)

- **On-disk corpus size:** 30 `.jsonl` files totalling 3,025,316 bytes (2.89 MiB) + `manifest.json` (6,168 bytes). Matches RESEARCH.md's own measured prediction (~2.87 MiB) almost exactly — roughly 3x D-03's original "~1 MB" rationale. The seed count stays locked at 30 per D-03; only the size estimate in the original rationale was optimistic. Every event carries a full four-player `state` array and a `tokens` snapshot (`Game.ev()`, `index.html:1257-1259`), which is inherent to D-01's "full event log, not aggregate statistics" requirement and cannot be trimmed without changing the fixture format.
- **Total events across all 30 seeds:** 7,214 (matches RESEARCH.md's independently measured figure exactly).
- **Per-type coverage counts (from `manifest.json`):**

  | Event type | Count | Event type | Count |
  |---|---|---|---|
  | `turn` | 2284 | `dock` | 766 |
  | `sail` | 1634 | `windmove` | 145 |
  | `fish` | 1288 | `moored` | 77 |
  | `newround` | 560 | `trade` | 75 |
  | `blownOut` | 68 | `tradewind` | 43 |
  | `battle` | 131 | `finish` | 34 |
  | `blocked` | 25 | `end` | 30 |
  | `battleflee` | 23 | `dodge` | 20 |
  | `bakeoff` | 4 | `anchor` | 3 |
  | `aground` | 3 | `shipwrecked` | 1 |

  All 12 required types (per D-04's mapping: `battle`/`battleflee` for battle, `trade`, `dock`, `fish`, `windmove`/`tradewind`/`shipwrecked` for storm-and-wind, `aground` for run-aground, `end`/`bakeoff`/`finish` for endgame) are present. Three are deliberately thin — `shipwrecked` (1), `aground` (3), `anchor` (3) — because those mechanics are rare, not because the corpus under-covers them; per the plan's own flagged assumption, this is a finding to surface, not a list to edit.

- **`engineSourceHash`:** `15ad68996befca5130ba11b0cf79d59b0d871956cc11ab961fe32add384d874a` — hex SHA-256 of the raw extracted engine region (`index.html:859` through `function escHtml` at `index.html:1827`), computed before the `this.Game=Game;this.roundCfg=roundCfg;` export suffix is appended. Phase 8 should expect `--verify`'s SOURCE line to read "moved, behavior identical" (not "unchanged") the moment the engine source physically relocates, and "behavior changed" only if actual game logic diverges.

- **Exact red-proof commands used** (run twice — once against the Task 1 tracer's single-seed corpus, once against the widened 30-seed corpus):

  ```bash
  # Backup
  cp scripts/fixtures/determinism/manifest.json /tmp/pp-manifest.bak

  # Corrupt one seed's recorded hash (index 0 for the tracer, index 7 for the widened corpus)
  node --input-type=module -e "
    import fs from 'node:fs';
    const p='scripts/fixtures/determinism/manifest.json';
    const m=JSON.parse(fs.readFileSync(p,'utf8'));
    m.perSeed[<INDEX>].sha256='0'.repeat(64);
    fs.writeFileSync(p, JSON.stringify(m,null,2)+'\n');
  "

  # Confirm the failure path
  node scripts/determinism_baseline.js --verify; echo "exit=$?"
  # -> exit=1, names the corrupted seed, prints a first-divergent-event index

  # Restore and confirm green
  cp /tmp/pp-manifest.bak scripts/fixtures/determinism/manifest.json   # (tracer run)
  # or: git checkout -- scripts/fixtures/determinism/manifest.json     # (widened-corpus run, once staged)
  node scripts/determinism_baseline.js --verify; echo "exit=$?"
  # -> exit=0
  ```

## Next Phase Readiness

- Phase 8 (engine extraction) has everything it needs: `load_engine.js`'s body is the one place its diff needs to touch (D-12), the committed 30-seed corpus is the regression oracle to diff against, and `engineSourceHash` is recorded above as the pre-extraction baseline to compare post-extraction values against (expect "moved, behavior identical", not "unchanged").
- `index.html` remains byte-identical to `main` — confirmed via `git diff --stat main -- index.html` (empty) after both task commits. Plan 07-02 (which edits `index.html` to add the module `<script>` tag) can proceed against this exact, unmodified baseline.
- No blockers. The `--verify` failure path has been demonstrated twice (pre- and post-widening), not merely assumed — later phases inherit a genuinely tested oracle.

## Self-Check: PASSED

All created files verified present on disk (`package.json`, `scripts/lib/load_engine.js`, `scripts/determinism_baseline.js`, `scripts/fixtures/determinism/manifest.json`, `scripts/fixtures/determinism/seed-12345.jsonl`, `scripts/fixtures/determinism/seed-12374.jsonl`, this SUMMARY.md). All claimed commits verified present in `git log --oneline --all` (`79b8e8b`, `fc7e7b7`, `b40c884`).

---
*Phase: 07-foundation-determinism-baseline*
*Completed: 2026-07-24*
