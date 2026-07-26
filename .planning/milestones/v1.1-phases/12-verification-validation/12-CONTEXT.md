# Phase 12: Verification & Validation - Context

**Gathered:** 2026-07-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Prove the v1.1 monolith refactor is correct end-to-end before shipping — no new features. Four fronts (ROADMAP success criteria):
1. Headless determinism/replay harness green over the regression corpus post-refactor.
2. Full solo gameplay loop verified in Chrome (sail, dock, trade, battle, fish, storm, end-of-voyage).
3. Full multiplayer game verified across two browser tabs (host + guest) with deterministic sync intact — including the pause/refresh recovery guarantee.
4. Manual Safari + Chrome playtests confirm no perf/compat regressions.

Note: much of criteria 2–4 was already exercised live during Phase 11 execution (Chrome solo: sail/dock/battle/coin-flip; two-tab MP: host/join/seat+status propagation/narration broadcast; Safari storm re-verified by Wyatt). Phase 12 **formalizes that into lasting, repeatable proof and closes the gaps** (trade, fish, end-of-voyage in solo; MP pause/refresh recovery; full desktop-Safari solo playthrough).
</domain>

<decisions>
## Implementation Decisions

### E2E Testing Approach
- **D-01:** Browser end-to-end verification is **Claude-driven (Chrome via the browser-MCP), captured as a committed, repeatable verification checklist/script** — NOT a traditional auto-running browser-test framework. Do NOT introduce Playwright or any dev-tool/browser-automation dependency in this phase. Rationale: the project's core ethos is "no build step, minimal dependencies"; the game logic is already permanently protected by the determinism + contract checks in `npm test`; the ROADMAP itself frames criteria 2–3 as "Claude-driven Chrome-MCP E2E tests." The deliverable is a documented, re-runnable verification procedure (a markdown checklist and/or a small driver script) that the orchestrator executes on demand and that a human can follow. — **Reversibility:** reversible — a committed Playwright suite can be added later as its own effort (see Deferred).

### Multiplayer Recovery Testing
- **D-02:** The orchestrator (Claude) drives the **full two-tab recovery matrix in Chrome on the Mac**, targeting the v1.0 core guarantee "pausing the multiplayer timer must never destroy game state" plus refresh-restores-the-voyage: (a) pause the shot-clock → game state stays intact (no reset); (b) refresh the GUEST tab mid-game → the voyage restores; (c) refresh the HOST tab mid-game → restores AND deterministic lockstep/sync survives the cycle. Two-tab same-machine is the accepted test surface; a real two-device game is not required for v1.1 (see Deferred). Use the known two-tab MP procedure (unique `pp_id` per tab, sequential set-then-reload — the shared-localStorage gotcha).

### Manual Sign-off Bar (Wyatt)
- **D-03:** Wyatt's personal sign-off = **one full DESKTOP Safari solo playthrough** start-to-finish (sail, dock, trade, battle, fish, end-of-voyage) on his Mac. The desktop-Safari storm render was already re-verified by Wyatt in Phase 11 (D-12), so this playthrough covers the rest of the Safari surface. **Not in scope for Wyatt's manual pass:** mobile Safari (iPhone), iPad, and Safari multiplayer — dropped because the refactor branch isn't deployed and reaching it from a phone needs LAN serving (the public playpastrypirates.com is still old v1.0 code, so it can't test the refactor). Claude covers all of Chrome (solo + MP) and drives the MP recovery matrix; Wyatt owns only what no tool can drive (Safari).

### Claude's Discretion
- **D-04 (determinism corpus depth):** Keep the current 30-seed determinism baseline for v1.1 (it is green and covers seeded engine output byte-for-byte). Criterion 1's "expanded to cover the full regression corpus" is satisfied by running the existing full harness green post-refactor; deliberately targeted new fixtures stressing storms/battles/recovery are treated as optional future hardening, not a v1.1 blocker (see Deferred). Wyatt did not flag this as a decision area.
- Exact E2E checklist scenarios/ordering, assertion mechanics (which `window.__pp_*` debug hooks to assert on), and whether the verification driver is pure-markdown vs. a thin script — planner/executor discretion, guided by D-01.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope & traceability
- `.planning/ROADMAP.md` §"Phase 12: Verification & Validation" — the four success criteria + requirements VERIFY-01..VERIFY-04
- `.planning/REQUIREMENTS.md` — VERIFY-01..04 traceability; also the SPLIT-* requirements Phase 11 satisfied
- `.planning/phases/11-ui-extraction-orchestration-bridge-removal/11-VERIFICATION.md` — what Phase 11 already proved (avoid re-proving); the mechanical gate inventory
- `.planning/phases/11-ui-extraction-orchestration-bridge-removal/11-VALIDATION.md` — the Requirements → Test Map pattern to mirror for VERIFY-*

