---
schema_version: 1
open_count: 5
waived_count: 0
fixed_count: 3
total_count: 8
last_updated: 2026-08-01T09:16:59.527Z
---

# Broken Windows Ledger

> Cross-phase defect register. `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 09 | unrun-verify | index.html |  | 09-03 Task 3 human-check (window.__pp_module_ok / window.__pp_boot_count on a loaded page) not run — no browser-automation tool available in the executor session | fixed | Coordinator ran the load-time tripwire check in Chrome (cache-busted): window.__pp_module_ok=true, window.__pp_boot_count=1, typeof firebase='object', 55 net fns on the bridge, netInit/netWatchFlip resolve as bare identifiers, lobby renders, console clean. index.html boots correctly with its entire Firebase surface relocated to src/net/. | 2026-07-24T18:29:31.107Z | 2026-07-24T18:45:00.000Z |
| 2 | 09 | unmet-truth | index.html |  | ROADMAP Phase 9 criterion 4 (two-tab multiplayer sync) only partially demonstrated in 09-05: bidirectional lobby-state/seats sync proven across two real tabs with distinct identities, but the full in-game turn-propagation leg (narr/ev/prompt/flip/battle watchers observed live host->guest) was not cleanly completed — the coordinator's own defensive UI click during voyage start misrouted the host tab into pass-and-play mode. Not a code regression; a test-driving artifact. Needs a clean re-run before criterion 4 is fully satisfied — closed by Phase 12 VERIFY-03 (Chrome-MCP two-tab E2E). | fixed | Clean two-tab re-run completed by coordinator in Chrome (server :8777, distinct pp_id per tab, sequential load per the shared-localStorage gotcha). Proven live host<->guest through the extracted src/net/ module: room create/join round-trip (seats watcher), bidirectional lobby sync, game-start broadcast + board render on guest, sailing-order narration broadcast, chat host->guest with a unique marker (chat child_added watcher), acknowledgement + recipe prompt/response gating synced both ways, full turn loop cycling host->bots->guest (ev event stream climbing 16->29), guest move -> host turn advanced (response watcher), and host move -> guest CAPTAINS panel synced. Same-moment authoritative-state match host vs guest: HostCap 1/1, Dough Hook 7/7, Flaky Jack 13/13, GuestMate 0/0. Watcher counts scaled 4 (lobby) -> 8 (host in-game) -> 16 (guest in-game) via window.__pp_net_debug. NOTE: reading game.players[].pos on the GUEST is the wrong probe — guests are render-only (host-authority model), so their local game object is intentionally stale; the rendered CAPTAINS panel is the sync source of truth. Criterion 4 fully satisfied. | 2026-07-24T18:55:19.013Z | 2026-07-24T20:29:14.093Z |
| 3 | 18 | unrun-verify | src/ui/panel.js |  | FIX-16 driven-browser acceptance criteria (ghost first-frame rect, gridTemplateRows floor sweep) not run - no browser-automation tool available to the executor | open | BLOCKED FOR AUTOMATION (coordinator, 2026-08-01): cannot be closed from an MCP browser session. The tab is hidden (document.hidden=true, outerWidth=0), so (a) requestAnimationFrame never fires, which means resizePanel's rAF-debounced re-measure cannot run and the fix physically cannot demonstrate itself, and (b) resize_window reports success but does not move window.innerWidth, so a 320/375/390 sweep is impossible. Verified empirically, not assumed. All three routes exhausted 2026-08-01: resize_window is a no-op (outerWidth=0), Wyatt focusing the tab left document.hidden=true (the extension drives tabs offscreen), and switch_browser reports no alternative browser. Do not retry from an MCP session. Needs Wyatt's own Safari/Chrome; folds into the 18-07 human checkpoint. See docs/DRIVING-THE-GAME.md 8b. | 2026-08-01T04:27:27.970Z |  |
| 4 | 18 | unrun-verify | src/main.js |  | FIX-10 driven-browser acceptance criteria (.apBtn containment at 320/375/390, rotation round-trip) not run - no browser-automation tool available to the executor | open | BLOCKED FOR AUTOMATION (coordinator, 2026-08-01): cannot be closed from an MCP browser session. The tab is hidden (document.hidden=true, outerWidth=0), so (a) requestAnimationFrame never fires, which means resizePanel's rAF-debounced re-measure cannot run and the fix physically cannot demonstrate itself, and (b) resize_window reports success but does not move window.innerWidth, so a 320/375/390 sweep is impossible. Verified empirically, not assumed. All three routes exhausted 2026-08-01: resize_window is a no-op (outerWidth=0), Wyatt focusing the tab left document.hidden=true (the extension drives tabs offscreen), and switch_browser reports no alternative browser. Do not retry from an MCP session. Needs Wyatt's own Safari/Chrome; folds into the 18-07 human checkpoint. See docs/DRIVING-THE-GAME.md 8b. | 2026-08-01T04:27:28.054Z |  |
| 5 | 18 | deviation | scripts/lib/audit_page_headless.mjs |  | npm test narration_audit_check.js assertion 10 fails on a stale pre-v1.2-archive path (15-DISPOSITIONS-FINAL.json); confirmed pre-existing/unrelated to plan 18-01, not fixed (out of scope) | fixed | Coordinator fixed it in a637266, outside the plan. Root cause confirmed as a63e194 (archive v1.2) moving .planning/phases/15-narration-audit-fixes/ to .planning/milestones/v1.2-phases/; art-review/narration-audit.html still fetched the live path so BOTH 15-DISPOSITIONS-FINAL.json and 15-ADDRESSED2-APPROVED.json 404'd. Pre-existence proven by reproducing the identical failure at f07a474 in a detached worktree. This also silently broke Wyatt's live narration review page (zero cards rendered), not just CI. Page and checker now try the live phase dir then fall back to the v1.2 archive. npm test: 23/23 groups, exit 0. | 2026-08-01T04:27:28.139Z | 2026-08-01T04:40:00.000Z |
| 6 | 18 | unrun-verify | src/ui/util.js |  | 18-05 Task 1 human-check unrun: driven-Chrome sampling of shotClockSeat/shotClockForce from prompt render to 1s after buttons appear — browser verification disallowed this session (see PLAN.md's <environment>). | open |  | 2026-08-01T09:16:59.347Z |  |
| 7 | 18 | unrun-verify | src/ui/panel.js |  | 18-05 Task 2 human-check unrun: driven-Chrome sampling of #shotClockNum/#scLabel text content across the reveal window, host and guest — browser verification disallowed this session (see PLAN.md's <environment>). | open |  | 2026-08-01T09:16:59.437Z |  |
| 8 | 18 | deviation | src/ui/panel.js |  | 18-05 known display gap: appState.clockPendingSeat is only set on the browser rendering the actual button row, so HOST/spectator screens fall back to the pre-existing idle dash (not the new frozen display) during a REMOTE decision's reveal window until the deferred arm fires — never shortens anyone's 30s window, cosmetic only. Flagged for 18-07's checkpoint. | open |  | 2026-08-01T09:16:59.527Z |  |

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
    "kind": "unrun-verify",
    "phase": "18",
    "file": "src/ui/panel.js",
    "line": null,
    "description": "FIX-16 driven-browser acceptance criteria (ghost first-frame rect, gridTemplateRows floor sweep) not run - no browser-automation tool available to the executor",
    "status": "open",
    "reason": "BLOCKED FOR AUTOMATION (coordinator, 2026-08-01): cannot be closed from an MCP browser session. The tab is hidden (document.hidden=true, outerWidth=0), so (a) requestAnimationFrame never fires, which means resizePanel's rAF-debounced re-measure cannot run and the fix physically cannot demonstrate itself, and (b) resize_window reports success but does not move window.innerWidth, so a 320/375/390 sweep is impossible. Verified empirically, not assumed. All three routes exhausted 2026-08-01: resize_window is a no-op (outerWidth=0), Wyatt focusing the tab left document.hidden=true (the extension drives tabs offscreen), and switch_browser reports no alternative browser. Do not retry from an MCP session. Needs Wyatt's own Safari/Chrome; folds into the 18-07 human checkpoint. See docs/DRIVING-THE-GAME.md 8b.",
    "recorded_at": "2026-08-01T04:27:27.970Z",
    "resolved_at": null
  },
  {
    "id": 4,
    "kind": "unrun-verify",
    "phase": "18",
    "file": "src/main.js",
    "line": null,
    "description": "FIX-10 driven-browser acceptance criteria (.apBtn containment at 320/375/390, rotation round-trip) not run - no browser-automation tool available to the executor",
    "status": "open",
    "reason": "BLOCKED FOR AUTOMATION (coordinator, 2026-08-01): cannot be closed from an MCP browser session. The tab is hidden (document.hidden=true, outerWidth=0), so (a) requestAnimationFrame never fires, which means resizePanel's rAF-debounced re-measure cannot run and the fix physically cannot demonstrate itself, and (b) resize_window reports success but does not move window.innerWidth, so a 320/375/390 sweep is impossible. Verified empirically, not assumed. All three routes exhausted 2026-08-01: resize_window is a no-op (outerWidth=0), Wyatt focusing the tab left document.hidden=true (the extension drives tabs offscreen), and switch_browser reports no alternative browser. Do not retry from an MCP session. Needs Wyatt's own Safari/Chrome; folds into the 18-07 human checkpoint. See docs/DRIVING-THE-GAME.md 8b.",
    "recorded_at": "2026-08-01T04:27:28.054Z",
    "resolved_at": null
  },
  {
    "id": 5,
    "kind": "deviation",
    "phase": "18",
    "file": "scripts/lib/audit_page_headless.mjs",
    "line": null,
    "description": "npm test narration_audit_check.js assertion 10 fails on a stale pre-v1.2-archive path (15-DISPOSITIONS-FINAL.json); confirmed pre-existing/unrelated to plan 18-01, not fixed (out of scope)",
    "status": "fixed",
    "reason": "Coordinator fixed it in a637266, outside the plan. Root cause confirmed as a63e194 (archive v1.2) moving .planning/phases/15-narration-audit-fixes/ to .planning/milestones/v1.2-phases/; art-review/narration-audit.html still fetched the live path so BOTH 15-DISPOSITIONS-FINAL.json and 15-ADDRESSED2-APPROVED.json 404'd. Pre-existence proven by reproducing the identical failure at f07a474 in a detached worktree. This also silently broke Wyatt's live narration review page (zero cards rendered), not just CI. Page and checker now try the live phase dir then fall back to the v1.2 archive. npm test: 23/23 groups, exit 0.",
    "recorded_at": "2026-08-01T04:27:28.139Z",
    "resolved_at": "2026-08-01T04:40:00.000Z"
  },
  {
    "id": 6,
    "kind": "unrun-verify",
    "phase": "18",
    "file": "src/ui/util.js",
    "line": null,
    "description": "18-05 Task 1 human-check unrun: driven-Chrome sampling of shotClockSeat/shotClockForce from prompt render to 1s after buttons appear — browser verification disallowed this session (see PLAN.md's <environment>).",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T09:16:59.347Z",
    "resolved_at": null
  },
  {
    "id": 7,
    "kind": "unrun-verify",
    "phase": "18",
    "file": "src/ui/panel.js",
    "line": null,
    "description": "18-05 Task 2 human-check unrun: driven-Chrome sampling of #shotClockNum/#scLabel text content across the reveal window, host and guest — browser verification disallowed this session (see PLAN.md's <environment>).",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T09:16:59.437Z",
    "resolved_at": null
  },
  {
    "id": 8,
    "kind": "deviation",
    "phase": "18",
    "file": "src/ui/panel.js",
    "line": null,
    "description": "18-05 known display gap: appState.clockPendingSeat is only set on the browser rendering the actual button row, so HOST/spectator screens fall back to the pre-existing idle dash (not the new frozen display) during a REMOTE decision's reveal window until the deferred arm fires — never shortens anyone's 30s window, cosmetic only. Flagged for 18-07's checkpoint.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T09:16:59.527Z",
    "resolved_at": null
  }
]
````
