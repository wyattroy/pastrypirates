---
schema_version: 1
open_count: 6
waived_count: 0
fixed_count: 9
total_count: 15
last_updated: 2026-08-01T09:29:11.744Z
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
| 9 | 18 | unrun-verify | index.html |  | 18-06 Task 3 (FIX-09) six D-03 renders (treatment A/B at 320/375/390) not produced this session - browser verification disallowed (MCP tab hidden, rAF/timers dead, matchMedia never matches at innerWidth 950; see docs/DRIVING-THE-GAME.md 8b). Both chip treatments are implemented as live, toggleable CSS (body.chipsOwnRow) and statically verified; only the six by-eye renders and the D-03 choice itself remain, folding into 18-07's checkpoint. | open |  | 2026-08-01T09:29:11.744Z |  |
| 10 | 22 | unrun-verify | .planning/workstreams/front-door/phases/22-the-front-door/22-01-PLAN.md |  | Task 2's browser dismiss-equals-confirm check (D-02) not run — no browser-automation tool in the executor session; server left running on :8531 | fixed | Coordinator ran the D-02 dismissal pass in Chrome against a fresh server (:8543 — new port, since Chrome caches ES modules). All three dismissal paths CONFIRM AND PROCEED rather than cancel: Escape (pp_lastName='Escape Tester', roster[0] set, solo game started), backdrop click on #nameModal (pp_lastName='Backdrop Tester', landed #stepPassPlay with #ppName0 pre-filled), and the .modalX button (pp_lastName='X Button Tester', landed #stepJoin). Zero JS errors, zero unhandled rejections, zero console.error. Task 1's tracer re-verified in the same pass: modal fires on all four mode cards pre-filled, first-visit default 'Davy Scones', pp_lastName persists across reload (validating D-04's corrected decision), roster[0] renders exactly once with four distinct captains. LIMIT: Host a Crew could not be exercised end-to-end — appState.db never initialises in this browsing context — but this reproduces identically on the pre-22-01 baseline (commit 5cb50ba), so it is environmental, not a regression. | 2026-08-01T04:58:15.352Z | 2026-08-01T05:02:12.000Z |
| 11 | 22 | unrun-verify | .planning/workstreams/front-door/phases/22-the-front-door/22-01-PLAN.md |  | Task 2's negative-control check (other six modals still close-only after D-02 wiring) not run — same browser-tool gap | fixed | Negative control run by coordinator in Chrome: opened #howToPlayModal and pressed Escape — it did NOT close (display stayed 'flex') and localStorage.pp_lastName was unchanged. Confirms the new Escape handler is scoped to #nameModal only and did not leak confirm-and-proceed semantics into the other six modals. Consistent with 22-RESEARCH.md's finding that no Escape handling existed anywhere in the codebase before this plan. | 2026-08-01T04:58:15.450Z | 2026-08-01T05:02:12.000Z |
| 12 | 22 | unrun-verify | about.html |  | Task 1 human-check: live browser pass of the hero row (two-up at 1440px, stacked at 480px, over-long blurb wrap test) not run — no browser-automation tool available in this session | fixed | Coordinator ran the hero-row pass in Chrome. At 1440px the hero is two-up (text left, image right); at a real 476px viewport (measured inside a width-pinned iframe, since Chrome clamps windows to ~500px) the media query matches and the hero stacks to flex-direction:column with no horizontal overflow. THIS CHECK FOUND A REAL BUG: '.abtHeroText/.abtHeroShot { flex: 1 1 320px }' resolves against the main axis, so in column direction the 320px basis became a minimum HEIGHT — the text block rendered 165px taller than its content and the visible copy-to-image gap was 189px instead of the intended 24px. Fixed in commit 8208bc4 by resetting both halves to 'flex: 0 0 auto' inside the breakpoint; gap is now exactly 24px and hero height dropped 664px -> 427px. Desktop row layout re-verified unchanged at 1100px (side-by-side, equal 440px columns, no overflow). Named gate subset all green after the fix. | 2026-08-01T05:09:40.344Z | 2026-08-01T05:24:00.000Z |
| 13 | 22 | unrun-verify | about.html |  | Task 2 human-check: live browser pass of rules/credits/Ko-Fi stacking, ko-fi.com network-request-on-click confirmation, and side-by-side rules-copy comparison not run — no browser-automation tool available in this session | fixed | Coordinator ran the pass in Chrome. Rules card, credits card and the 'Support the game' card render and stack in order. Clicking '🍪 Buy me a cookie' lazily mounts the iframe on first open (panel display block, iframe loading='lazy', host ko-fi.com) and its sandbox attribute reads exactly 'allow-scripts allow-forms allow-popups allow-same-origin' — an exact string match with src/ui/lobby.js:74, confirming the security-relevant parity claim (both are setAttribute calls, not HTML attributes, so an HTML-attribute grep will falsely report zero — verify with the JS call form). Rules-copy comparison: About uses stranger-facing plain English and names the Isle of Tortuga, never Barbados, and is not a copy of the How-To-Play modal text — D-08 satisfied. | 2026-08-01T05:09:40.437Z | 2026-08-01T05:24:00.000Z |
| 14 | 22 | unrun-verify | index.html |  | 22-03 consolidated browser pass not run: no browser-automation tool available in this session. Covers About-link click-through navigation (welcome + footer), all four mode-card modal flows, and narrow-width wrap check (320/375/480px) in Safari and Chrome. | fixed | Coordinator ran the pass in Chrome on a fresh server (:8557). BOTH About links click through to about.html: #lnkAboutWelcome on the welcome screen (renders centred under the four mode cards) and #lnkAboutFooter in the in-game footer between 'Buy me a cookie' and 'Leave game' — the footer needs a game started to be reachable, as expected. Narrow-width wrap check at real 320/375/480px viewports (width-pinned iframes, since Chrome clamps windows to ~500px): the About link is 82x33 and single-line at every width, fully within the viewport, and the four mode cards reflow cleanly (single column at 320, two-up at 375/480). index.html's style block verified byte-identical to HEAD, so no Phase 18 collision. TWO TEST ARTIFACTS worth recording so they are not mistaken for defects next time: (1) a first probe measured the About link at 0x0 because #lobby was display:none — boot had RESUMED a solo game left in localStorage by an earlier probe in the same origin; clearing localStorage before each iframe load fixed it (this is the shared-localStorage gotcha in docs/DRIVING-THE-GAME.md). (2) documentElement.scrollWidth exceeds the viewport by ~3px at every width, but the overflowing element is #game, the pre-existing board container — not anything 22-03 added. Safari not exercised; only Chrome was driven. | 2026-08-01T05:20:52.532Z | 2026-08-01T05:40:00.000Z |
| 15 | 22 | unrun-verify | about.html |  | 22-04/22-05 combined session: human-check browser passes not run (About page's new top CTA, interspersed rule-row images, example recipes, testimonials, and the final approved copy/name-modal wording) — no browser-automation tool available in this session. Coordinator has Chrome tools and should run the visual pass. | fixed | Coordinator ran the full visual pass in Chrome on a fresh server (:8583). TOP CTA: '⚓ Play Pastry Pirates' renders as the primary accent-orange button above the hero and navigates to index.html (landed on /index.html, welcome screen present). HERO: assets/about-screenshot.jpg (Wyatt's board image) renders at 1320x888. INTERSPERSED IMAGES: cocoa-island sits beside 'The goal', flippenator beside 'Your turn'; both render. ALL FOUR IMAGES load and every width/height attribute equals the file's real intrinsic dimensions exactly (1320x888, 252x302, 554x226, 1328x1000) — no layout shift. EXAMPLE RECIPES: section renders with intro copy above the recipe-chooser image. TESTIMONIALS: 'What the captains are saying' shows all four quotes, verified verbatim against Wyatt's wording character-for-character including the 4-R 'YARRRRRGH' and the trailing '?' on the candycrab line. SHORT-VERSION NOTE: confirmed gone. PARLEY: zero occurrences in about.html/index.html/RULES.md/Rules_boardgame.md; the in-game How-To-Play modal now reads 'Trade — hail any captain...'. Engine cfg.parley and the narration event key t:'parley' deliberately untouched (determinism contract); src/engine/index.js diff empty. KO-FI: still lazy-mounts on click with the sandbox attribute byte-identical to src/ui/lobby.js. RESPONSIVE: at real 320/375/480px viewports the hero stacks, both rule rows stack, testimonials collapse to one column, and there is zero horizontal overflow at every width. CONSOLE: zero errors, zero unhandled rejections. index.html's <style> block verified byte-identical to pre-revision HEAD (no Phase 18 collision). Named gate subset all exit 0. | 2026-08-01T09:14:56.919Z | 2026-08-01T06:20:00.000Z |

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
  },
  {
    "id": 9,
    "kind": "unrun-verify",
    "phase": "18",
    "file": "index.html",
    "line": null,
    "description": "18-06 Task 3 (FIX-09) six D-03 renders (treatment A/B at 320/375/390) not produced this session - browser verification disallowed (MCP tab hidden, rAF/timers dead, matchMedia never matches at innerWidth 950; see docs/DRIVING-THE-GAME.md 8b). Both chip treatments are implemented as live, toggleable CSS (body.chipsOwnRow) and statically verified; only the six by-eye renders and the D-03 choice itself remain, folding into 18-07's checkpoint.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-01T09:29:11.744Z",
    "resolved_at": null
  }
]
````