### Existing automated verification harness (the green baseline to run + extend)
- `package.json` §scripts.test — the full `npm test` chain
- `scripts/determinism_baseline.js` (`--verify`, 30/30) and `scripts/fixtures/determinism/` — the determinism/regression corpus
- `scripts/dlog_replay_test.js` — replay-shortfall detection
- `scripts/module_graph_check.js`, `scripts/ui_contract_check.js`, `scripts/no_undef_check.js` — the structural gates from the refactor (module_graph 7/7, ui_contract 4/4, no-undef 0)
- `scripts/engine_contract_check.js`, `scripts/net_contract_check.js`, `scripts/net_registry_test.js`, `scripts/state_contract_check.js`, `scripts/real_game_test.js`

### Testing runbooks (orchestrator memory — technique, not repo files)
- Two-tab MP in Chrome: unique `pp_id` per tab set sequentially (shared-localStorage gotcha); v1.1 lobby uses card buttons (Play Solo / Host a Crew / Join a Crew); `window.__pp_net_debug` exposes the watcher registry; deterministic remote-render check via direct Firebase prompt injection.
- Safari testing: Safari caches ES modules by URL — a page-URL `?cb=` does NOT bust imported module files; serve on a fresh port (new origin) or hard-reload. Storms are 12.5%/round; force via a temporary `cfg.storm=1` in `src/engine/index.js` (revert — it changes the determinism source hash). No tool can drive desktop Safari; that pass is human.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Full `npm test` chain already green post-refactor — Phase 12 runs it as criterion 1, no new logic needed to satisfy the baseline.
- Debug hooks for E2E assertions: `window.__pp_module_ok` / `__pp_boot_count` (clean-boot signal), `window.__pp_net_debug` (watcher registry: size/list/detachRoom/detachAll), `window.__pp_app_state_debug` (app-state inspection), `window.revealMyRecipe` (the one retained global).
- Proven Chrome-MCP driving pattern from Phase 11: create own tab, navigate with cache-buster, drive via `computer` clicks + `javascript_tool`, assert via `read_console_messages` (onlyErrors) + DOM/global reads.

### Established Patterns
- Recovery lives in the orchestrator/flow layer: solo state persists to `localStorage['pp_solo']` (fixed in 11-02); MP room recovery via the recovery watchers/writers in `src/net/` + `src/orchestrator.js` (`setRecoveryState`, `netWatchRecovery`, `wireRestoreFail`, `endReplay`). These are the exact seams the D-02 pause/refresh matrix must exercise.
- The shot-clock (`setClockUI` / `broadcastClock` / `expireShotClock` seam handlers) is the "pause the multiplayer timer" surface for D-02(a).

### Integration Points
- Serve the refactored branch locally (`python3 -m http.server`, bind 127.0.0.1) — NOT the public site (still v1.0). Confirm the server's cwd matches this worktree before trusting any browser check (stale-server-port gotcha).
</code_context>

<specifics>
## Specific Ideas

- Wyatt's Safari sign-off is a FULL solo playthrough (not just the storm he already checked).
- The public `playpastrypirates.com` is still old v1.0 code and must not be used to verify the refactor — all browser testing is against a local server for this worktree/branch.
- Phase 12 should end by updating `12-VALIDATION.md`-style Requirements→Test map for VERIFY-01..04 and marking them satisfied, mirroring Phase 11.
</specifics>

<deferred>
## Deferred Ideas

- **Committed auto-running Playwright E2E suite** (system Chrome via `channel:'chrome'`, no browser download) — a lasting, CI-runnable browser safety net. Considered and deliberately deferred to keep v1.1 dependency-free; revisit as its own post-milestone effort. (Roadmap backlog.)
- **Real two-device multiplayer playtest** (Wyatt + a friend, separate devices/networks) — extra realism beyond two-tab-same-machine. Optional confidence booster, not required to ship v1.1.
- **Mobile Safari (iPhone) / iPad playtests** — dropped for v1.1 (needs LAN-accessible serving of the branch; not an established target). Reconsider if mobile becomes a supported surface.
- **Expanded determinism corpus** — targeted fixtures that stress storms, battles, and recovery flows so future refactors can't silently break them. Optional hardening beyond the current 30-seed baseline.

### Reviewed Todos (not folded)
None — no pending todos matched Phase 12.
</deferred>

---

*Phase: 12-verification-validation*
*Context gathered: 2026-07-25*
