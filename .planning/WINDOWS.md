---
schema_version: 1
open_count: 1
waived_count: 0
fixed_count: 0
total_count: 1
last_updated: 2026-07-24T18:29:31.107Z
---

# Broken Windows Ledger

> Cross-phase defect register. `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 09 | unrun-verify | index.html |  | 09-03 Task 3 human-check (window.__pp_module_ok / window.__pp_boot_count on a loaded page) not run — no browser-automation tool available in the executor session | open |  | 2026-07-24T18:29:31.107Z |  |

````json
[
  {
    "id": 1,
    "kind": "unrun-verify",
    "phase": "09",
    "file": "index.html",
    "line": null,
    "description": "09-03 Task 3 human-check (window.__pp_module_ok / window.__pp_boot_count on a loaded page) not run \u2014 no browser-automation tool available in the executor session",
    "status": "resolved",
    "reason": "Coordinator ran the load-time tripwire check in Chrome (cache-busted): window.__pp_module_ok=true, window.__pp_boot_count=1, typeof firebase='object', 55 net fns on the bridge, netInit/netWatchFlip resolve as bare identifiers, lobby renders, console clean. index.html boots correctly with its entire Firebase surface relocated to src/net/.",
    "recorded_at": "2026-07-24T18:29:31.107Z",
    "resolved_at": "2026-07-24T18:45:00.000Z"
  }
]
````
