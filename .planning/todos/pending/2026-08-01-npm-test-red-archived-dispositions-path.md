---
created: 2026-08-01T04:35:00.000Z
title: npm test is red — narration audit reads a dispositions file that was archived
area: tooling
severity: major
files:
  - scripts/lib/audit_page_headless.mjs (reads .planning/phases/15-narration-audit-fixes/15-DISPOSITIONS-FINAL.json)
  - scripts/narration_audit_check.js (assertion 10 — the failing one)
  - .planning/milestones/v1.2-phases/ (where the file actually lives now)
---

## Problem

**`npm test` exits 1 on a clean tree, and has nothing to do with whatever you're working on.**

`scripts/lib/audit_page_headless.mjs` reads
`.planning/phases/15-narration-audit-fixes/15-DISPOSITIONS-FINAL.json`. That path no longer
exists — the v1.2 phase directories were archived into `.planning/milestones/v1.2-phases/`
during milestone cleanup, and the script's hard-coded path was never updated. So
`scripts/narration_audit_check.js` fails at assertion 10.

21 of the 22 assertion groups still pass. The failure is a stale path, not a real regression in
narration.

Found during Phase 22 planning (2026-08-01). It matters beyond the noise: **a permanently-red
`npm test` means no plan can honestly use "`npm test` exits 0" as an acceptance criterion.**
Phase 22's five plans had to work around it by gating on a named subset instead
(`no_undef_check`, `module_graph_check`, `ui_contract_check`, `state_contract_check`,
`determinism_baseline --verify`). Every future phase inherits that workaround until this is fixed,
and a red baseline is exactly the condition under which a real failure gets waved through.

## Solution

Point the script at the archived location, or better, make it resolve the file rather than
hard-code one path — the same archive move will happen again at the end of every milestone.

Something like: look for `15-DISPOSITIONS-FINAL.json` under `.planning/phases/` first, then fall
back to `.planning/milestones/*/`, and fail with a clear "dispositions file not found in either
location" message rather than an opaque assertion failure.

Worth a quick grep for other scripts with hard-coded `.planning/phases/<v1.2 phase>/` paths — if
one script broke this way, siblings probably did too.

## Verification

`npm test` exits 0 on a clean checkout, with all 22 narration-audit assertion groups passing.
