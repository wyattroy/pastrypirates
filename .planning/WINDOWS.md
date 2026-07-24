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
    "description": "09-03 Task 3 human-check (window.__pp_module_ok / window.__pp_boot_count on a loaded page) not run — no browser-automation tool available in the executor session",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-07-24T18:29:31.107Z",
    "resolved_at": null
  }
]
````
