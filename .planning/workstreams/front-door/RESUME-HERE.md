# RESUME HERE — Phase 22 overnight run

**Updated:** 2026-08-01 ~02:45 ET
**Worktree:** `/Users/wyattroy/Documents/Projects/pastrypirates/.claude/worktrees/gsd-plan-phase-22-2a6acf`
**Branch:** `claude/gsd-plan-phase-22-2a6acf` · **Workstream:** `front-door`
**Pass `--ws front-door` on every GSD command.**

> Read `MORNING-BRIEFING.md` next to this file for the human-readable version.
> Check `*-SUMMARY.md` files on disk before trusting any status line — a SUMMARY.md is the
> ground truth that a plan finished.

---

## Status

| Plan | What | Status |
|------|------|--------|
| plan-phase | 5 plans, checker PASSED, 4/4 reqs + 11/11 decisions covered | ✅ done |
| 22-01 | Name modal after mode pick (FIX-01) | ✅ done + browser-verified |
| 22-02 | `about.html` (ABOUT-01) | ✅ done + browser-verified (+1 CSS bug found & fixed) |
| 22-03 | Both About links + META-01 close-out (ABOUT-02, META-01) | ✅ done + browser-verified |
| 22-04 | Screenshot | ⏸ **task 1 done — 5 candidates committed. STOPPED at task 2 = D-11, Wyatt's pick.** |
| 22-05 | Copy sign-off (D-09) | ⬜ not started — gated on Wyatt |

All 7 entries in `.planning/WINDOWS.md` are `fixed`; `open_count: 0`.

## Next action

**Do not proceed past 22-04 task 2 without Wyatt.** It is a `checkpoint:decision` and auto-mode is
OFF (verified: `check auto-mode` → `active: false`). Keep it off — that is what stops an executor
choosing a screenshot for him.

When he has chosen a candidate, resume:
```
/gsd-execute-phase 22 --ws front-door
```
22-04 task 3 installs the chosen frame as `assets/about-screenshot.jpg`, updates the `<img>` in
`about.html` to match its real intrinsic dimensions, and removes the `TODO(D-11)` marker. Then
22-05 handles the D-09 copy sign-off and removes the two `TODO(D-09)` markers.

## What's waiting on Wyatt

- **D-11 — pick a screenshot.** 5 candidates in `assets/about-candidates/`, all 1200×663, all from
  a genuinely played game (round 7, stopped before end-of-voyage per D-10). See the briefing for
  per-candidate descriptions and the centre-vs-compass crop trade-off.
- **D-09 — sign off the About copy.** Draft is live, marked `TODO(D-09)` ×2 in `about.html`.

## Rules that carry over — do not relearn these the hard way

1. **Verify browser behavior yourself.** Executor subagents have no browser tools and will file
   `unrun-verify` windows instead of checking. The coordinator has Chrome tools — run the check and
   close the window. This caught a real CSS bug that every automated gate missed.
2. **Always a FRESH server port.** Chrome caches ES modules; reusing a port serves stale code.
   Ports burned so far: 8523, 8531, 8537, 8543, 8557, 8571. Never verify against
   `playpastrypirates.com`.
3. **Clear `localStorage` before every probe.** A resumed solo game from a previous probe will hide
   the lobby and make the welcome screen look broken. This cost ~10 minutes tonight.
4. **The browser window is occluded**, so Chrome throttles timers ~3.6×. `setInterval` drivers
   nearly stall. Drive the game by calling a step function in a bounded loop from the tool call
   instead, and keep each call under ~30s or CDP times out.
5. **Screenshots can't reach disk directly** — the MCP `save_to_disk` flag lands nowhere readable
   and browser downloads don't arrive either. What worked: rasterise the board SVG in-page (inline
   the 27 referenced assets as data URIs first, or it renders blank), then POST the JPEG blob to a
   tiny local Python receiver. That receiver is stopped now; recreate it if more captures are needed.
6. **Rename any tab you drive** to `🤖 CLAUDE IS USING THIS`, and back when you stop.
7. **`npm test` is ALREADY RED** for an unrelated archived-path reason — 21/22 groups pass. Gate on
   the named subset: `no_undef_check`, `module_graph_check`, `ui_contract_check`,
   `state_contract_check`, `determinism_baseline --verify`. Don't fix it inside Phase 22; it has
   its own todo.
8. **Never touch `src/engine/index.js`** (milestone-wide v1.3 constraint).
9. **Stay out of `index.html`'s `<style>` block** — Phase 18 owns it concurrently.
10. **CLAUDE.md's architecture section is stale** — trust `22-RESEARCH.md` / `22-PATTERNS.md`.
11. Zero dependencies, no build step, vanilla HTML/CSS/JS, Safari **and** Chrome.

## Known environmental limit

*Host a Crew* cannot be exercised end-to-end here — `appState.db` never initialises, so Firebase
room creation never completes. **Verified identical on the pre-22-01 baseline** (commit `5cb50ba`),
so it is environmental, not a regression. Needs one real networked session from Wyatt.

## Tooling landmine

`gsd-tools query state.record-metric --ws front-door` **corrupts** this workstream's STATE.md
frontmatter (turns `current_plan` into a string, resets `percent` to 0) — the workstream STATE.md
uses a body format its parser doesn't recognise. `roadmap.update-plan-progress` and
`requirements.mark-complete` are fine. Check the frontmatter after any state tooling call.
