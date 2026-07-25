# Phase 12 Verification Checklist — v1.1 Monolith Refactor

A committed, repeatable procedure a human or the orchestrator can re-run on demand (D-01). This is NOT a Playwright/Puppeteer suite — no browser-test-framework dependency is introduced. It formalizes the four ROADMAP success criteria for Phase 12 into a checkbox procedure.

## How to re-run

1. Serve the refactor branch locally from THIS worktree's root: `python3 -m http.server <port>` bound to `127.0.0.1` (loopback only — never `0.0.0.0`). Do not reuse a port another worktree or session already owns; confirm before starting.
2. Before trusting any browser check, confirm the server's working directory equals this worktree's root (the stale-server-port gotcha — a server started earlier from a different worktree/branch will silently serve the wrong code on the same port).
3. NEVER verify against `playpastrypirates.com` — that origin is still serving v1.0 and cannot prove anything about this refactor. All browser verification in this checklist targets the local `127.0.0.1` server only.
4. Run `npm test` for the automated section (Criterion 1). No install step, no dependencies to fetch — the project intentionally declares zero `dependencies` and zero `devDependencies` (D-01).
5. Drive Chrome via the browser-MCP for Criteria 2 and 3; assert the debug hooks (`window.__pp_module_ok`, `window.__pp_boot_count`, `window.__pp_net_debug`, `window.__pp_app_state_debug`) and `read_console_messages` (`onlyErrors`) rather than eyeballing the page.
6. Criterion 4 (desktop Safari) has no automation path — it is a manual playthrough owned by Wyatt (D-03).

---

## Criterion 1 — Automated determinism/regression harness (VERIFY-01)

- [x] `npm test` run from repo root, full 9-script chain, all green (exit 0):
  1. `node scripts/determinism_baseline.js --verify` — 30/30 seeds PASS, `SOURCE: unchanged` (hashes match and engine source hash matches the recorded baseline)
  2. `node scripts/engine_contract_check.js` — purity (ENGINE-01), annotations (ENGINE-04, 7/7 ORDER IS LOAD-BEARING), DAG direction (SPLIT-01/02), moved-symbol completeness — all PASS
  3. `node scripts/dlog_replay_test.js` — replay-shortfall synthetic cases + real-game case — all PASS
  4. `node scripts/net_registry_test.js` — registry attach/detach/detachRoom/detachAll/cross-instance cases — all PASS
  5. `node scripts/net_contract_check.js` — sole listener site (NET-02/D-04), no UI dependency (SPLIT-04), no app-state dependency, directional imports (D-06), 18/18 watcher inventory (NET-01/D-01) — all PASS
  6. `node scripts/state_contract_check.js` — no leftover top-level declarations, no leftover bare usage of the 46 app-state names, debug-hook naming (GLOBAL-03, 4-name allowlist), appState binding never reassigned — all PASS
  7. `node scripts/module_graph_check.js` — no import cycle, shared is a leaf tier, engine/net/ui/main layering correct, `ui` does NOT import `net` (D-07) — all PASS
  8. `node scripts/ui_contract_check.js` — no `src/ui/**` import resolves into `src/net/` (D-07), PP bridge gone, classic `<script>` region empty, retained-globals allowlist (`window.revealMyRecipe` + the 4 debug hooks only) — all PASS
  9. `node scripts/no_undef_check.js` — 19 files scanned under `src/**/*.js`, zero unresolved call-position identifiers — PASS

- **Observed result (2026-07-25T19:39Z, this worktree, branch `claude/new-session-d6e9d7`):** `npm test` exit code 0. All 30 determinism seeds PASS with `SOURCE: unchanged`. All 8 remaining scripts PASS with zero failures reported. VERIFY-01's automated baseline is green post-refactor.

- [x] Chrome boot smoke — PASS (see below)

### Standing re-run procedure (D-04)

To reproduce VERIFY-01's automated evidence at any later commit:

1. Run `npm test` from repo root. Expect exit code 0 and `SOURCE: unchanged` in the determinism output (30/30 seeds).
2. Check the frozen-corpus invariant: `git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l` must equal exactly `1`. The 30-seed determinism corpus is captured once (Phase 7) and never re-captured — **never pass `--capture`** to `determinism_baseline.js`. A count other than `1` means the corpus was regenerated and the "unchanged regression baseline" guarantee no longer holds.
   - **Observed (2026-07-25):** count = `1`. Invariant holds.
3. Check the zero-dependency guarantee (D-01 — no browser-test-framework or other package was introduced this phase): `package.json` must declare zero `dependencies` and zero `devDependencies`.
   - **Observed (2026-07-25):** `dependencies: {}`, `devDependencies: {}`. Zero of either. No package was added to satisfy Phase 12.
4. Per D-04, the current 30-seed baseline is accepted as sufficient for v1.1 — it is green and covers seeded engine output byte-for-byte. Expanding it with fixtures specifically targeting storms/battles/recovery is optional future hardening, not a blocker for this milestone (see 12-CONTEXT.md § Deferred).

VERIFY-01's automated baseline is pinned and reproducible from this checklist alone: `npm test` green + frozen-corpus count of 1 + zero dependencies/devDependencies.

