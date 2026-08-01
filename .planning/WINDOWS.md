---
schema_version: 1
open_count: 1
waived_count: 0
fixed_count: 2
total_count: 3
last_updated: 2026-08-01T04:01:09.551Z
---

# Broken Windows Ledger

> Cross-phase defect register. `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 09 | unrun-verify | index.html |  | 09-03 Task 3 human-check (window.__pp_module_ok / window.__pp_boot_count on a loaded page) not run — no browser-automation tool available in the executor session | fixed | Coordinator ran the load-time tripwire check in Chrome (cache-busted): window.__pp_module_ok=true, window.__pp_boot_count=1, typeof firebase='object', 55 net fns on the bridge, netInit/netWatchFlip resolve as bare identifiers, lobby renders, console clean. index.html boots correctly with its entire Firebase surface relocated to src/net/. | 2026-07-24T18:29:31.107Z | 2026-07-24T18:45:00.000Z |
| 2 | 09 | unmet-truth | index.html |  | ROADMAP Phase 9 criterion 4 (two-tab multiplayer sync) only partially demonstrated in 09-05: bidirectional lobby-state/seats sync proven across two real tabs with distinct identities, but the full in-game turn-propagation leg (narr/ev/prompt/flip/battle watchers observed live host->guest) was not cleanly completed — the coordinator's own defensive UI click during voyage start misrouted the host tab into pass-and-play mode. Not a code regression; a test-driving artifact. Needs a clean re-run before criterion 4 is fully satisfied — closed by Phase 12 VERIFY-03 (Chrome-MCP two-tab E2E). | fixed | Clean two-tab re-run completed by coordinator in Chrome (server :8777, distinct pp_id per tab, sequential load per the shared-localStorage gotcha). Proven live host<->guest through the extracted src/net/ module: room create/join round-trip (seats watcher), bidirectional lobby sync, game-start broadcast + board render on guest, sailing-order narration broadcast, chat host->guest with a unique marker (chat child_added watcher), acknowledgement + recipe prompt/response gating synced both ways, full turn loop cycling host->bots->guest (ev event stream climbing 16->29), guest move -> host turn advanced (response watcher), and host move -> guest CAPTAINS panel synced. Same-moment authoritative-state match host vs guest: HostCap 1/1, Dough Hook 7/7, Flaky Jack 13/13, GuestMate 0/0. Watcher counts scaled 4 (lobby) -> 8 (host in-game) -> 16 (guest in-game) via window.__pp_net_debug. NOTE: reading game.players[].pos on the GUEST is the wrong probe — guests are render-only (host-authority model), so their local game object is intentionally stale; the rendered CAPTAINS panel is the sync source of truth. Criterion 4 fully satisfied. | 2026-07-24T18:55:19.013Z | 2026-07-24T20:29:14.093Z |
| 3 | 19 | deviation | scripts/narration_audit_check.js | 1214 | npm test is red pre-existing: narration_audit_check.js reads .planning/phases/15-narration-audit-fixes/15-DISPOSITIONS-FINAL.json, but that file was relocated to .planning/milestones/v1.2-phases/15-narration-audit-fixes/ by the v1.2 milestone archive commit; the hardcoded path was never updated. Blocks 19-02 Task 2's precondition (npm test green before wiring in the new guard). | open |  | 2026-08-01T04:01:09.551Z |  |

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
    "status": "fixed",
    "reason": "Clean two-tab re-run completed by coordinator in Chrome (server :8777, distinct pp_id per tab, sequential load per the shared-localStorage gotcha). Proven live host<->guest through the extracted src/net/ module: room create/join round-trip (seats watcher), bidirectional lobby sync, game-start broadcast + board render on guest, sailing-order narration broadcast, chat host->guest with a unique marker (chat child_added watcher), acknowledgement + recipe prompt/response gating synced both ways, full turn loop cycling host->bots->guest (ev event stream climbing 16->29), guest move -> host turn advanced (response watcher), and host move -> guest CAPTAINS panel synced. Same-moment authoritative-state match host vs guest: HostCap 1/1, Dough Hook 7/7, Flaky Jack 13/13, GuestMate 0/0. Watcher counts scaled 4 (lobby) -> 8 (host in-game) -> 16 (guest in-game) via window.__pp_net_debug. NOTE: reading game.players[].pos on the GUEST is the wrong probe — guests are render-only (host-authority model), so their local game object is intentionally stale; the rendered CAPTAINS panel is the sync source of truth. Criterion 4 fully satisfied.",
    "recorded_at": "2026-07-24T18:55:19.013Z",
    "resolved_at": "2026-07-24T20:29:14.093Z"
  },
  {
    "id": 3,
    "kind": "deviation",
    "phase": "19",
    "file": "scripts/narration_audit_check.js",
    "line": 1214,
    "description": "npm test is red pre-existing: narration_audit_check.js reads .planning/phases/15-narration-audit-fixes/15-DISPOSITIONS-FINAL.json, but that file was relocated to .planning/milestones/v1.2-phases/15-narration-audit-fixes/ by the v1.2 milestone archive commit; the hardcoded path was never updated. Blocks 19-02 Task 2's precondition (npm test green before wiring in the new guard).",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T04:01:09.551Z",
    "resolved_at": null
  }
]
````
