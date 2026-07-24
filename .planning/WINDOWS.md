---
schema_version: 1
open_count: 1
waived_count: 0
fixed_count: 1
total_count: 2
last_updated: 2026-07-24T18:55:19.013Z
---

# Broken Windows Ledger

> Cross-phase defect register. `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 09 | unrun-verify | index.html |  | 09-03 Task 3 human-check (window.__pp_module_ok / window.__pp_boot_count on a loaded page) not run — no browser-automation tool available in the executor session | fixed | Coordinator ran the load-time tripwire check in Chrome (cache-busted): window.__pp_module_ok=true, window.__pp_boot_count=1, typeof firebase='object', 55 net fns on the bridge, netInit/netWatchFlip resolve as bare identifiers, lobby renders, console clean. index.html boots correctly with its entire Firebase surface relocated to src/net/. | 2026-07-24T18:29:31.107Z | 2026-07-24T18:45:00.000Z |
| 2 | 09 | unmet-truth | index.html |  | ROADMAP Phase 9 criterion 4 (two-tab multiplayer sync) only partially demonstrated in 09-05: bidirectional lobby-state/seats sync proven across two real tabs with distinct identities, but the full in-game turn-propagation leg (narr/ev/prompt/flip/battle watchers observed live host->guest) was not cleanly completed — the coordinator's own defensive UI click during voyage start misrouted the host tab into pass-and-play mode. Not a code regression; a test-driving artifact. Needs a clean re-run before criterion 4 is fully satisfied — closed by Phase 12 VERIFY-03 (Chrome-MCP two-tab E2E). | open |  | 2026-07-24T18:55:19.013Z |  |

````json
[
  {
    "id": 1,
    "kind": "unrun-verify",
    "phase": "09",
    "file": "index.html",
    "line": null,
    "description": "09-03 Task 3 human-check (window.__pp_module_ok / window.__pp_boot_count on a loaded page) not run — no browser-automation tool available in the executor session",
    "status": "fixed",
    "reason": "Coordinator ran the load-time tripwire check in Chrome (cache-busted): window.__pp_module_ok=true, window.__pp_boot_count=1, typeof firebase='object', 55 net fns on the bridge, netInit/netWatchFlip resolve as bare identifiers, lobby renders, console clean. index.html boots correctly with its entire Firebase surface relocated to src/net/.",
    "recorded_at": "2026-07-24T18:29:31.107Z",
    "resolved_at": "2026-07-24T18:45:00.000Z"
  },
  {
    "id": 2,
    "kind": "unmet-truth",
    "phase": "09",
    "file": "index.html",
    "line": null,
    "description": "ROADMAP Phase 9 criterion 4 (two-tab multiplayer sync) only partially demonstrated in 09-05: bidirectional lobby-state/seats sync proven across two real tabs with distinct identities, but the full in-game turn-propagation leg (narr/ev/prompt/flip/battle watchers observed live host->guest) was not cleanly completed — the coordinator's own defensive UI click during voyage start misrouted the host tab into pass-and-play mode. Not a code regression; a test-driving artifact. Needs a clean re-run before criterion 4 is fully satisfied — closed by Phase 12 VERIFY-03 (Chrome-MCP two-tab E2E).",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-24T18:55:19.013Z",
    "resolved_at": null
  }
]
````
