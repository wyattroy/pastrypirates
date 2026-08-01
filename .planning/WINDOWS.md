---
schema_version: 1
open_count: 1
waived_count: 0
fixed_count: 7
total_count: 8
last_updated: 2026-08-01T09:14:56.919Z
---

# Broken Windows Ledger

> Cross-phase defect register. `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 09 | unrun-verify | index.html |  | 09-03 Task 3 human-check (window.__pp_module_ok / window.__pp_boot_count on a loaded page) not run — no browser-automation tool available in the executor session | fixed | Coordinator ran the load-time tripwire check in Chrome (cache-busted): window.__pp_module_ok=true, window.__pp_boot_count=1, typeof firebase='object', 55 net fns on the bridge, netInit/netWatchFlip resolve as bare identifiers, lobby renders, console clean. index.html boots correctly with its entire Firebase surface relocated to src/net/. | 2026-07-24T18:29:31.107Z | 2026-07-24T18:45:00.000Z |
| 2 | 09 | unmet-truth | index.html |  | ROADMAP Phase 9 criterion 4 (two-tab multiplayer sync) only partially demonstrated in 09-05: bidirectional lobby-state/seats sync proven across two real tabs with distinct identities, but the full in-game turn-propagation leg (narr/ev/prompt/flip/battle watchers observed live host->guest) was not cleanly completed — the coordinator's own defensive UI click during voyage start misrouted the host tab into pass-and-play mode. Not a code regression; a test-driving artifact. Needs a clean re-run before criterion 4 is fully satisfied — closed by Phase 12 VERIFY-03 (Chrome-MCP two-tab E2E). | fixed | Clean two-tab re-run completed by coordinator in Chrome (server :8777, distinct pp_id per tab, sequential load per the shared-localStorage gotcha). Proven live host<->guest through the extracted src/net/ module: room create/join round-trip (seats watcher), bidirectional lobby sync, game-start broadcast + board render on guest, sailing-order narration broadcast, chat host->guest with a unique marker (chat child_added watcher), acknowledgement + recipe prompt/response gating synced both ways, full turn loop cycling host->bots->guest (ev event stream climbing 16->29), guest move -> host turn advanced (response watcher), and host move -> guest CAPTAINS panel synced. Same-moment authoritative-state match host vs guest: HostCap 1/1, Dough Hook 7/7, Flaky Jack 13/13, GuestMate 0/0. Watcher counts scaled 4 (lobby) -> 8 (host in-game) -> 16 (guest in-game) via window.__pp_net_debug. NOTE: reading game.players[].pos on the GUEST is the wrong probe — guests are render-only (host-authority model), so their local game object is intentionally stale; the rendered CAPTAINS panel is the sync source of truth. Criterion 4 fully satisfied. | 2026-07-24T18:55:19.013Z | 2026-07-24T20:29:14.093Z |
| 3 | 22 | unrun-verify | .planning/workstreams/front-door/phases/22-the-front-door/22-01-PLAN.md |  | Task 2's browser dismiss-equals-confirm check (D-02) not run — no browser-automation tool in the executor session; server left running on :8531 | fixed | Coordinator ran the D-02 dismissal pass in Chrome against a fresh server (:8543 — new port, since Chrome caches ES modules). All three dismissal paths CONFIRM AND PROCEED rather than cancel: Escape (pp_lastName='Escape Tester', roster[0] set, solo game started), backdrop click on #nameModal (pp_lastName='Backdrop Tester', landed #stepPassPlay with #ppName0 pre-filled), and the .modalX button (pp_lastName='X Button Tester', landed #stepJoin). Zero JS errors, zero unhandled rejections, zero console.error. Task 1's tracer re-verified in the same pass: modal fires on all four mode cards pre-filled, first-visit default 'Davy Scones', pp_lastName persists across reload (validating D-04's corrected decision), roster[0] renders exactly once with four distinct captains. LIMIT: Host a Crew could not be exercised end-to-end — appState.db never initialises in this browsing context — but this reproduces identically on the pre-22-01 baseline (commit 5cb50ba), so it is environmental, not a regression. | 2026-08-01T04:58:15.352Z | 2026-08-01T05:02:12.000Z |
| 4 | 22 | unrun-verify | .planning/workstreams/front-door/phases/22-the-front-door/22-01-PLAN.md |  | Task 2's negative-control check (other six modals still close-only after D-02 wiring) not run — same browser-tool gap | fixed | Negative control run by coordinator in Chrome: opened #howToPlayModal and pressed Escape — it did NOT close (display stayed 'flex') and localStorage.pp_lastName was unchanged. Confirms the new Escape handler is scoped to #nameModal only and did not leak confirm-and-proceed semantics into the other six modals. Consistent with 22-RESEARCH.md's finding that no Escape handling existed anywhere in the codebase before this plan. | 2026-08-01T04:58:15.450Z | 2026-08-01T05:02:12.000Z |
| 5 | 22 | unrun-verify | about.html |  | Task 1 human-check: live browser pass of the hero row (two-up at 1440px, stacked at 480px, over-long blurb wrap test) not run — no browser-automation tool available in this session | fixed | Coordinator ran the hero-row pass in Chrome. At 1440px the hero is two-up (text left, image right); at a real 476px viewport (measured inside a width-pinned iframe, since Chrome clamps windows to ~500px) the media query matches and the hero stacks to flex-direction:column with no horizontal overflow. THIS CHECK FOUND A REAL BUG: '.abtHeroText/.abtHeroShot { flex: 1 1 320px }' resolves against the main axis, so in column direction the 320px basis became a minimum HEIGHT — the text block rendered 165px taller than its content and the visible copy-to-image gap was 189px instead of the intended 24px. Fixed in commit 8208bc4 by resetting both halves to 'flex: 0 0 auto' inside the breakpoint; gap is now exactly 24px and hero height dropped 664px -> 427px. Desktop row layout re-verified unchanged at 1100px (side-by-side, equal 440px columns, no overflow). Named gate subset all green after the fix. | 2026-08-01T05:09:40.344Z | 2026-08-01T05:24:00.000Z |
| 6 | 22 | unrun-verify | about.html |  | Task 2 human-check: live browser pass of rules/credits/Ko-Fi stacking, ko-fi.com network-request-on-click confirmation, and side-by-side rules-copy comparison not run — no browser-automation tool available in this session | fixed | Coordinator ran the pass in Chrome. Rules card, credits card and the 'Support the game' card render and stack in order. Clicking '🍪 Buy me a cookie' lazily mounts the iframe on first open (panel display block, iframe loading='lazy', host ko-fi.com) and its sandbox attribute reads exactly 'allow-scripts allow-forms allow-popups allow-same-origin' — an exact string match with src/ui/lobby.js:74, confirming the security-relevant parity claim (both are setAttribute calls, not HTML attributes, so an HTML-attribute grep will falsely report zero — verify with the JS call form). Rules-copy comparison: About uses stranger-facing plain English and names the Isle of Tortuga, never Barbados, and is not a copy of the How-To-Play modal text — D-08 satisfied. | 2026-08-01T05:09:40.437Z | 2026-08-01T05:24:00.000Z |
| 7 | 22 | unrun-verify | index.html |  | 22-03 consolidated browser pass not run: no browser-automation tool available in this session. Covers About-link click-through navigation (welcome + footer), all four mode-card modal flows, and narrow-width wrap check (320/375/480px) in Safari and Chrome. | fixed | Coordinator ran the pass in Chrome on a fresh server (:8557). BOTH About links click through to about.html: #lnkAboutWelcome on the welcome screen (renders centred under the four mode cards) and #lnkAboutFooter in the in-game footer between 'Buy me a cookie' and 'Leave game' — the footer needs a game started to be reachable, as expected. Narrow-width wrap check at real 320/375/480px viewports (width-pinned iframes, since Chrome clamps windows to ~500px): the About link is 82x33 and single-line at every width, fully within the viewport, and the four mode cards reflow cleanly (single column at 320, two-up at 375/480). index.html's style block verified byte-identical to HEAD, so no Phase 18 collision. TWO TEST ARTIFACTS worth recording so they are not mistaken for defects next time: (1) a first probe measured the About link at 0x0 because #lobby was display:none — boot had RESUMED a solo game left in localStorage by an earlier probe in the same origin; clearing localStorage before each iframe load fixed it (this is the shared-localStorage gotcha in docs/DRIVING-THE-GAME.md). (2) documentElement.scrollWidth exceeds the viewport by ~3px at every width, but the overflowing element is #game, the pre-existing board container — not anything 22-03 added. Safari not exercised; only Chrome was driven. | 2026-08-01T05:20:52.532Z | 2026-08-01T05:40:00.000Z |
| 8 | 22 | unrun-verify | about.html |  | 22-04/22-05 combined session: human-check browser passes not run (About page's new top CTA, interspersed rule-row images, example recipes, testimonials, and the final approved copy/name-modal wording) — no browser-automation tool available in this session. Coordinator has Chrome tools and should run the visual pass. | open |  | 2026-08-01T09:14:56.919Z |  |

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
    "phase": "22",
    "file": ".planning/workstreams/front-door/phases/22-the-front-door/22-01-PLAN.md",
    "line": null,
    "description": "Task 2's browser dismiss-equals-confirm check (D-02) not run — no browser-automation tool in the executor session; server left running on :8531",
    "status": "fixed",
    "reason": "Coordinator ran the D-02 dismissal pass in Chrome against a fresh server (:8543 — new port, since Chrome caches ES modules). All three dismissal paths CONFIRM AND PROCEED rather than cancel: Escape (pp_lastName='Escape Tester', roster[0] set, solo game started), backdrop click on #nameModal (pp_lastName='Backdrop Tester', landed #stepPassPlay with #ppName0 pre-filled), and the .modalX button (pp_lastName='X Button Tester', landed #stepJoin). Zero JS errors, zero unhandled rejections, zero console.error. Task 1's tracer re-verified in the same pass: modal fires on all four mode cards pre-filled, first-visit default 'Davy Scones', pp_lastName persists across reload (validating D-04's corrected decision), roster[0] renders exactly once with four distinct captains. LIMIT: Host a Crew could not be exercised end-to-end — appState.db never initialises in this browsing context — but this reproduces identically on the pre-22-01 baseline (commit 5cb50ba), so it is environmental, not a regression.",
    "recorded_at": "2026-08-01T04:58:15.352Z",
    "resolved_at": "2026-08-01T05:02:12.000Z"
  },
  {
    "id": 4,
    "kind": "unrun-verify",
    "phase": "22",
    "file": ".planning/workstreams/front-door/phases/22-the-front-door/22-01-PLAN.md",
    "line": null,
    "description": "Task 2's negative-control check (other six modals still close-only after D-02 wiring) not run — same browser-tool gap",
    "status": "fixed",
    "reason": "Negative control run by coordinator in Chrome: opened #howToPlayModal and pressed Escape — it did NOT close (display stayed 'flex') and localStorage.pp_lastName was unchanged. Confirms the new Escape handler is scoped to #nameModal only and did not leak confirm-and-proceed semantics into the other six modals. Consistent with 22-RESEARCH.md's finding that no Escape handling existed anywhere in the codebase before this plan.",
    "recorded_at": "2026-08-01T04:58:15.450Z",
    "resolved_at": "2026-08-01T05:02:12.000Z"
  },
  {
    "id": 5,
    "kind": "unrun-verify",
    "phase": "22",
    "file": "about.html",
    "line": null,
    "description": "Task 1 human-check: live browser pass of the hero row (two-up at 1440px, stacked at 480px, over-long blurb wrap test) not run — no browser-automation tool available in this session",
    "status": "fixed",
    "reason": "Coordinator ran the hero-row pass in Chrome. At 1440px the hero is two-up (text left, image right); at a real 476px viewport (measured inside a width-pinned iframe, since Chrome clamps windows to ~500px) the media query matches and the hero stacks to flex-direction:column with no horizontal overflow. THIS CHECK FOUND A REAL BUG: '.abtHeroText/.abtHeroShot { flex: 1 1 320px }' resolves against the main axis, so in column direction the 320px basis became a minimum HEIGHT — the text block rendered 165px taller than its content and the visible copy-to-image gap was 189px instead of the intended 24px. Fixed in commit 8208bc4 by resetting both halves to 'flex: 0 0 auto' inside the breakpoint; gap is now exactly 24px and hero height dropped 664px -> 427px. Desktop row layout re-verified unchanged at 1100px (side-by-side, equal 440px columns, no overflow). Named gate subset all green after the fix.",
    "recorded_at": "2026-08-01T05:09:40.344Z",
    "resolved_at": "2026-08-01T05:24:00.000Z"
  },
  {
    "id": 6,
    "kind": "unrun-verify",
    "phase": "22",
    "file": "about.html",
    "line": null,
    "description": "Task 2 human-check: live browser pass of rules/credits/Ko-Fi stacking, ko-fi.com network-request-on-click confirmation, and side-by-side rules-copy comparison not run — no browser-automation tool available in this session",
    "status": "fixed",
    "reason": "Coordinator ran the pass in Chrome. Rules card, credits card and the 'Support the game' card render and stack in order. Clicking '🍪 Buy me a cookie' lazily mounts the iframe on first open (panel display block, iframe loading='lazy', host ko-fi.com) and its sandbox attribute reads exactly 'allow-scripts allow-forms allow-popups allow-same-origin' — an exact string match with src/ui/lobby.js:74, confirming the security-relevant parity claim (both are setAttribute calls, not HTML attributes, so an HTML-attribute grep will falsely report zero — verify with the JS call form). Rules-copy comparison: About uses stranger-facing plain English and names the Isle of Tortuga, never Barbados, and is not a copy of the How-To-Play modal text — D-08 satisfied.",
    "recorded_at": "2026-08-01T05:09:40.437Z",
    "resolved_at": "2026-08-01T05:24:00.000Z"
  },
  {
    "id": 7,
    "kind": "unrun-verify",
    "phase": "22",
    "file": "index.html",
    "line": null,
    "description": "22-03 consolidated browser pass not run: no browser-automation tool available in this session. Covers About-link click-through navigation (welcome + footer), all four mode-card modal flows, and narrow-width wrap check (320/375/480px) in Safari and Chrome.",
    "status": "fixed",
    "reason": "Coordinator ran the pass in Chrome on a fresh server (:8557). BOTH About links click through to about.html: #lnkAboutWelcome on the welcome screen (renders centred under the four mode cards) and #lnkAboutFooter in the in-game footer between 'Buy me a cookie' and 'Leave game' — the footer needs a game started to be reachable, as expected. Narrow-width wrap check at real 320/375/480px viewports (width-pinned iframes, since Chrome clamps windows to ~500px): the About link is 82x33 and single-line at every width, fully within the viewport, and the four mode cards reflow cleanly (single column at 320, two-up at 375/480). index.html's style block verified byte-identical to HEAD, so no Phase 18 collision. TWO TEST ARTIFACTS worth recording so they are not mistaken for defects next time: (1) a first probe measured the About link at 0x0 because #lobby was display:none — boot had RESUMED a solo game left in localStorage by an earlier probe in the same origin; clearing localStorage before each iframe load fixed it (this is the shared-localStorage gotcha in docs/DRIVING-THE-GAME.md). (2) documentElement.scrollWidth exceeds the viewport by ~3px at every width, but the overflowing element is #game, the pre-existing board container — not anything 22-03 added. Safari not exercised; only Chrome was driven.",
    "recorded_at": "2026-08-01T05:20:52.532Z",
    "resolved_at": "2026-08-01T05:40:00.000Z"
  },
  {
    "id": 8,
    "kind": "unrun-verify",
    "phase": "22",
    "file": "about.html",
    "line": null,
    "description": "22-04/22-05 combined session: human-check browser passes not run (About page's new top CTA, interspersed rule-row images, example recipes, testimonials, and the final approved copy/name-modal wording) — no browser-automation tool available in this session. Coordinator has Chrome tools and should run the visual pass.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T09:14:56.919Z",
    "resolved_at": null
  }
]
````
