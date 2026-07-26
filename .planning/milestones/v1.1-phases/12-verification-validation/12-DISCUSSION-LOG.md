# Phase 12: Verification & Validation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-25
**Phase:** 12-verification-validation
**Areas discussed:** E2E testing approach, Multiplayer recovery testing, Manual sign-off bar

---

## Area selection

| Option | Selected |
|--------|----------|
| Lasting tests vs. one-time check | ✓ |
| Multiplayer recovery testing | ✓ |
| Determinism corpus depth | (not selected — Claude discretion, keep 30-seed baseline) |
| Your manual sign-off bar | ✓ |

---

## E2E testing approach

| Option | Description | Selected |
|--------|-------------|----------|
| Claude-driven + committed checklist | Drive Chrome/MCP on demand; commit a repeatable verification checklist/script; no new test framework | ✓ |
| Committed auto-running suite (Playwright) | Real `npm run e2e` browser tests, CI-runnable; introduces first dev-tool dependency | |
| Both — checklist now, suite later | Checklist now to ship v1.1; log Playwright suite as backlog | |

**User's choice:** Claude-driven + committed checklist.
**Notes:** Preserves the project's no-build / minimal-dependency ethos; game logic already protected by determinism + contract checks; matches the ROADMAP's own "Claude-driven Chrome-MCP E2E" framing and Wyatt's non-coder workflow (he triggers it by asking).

---

## Multiplayer recovery testing

| Option | Description | Selected |
|--------|-------------|----------|
| I drive detailed two-tab recovery tests | Pause shot-clock (state holds), refresh guest (restores), refresh host (restores + sync survives) | ✓ |
| That + a real two-device game with a friend | Adds real-latency/real-device realism | |
| Light spot-check only | Confirm two-tab runs; skip exhaustive recovery scripting | |

**User's choice:** Claude drives the detailed two-tab recovery matrix.
**Notes:** Targets the v1.0 core guarantee ("pausing the MP timer must never destroy game state") + refresh recovery, which the refactor's net/state changes touched. Real two-device game deferred as optional.

---

## Manual sign-off bar

**Scenario selection (multi-select):** Wyatt initially chose only "Mobile Safari (iPhone) quick play"; on the follow-up (iPhone needs a LAN link to the Mac since the branch isn't deployed and the public site is still v1.0), he switched to **"Desktop Safari instead (no phone setup)."**

| Follow-up option | Description | Selected |
|--------|-------------|----------|
| iPhone via Mac-over-WiFi link | LAN link to Mac server; quick iPhone solo game | |
| Desktop Safari instead (no phone setup) | Full solo game in desktop Safari on the Mac | ✓ |
| Both iPhone + desktop Safari | Max coverage | |

**User's choice:** One full desktop Safari solo playthrough (start → end-of-voyage); storm already re-verified in Phase 11. No iPhone/iPad/Safari-MP.
**Notes:** Claude covers all Chrome (solo + MP) and drives the MP recovery matrix; Wyatt owns only the Safari surface no tool can drive.

## Claude's Discretion

- Determinism corpus depth: keep the current 30-seed baseline for v1.1; targeted storm/battle/recovery fixtures are optional future hardening.
- E2E checklist scenario details, assertion mechanics (`window.__pp_*` hooks), and markdown-vs-thin-script form of the verification driver.

## Deferred Ideas

- Committed auto-running Playwright E2E suite (system Chrome) — post-milestone backlog.
- Real two-device multiplayer playtest with a friend — optional confidence booster.
- Mobile Safari (iPhone) / iPad playtests — needs LAN serving; not a v1.1 target.
- Expanded determinism corpus stressing storms/battles/recovery — optional future hardening.
