---
phase: 10
slug: app-state-de-globalization
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-24
---

# Phase 10 — Validation Strategy

> Seeded from `10-RESEARCH.md` § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — custom Node scripts wired through `npm test`, same convention as Phases 7–9 |
| **Config file** | `package.json`'s `test` script (chained `&&`) |
| **Quick run command** | `node scripts/state_contract_check.js` (new this phase) |
| **Full suite command** | `npm test` (determinism + engine-contract + dlog-replay + net-registry + net-contract + the new state-contract) |
| **Estimated runtime** | <15s headless; the Chrome click-through is separate |

---

## Sampling Rate

- **After every task commit:** `node scripts/state_contract_check.js`
- **After every wave:** `npm test`
- **Phase gate:** full suite green **and** the D-10 Chrome click-through (solo + two-tab), before `/gsd-verify-work`
- **Max feedback latency:** 30s

---

## Per-Requirement Verification Map

| Req ID | Behavior | Test Type | Command | Infra |
|--------|----------|-----------|---------|-------|
| GLOBAL-01 | None of the 46 app-state names has a leftover top-level `let/const/var` in the classic region; `state.`-prefixed everywhere expected | contract | `node scripts/state_contract_check.js` | ❌ W0 |
| GLOBAL-01 / D-06 | Determinism corpus 30/30 green after migration (corpus-blind for pure app-state control flow — necessary, not sufficient) | regression | `node scripts/determinism_baseline.js --verify` | ✅ P7 |
| GLOBAL-02 | The 1 inline `onclick="revealMyRecipe()"` fires; representative closures (createRoom, joinRoom, startGame, sendResponse, leaveGame, toggleTimer) click through clean | **behavioural, Chrome** | Chrome MCP click-through | ❌ W0 |
| GLOBAL-02 | Full solo game, clean console (no new no-undef/ReferenceError) | **behavioural, Chrome** | Chrome MCP solo playthrough | ❌ W0 |
| GLOBAL-02 | Two-tab multiplayer still syncs (Phase 9 harness + render-only-guest note) | **behavioural, Chrome** | Chrome MCP two-tab | ❌ W0 (harness exists) |
| GLOBAL-03 | No new ad-hoc `window.__pp_*` outside the documented 4-name set | contract | `node scripts/state_contract_check.js` | ❌ W0 |

---

## Wave 0 Requirements

- [ ] **`scripts/state_contract_check.js`** — new standing gate, mirroring `engine_contract_check.js`/`net_contract_check.js` (multiple named assertions, one run reports all failures). Four assertions:
  1. **No leftover declaration** — none of the 46 names has `^(const|let|var)\s+NAME\b` in the classic region.
  2. **No leftover bare usage** — zero `\bNAME\b` in the classic region not immediately preceded by `state.`, scoped to code (not string/comment content). **Reuse the migration's own tokenizer — do not write a second parser, and do not comment-strip** (`index.html` carries `https://schema.org` JSON-LD and Firebase CDN `https://` `<script src>` tags; a file-wide stripper hits the `://` false-negative D-11 flags).
  3. **Debug-hook allowlist** — every `window.__pp_*` assignment in `src/main.js` matches the hardcoded set `{__pp_module_ok, __pp_boot_count, __pp_net_debug, __pp_app_state_debug}`; any other fails.
  4. **`src/state/` purity** — no `document`/`window`/`firebase`/`localStorage`/`Date.now`/`Math.random`/`globalThis`/`new Function` in the module (reuse the engine purity assertion).
- [ ] Wire `state_contract_check.js` into the `package.json` `test` chain after `net_contract_check.js`.
- [ ] `docs/MODULES.md` — add a `src/state/` section and a "Standing browser debug hooks" table listing all four `window.__pp_*` names (GLOBAL-03 doc requirement).
- [ ] Framework install: **none**

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Instructions |
|----------|-------------|------------|--------------|
| Handlers fire after de-globalization | GLOBAL-02 | Needs a live DOM + click dispatch | Chrome: load over HTTP, fire `revealMyRecipe` via its inline attribute, click through createRoom/joinRoom/startGame/sendResponse/leaveGame/toggleTimer. Console must stay clean (no `no-undef`/`ReferenceError`). Drive via `dispatchEvent(new MouseEvent(...))` on real handler elements (avoids pixel misclicks — the Phase 9 lesson). |
| Full solo game | GLOBAL-02 / criterion 4 | Live browser | Play a solo game to end-of-voyage; console clean throughout. |
| Two-tab multiplayer | criterion 4 | Two live tabs + Firebase | Reuse the Phase 9 harness: distinct `pp_id` per tab, set sequentially. **Read the rendered CAPTAINS panel, not `game.players[].pos`** — guests are render-only, their local `game` is intentionally stale (the Phase 9 finding). |

**Safari not required here** (roadmap schedules it at Phase 11 + 12).

---

## Migration-Specific Hazards (what the tokenizer must handle)

Research empirically confirmed a blind `sed` migration corrupts real code:

1. `$("game")` — a DOM id lookup (6 occurrences); "game" here is a string literal, must NOT become `$("state.game")`.
2. `"Pirated for the love of the game."` — UI copy at `index.html:1069`; "game" in prose, must NOT be touched. A quote-boundary regex catches #1 but not #2 — **a tokenizer-aware migration is mandatory, not a lookaround regex.**
3. `revealMyRecipe` (index.html:4309) is a `function` declaration → stays a `window` property automatically; only its one body reference migrates. The inline `onclick="revealMyRecipe()"` keeps working for free.
4. `timer` (index.html:864) may be a live `setInterval`/`setTimeout` handle — confirm `clearInterval(state.timer)` correctness after migration (Open Question 2).

---

## Validation Sign-Off

- [ ] All tasks have an automated verify or a Wave 0 dependency
- [ ] `state_contract_check.js` proven able to fail (red-proof drill — the 08-04/09 precedent caught real checker bugs)
- [ ] `npm test` green including the new script
- [ ] Chrome click-through transcript (solo + two-tab) recorded verbatim in the plan SUMMARY
- [ ] Determinism corpus still 30/30 and still 1 commit deep (never `--capture`)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
