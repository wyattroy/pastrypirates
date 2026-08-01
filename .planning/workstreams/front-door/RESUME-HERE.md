# RESUME HERE — Phase 22 overnight run

**Written:** 2026-08-01 (updated as work progresses)
**Worktree:** `/Users/wyattroy/Documents/Projects/pastrypirates/.claude/worktrees/gsd-plan-phase-22-2a6acf`
**Branch:** `claude/gsd-plan-phase-22-2a6acf`
**Workstream:** `front-door` — **pass `--ws front-door` on every GSD command.**

> This file exists so a fresh session can pick up precisely where the last one stopped, without
> re-reading the whole transcript. Check `*-SUMMARY.md` files on disk before trusting any status
> line below — a SUMMARY.md is the ground truth that a plan finished.

---

## Where things stand

| Plan | What it does | Status |
|------|--------------|--------|
| — | `/gsd-plan-phase 22 --ws front-door` | ✅ **complete** — 5 plans, checker PASSED, 4/4 reqs + 11/11 decisions covered |
| 22-01 | Name modal after mode pick (FIX-01) | ✅ **complete + browser-verified** |
| 22-02 | `about.html` — rules, credits, Ko-Fi, screenshot slot (ABOUT-01) | ⬜ **NEXT** |
| 22-03 | About links + META-01 close-out (ABOUT-02, META-01) | ⬜ pending (wave 2, needs 22-01 + 22-02) |
| 22-04 | Screenshot capture → **Wyatt picks (D-11)** | ⛔ **GATED — do not decide for him** |
| 22-05 | Copy sign-off (**D-09**) | ⛔ **GATED — do not decide for him** |

## Next action

Spawn a `gsd-executor` for **22-02** (sequential, on the main working tree — worktree isolation
auto-degraded because `origin/HEAD` is unresolved). Then 22-03. Then STOP at 22-04's checkpoint.

## Rules that carry over — do not relearn these the hard way

1. **The two gates are Wyatt's, not yours.** D-11 (which screenshot) and D-09 (About copy sign-off).
   Build everything around them; leave greppable `TODO(D-09)` / `TODO(D-11)` placeholders; stop at
   the checkpoint. Auto-mode is OFF and must stay off, which is what keeps the executor from
   choosing for him.
2. **Verify browser behavior yourself.** Executor subagents have no browser tools and will file
   `unrun-verify` windows instead. The coordinator has Chrome tools — use them and close the window.
3. **Always a FRESH server port.** Chrome and Safari cache ES modules; reusing a port serves stale
   code and produces confident wrong results. Ports already burned this session: 8523, 8531, 8537,
   8543. Never verify against `playpastrypirates.com`.
4. **Rename any tab you drive** to `🤖 CLAUDE IS USING THIS`, and rename it back when you stop.
5. **`npm test` is ALREADY RED** and it is not your fault — `scripts/narration_audit_check.js`
   assertion 10 reads a dispositions file archived to `.planning/milestones/v1.2-phases/`.
   21/22 groups pass. Gate on the named subset instead: `no_undef_check`, `module_graph_check`,
   `ui_contract_check`, `state_contract_check`, `determinism_baseline --verify`.
   Captured as its own todo — do not fix it inside Phase 22.
6. **Never touch `src/engine/index.js`** or change what it emits (milestone-wide v1.3 constraint).
7. **Stay out of `index.html`'s `<style>` block** — Phase 18 owns it concurrently. Phase 22 owns
   the markup.
8. **CLAUDE.md's architecture section is stale** — it describes a monolithic `index.html`. The code
   is split into `src/`. Trust `22-RESEARCH.md` and `22-PATTERNS.md` for layout.
9. Zero dependencies, no build step, vanilla HTML/CSS/JS, must work in Safari and Chrome.

## Known environmental limit

*Host a Crew* cannot be exercised end-to-end in this browsing context — `appState.db` never
initialises, so Firebase room creation never completes. **Verified identical on the pre-22-01
baseline**, so it is environmental, not a regression. Do not chase it. It needs one real networked
session to confirm.

## Keep this updated

`.planning/workstreams/front-door/MORNING-BRIEFING.md` is what Wyatt reads when he wakes. Keep it
accurate — especially the "needs your decision" section.
