# Deferred Items — Phase 21 (sound-clock)

Out-of-scope discoveries logged per the executor's SCOPE BOUNDARY rule — not fixed, only recorded.

## 1. `npm test`'s last script (`scripts/narration_audit_check.js`) fails — pre-existing, unrelated to 21-01

**Found during:** 21-01 Task 1's `npm test` verification step.

**What's broken:** `scripts/narration_audit_check.js:1214` reads
`.planning/phases/15-narration-audit-fixes/15-DISPOSITIONS-FINAL.json`, which no longer exists at
that path. The milestone-archival commit `d5189c2` ("docs: start milestone v1.3 The Game Comes
Alive") moved that whole directory to
`.planning/milestones/v1.2-phases/15-narration-audit-fixes/15-DISPOSITIONS-FINAL.json` — a plain
`git log` confirms the file's last touch under the old path predates this phase's worktree by
several commits, and the archival commit landed before any 21-01 work began. `scripts/ui_contract_check.js`
and `scripts/narration_test.js` have stale comments referencing the same old path (comments only,
not live code, so they don't throw).

**Why it's out of scope for 21-01:** this plan touches `src/shared/audio.js`, `src/ui/board.js`,
and `src/orchestrator.js`'s flip/unlock seams only. It has no relationship to the narration-audit
tooling or the v1.2 milestone archive. The break was introduced by the archival commit, not by
this plan's changes.

**Verified NOT caused by 21-01's changes:** the failure is a path-resolution `ENOENT`, not a
content assertion — it throws identically regardless of anything under `src/`. The two checks
21-01's own hard constraints actually depend on — the determinism gate
(`scripts/determinism_baseline.js --verify`, script #1 in the chain) and
`scripts/module_graph_check.js` (script #7) — both ran and passed cleanly before this failure is
reached later in the `&&`-chain.

**Recommended fix (not applied here, out of scope):** update the hardcoded path in
`scripts/narration_audit_check.js` (and the two stale comments) from
`.planning/phases/15-narration-audit-fixes/` to `.planning/milestones/v1.2-phases/15-narration-audit-fixes/`.

**Impact on this plan:** `npm test`'s bare exit code is 1 because of this one pre-existing,
unrelated script — NOT because of anything 21-01 introduced. Every other script in the chain,
including the two 21-01's own hard constraints depend on, passes. See 21-01-SUMMARY.md's
Self-Check section for the itemized per-script confirmation.