**Boot smoke — PASS.** Verified via orchestrator browser automation (Chrome-MCP), not by a human, against a fresh local server serving this worktree at `http://127.0.0.1:8021/` (a port not already owned by another worktree/session — 8000 and 8020, the latter Wyatt's live desktop-Safari session, were both left untouched).

Observed values:
- `window.__pp_module_ok === true` — PASS
- `window.__pp_boot_count === 1` — PASS
- `read_console_messages` (`onlyErrors`) — PASS, zero console errors, confirmed on a clean reload with console tracking active from load
- Live interactivity: started a solo game (captain "Boot Smoke" + 3 bots rendered in the CAPTAINS panel), then advanced the intro, which produced the deterministic sailing-order draw ("crew draws lots for sailing order") — proves the engine + render path are live end-to-end
- `document.readyState === "complete"`; both the landing view and the in-game view rendered correctly

The verification apparatus (local-serve → Chrome-MCP → debug-hook assertion → committed checklist) is proven end-to-end on this one thin path.

---

## Criterion 2 — Solo gameplay-loop E2E (VERIFY-02)

Context: Phase 11 already exercised **sail, dock, battle, and coin-flip** live in Chrome with zero
console errors (see `.planning/phases/11-ui-extraction-orchestration-bridge-removal/11-VERIFICATION.md`).
This criterion formalizes those into the committed record AND closes the three gaps Phase 11 never
formally verified: **trade/parley, fish, and end-of-voyage.** Storm is optional this pass (12.5%/round,
naturally-triggered; already verified in Phase 11 — force it only if convenient, and revert any
temporary `cfg.storm=1` edit immediately per D-04).

### Scenario steps (drive against a fresh local `127.0.0.1` server for this worktree — never `playpastrypirates.com`)

1. **Boot** — load the page, confirm `window.__pp_module_ok === true`, `document.readyState === "complete"`, `read_console_messages` (`onlyErrors`) empty on load.
2. **Start solo** — click "Play Solo", enter a captain name, confirm the CAPTAINS panel renders with 3 AI bots.
3. **Pick recipe** — advance the intro/sailing-order draw, confirm a recipe is assigned/visible for the human captain.
4. **Sail** — move the ship at least one tile; confirm position updates on the board and in `window.__pp_app_state_debug()`.
5. **Dock + coin-flip** — dock at an island, trigger the ingredient coin-flip.
6. **Ingredient award** — confirm a won ingredient is added to the human captain's inventory (or a clear miss is shown on tails).
7. **Trade/parley (GAP)** — trigger a trade: either use the "🤝 Parley" option in the human action menu (requires another captain with a tradeable ingredient in range/tradeOpp), or let a bot hail the human captain with a parley offer (sell/counter/refuse). Confirm the trade event resolves and inventories/coins update on both sides.
8. **Fish (GAP)** — use the "🎣 Fish" action, confirm the "cast your line" flip resolves (heads = catch, tails = miss) and state updates accordingly.
9. **Battle** — trigger/resolve at least one battle against an AI captain (attack action or a forced encounter); confirm flips resolve and a winner is recorded.
10. **Storm (optional)** — if a storm round occurs naturally (12.5%/round), confirm it renders via the pre-baked PNG tile (`buildStormLayers`) without freeze/crash/beachball and the game continues. If forced via a temporary `cfg.storm=1` in `src/engine/index.js`, REVERT immediately after observing it and re-verify determinism (`node scripts/determinism_baseline.js --verify` + `git diff --quiet HEAD -- src/engine/index.js`).
11. **End-of-voyage/win (GAP)** — play through to the end of the voyage; confirm the win box, redesigned end-of-voyage badges, and confetti render, and the end screen appears correctly.

Throughout all steps: poll `read_console_messages` (`onlyErrors`) — must stay empty — and sanity-check
`window.__pp_app_state_debug()` returns a coherent fresh snapshot (players/recipe/positions look right).

### Results

- [ ] Sail
- [ ] Dock
- [ ] Trade / parley
- [ ] Fish
- [ ] Battle
- [ ] Storm (optional)
- [ ] End-of-voyage
- [ ] `localStorage['pp_solo']` persistence confirmed (the 11-02 saveSoloState fix)
- [ ] VERIFY-02 satisfied

*(Scenario skeleton authored in 12-02 Task 0 (non-browser prep); results to be recorded by the
orchestrator's live Chrome-MCP drive, then completed by the 12-02 executor.)*

---

## Criterion 3 — Two-tab multiplayer + pause/refresh recovery (VERIFY-03)

- [ ] Two-tab host + guest: seat/status propagation, narration broadcast
- [ ] Pause the shot-clock mid-game — game state stays intact (no reset)
- [ ] Refresh the GUEST tab mid-game — the voyage restores
- [ ] Refresh the HOST tab mid-game — restores AND deterministic lockstep/sync survives the cycle

*(Filled by a later plan in this phase — 12-03.)*

---

## Criterion 4 — Manual desktop-Safari playthrough (VERIFY-04)

- [ ] One full desktop-Safari solo playthrough start-to-finish (sail, dock, trade, battle, fish, end-of-voyage) — Wyatt's personal sign-off (D-03)

*(Filled by a later plan in this phase — 12-04.)*
