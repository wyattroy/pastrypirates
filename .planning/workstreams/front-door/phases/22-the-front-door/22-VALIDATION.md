---
phase: 22
slug: the-front-door
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-31
---

# Phase 22 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `22-RESEARCH.md` § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None. Zero-dependency project by design — no Playwright/Puppeteer/Jest. Browser verification is manual/MCP-driven per `docs/VERIFICATION-CHECKLIST.md` and `docs/DRIVING-THE-GAME.md`. |
| **Config file** | none — and Wave 0 does **not** install one (see Wave 0 Requirements) |
| **Quick run command** | `npm test` (19-script regression chain) |
| **Full suite command** | `npm test` + the manual browser pass in Manual-Only Verifications |
| **Estimated runtime** | ~15s for `npm test`; ~10 min for the full manual browser pass |

**Critical caveat (RESEARCH.md Pitfall 4):** `npm test` covers engine/net/narration invariants this
phase does not touch. It is a **regression floor, not a verification of this phase's new surface.**
In particular `scripts/no_undef_check.js` **cannot** catch a leftover `$("pname")` reference — `$`
stays declared, so a dangling read passes `npm test` green and only surfaces on manual click-through.
Grep checks below exist specifically to close that hole.

---

## Sampling Rate

- **After every task commit:** run the two grep guards (near-instant, catch the two highest-risk regressions):
  - `grep -rn '"pname"' index.html src/` → must return **zero** hits after the removal task lands
  - `grep -n 'max-image-preview\|"image":' index.html` → must still match META-01's two lines
  - plus `npm test` when the task touched `src/`
- **After every plan wave:** full `npm test` + one browser click-through of all four mode cards
  after `localStorage.clear()` (per `docs/DRIVING-THE-GAME.md:24-28`)
- **Before `/gsd-verify-work`:** `npm test` green, all six success-criterion checks below run against
  a **local** server (never `playpastrypirates.com` — `docs/DRIVING-THE-GAME.md:336-339`), and both
  human approval gates (D-09, D-11) recorded
- **Max feedback latency:** ~15s automated; manual browser pass is the gate, not the loop

---

## Per-Task Verification Map

> Seeded at plan time from the requirement→verification map in `22-RESEARCH.md`.
> Task IDs are filled in by `/gsd-validate-phase` once plans exist; the Requirement / Test Type /
> Automated Command columns are already determined and should not drift.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | 1 | FIX-01 (SC2) | T-22-01 (XSS via typed name) | Modal writes the **raw** trimmed string to state; escaping stays at the single render-time `escHtml` chokepoint (`src/ui/util.js:216-220`). No second escape at write time. | grep + manual | `grep -rn '"pname"' index.html src/` → 0 hits | ✅ | ⬜ pending |
| TBD | TBD | 1 | FIX-01 (SC1) | — | N/A | manual browser | four-card click-through after `localStorage.clear()` | ✅ | ⬜ pending |
| TBD | TBD | 1 | FIX-01 (SC2) | — | N/A | manual browser | `window.__pp_app_state_debug()` → `roster[0].name` matches typed name exactly once | ✅ | ⬜ pending |
| TBD | TBD | 2 | ABOUT-01 (SC3) | T-22-02 (Ko-Fi iframe origin) | If the Ko-Fi embed is duplicated into `about.html`, it carries the **same** `sandbox="allow-scripts allow-forms allow-popups allow-same-origin"` attribute as `src/ui/lobby.js:71-79`, not a looser one. | manual browser | load `about.html`, confirm rules + screenshot + credits + Ko-Fi render, console clean | ❌ (about.html new) | ⬜ pending |
| TBD | TBD | 2 | ABOUT-01 (SC4) | — | N/A | manual diff | About rules copy differs deliberately from `index.html` How-To-Play; uses "Isle of Tortuga", never "Barbados" | ❌ | ⬜ pending |
| TBD | TBD | 2 | ABOUT-02 (SC5) | — | N/A | manual browser + curl | both About links resolve; `curl -I <local>/about.html` → 200 | ❌ | ⬜ pending |
| TBD | TBD | 2 | META-01 (SC6) | — | N/A | grep | `grep -n 'max-image-preview\|"image":' index.html` matches baseline | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

There is no test framework this phase's new surface plugs into, and none should be installed —
zero dependencies is a project design constraint. The Wave 0 equivalent here is **procedural**:

- [ ] **Fix `docs/DRIVING-THE-GAME.md:40` and `:190` before attempting D-11's screenshot capture.**
      Both recipes set `#pname` directly; both go stale the moment the field is removed, and one of
      them is the exact recipe the screenshot-capture session must follow (RESEARCH.md Pitfall 3).
      This must land in the **same plan/task that creates the modal**, so the doc and the modal never
      drift apart.
- [ ] No test-file stubs needed.
- [ ] No shared fixtures needed.
- [ ] No framework install — by design.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Name modal opens before each of the four modes, pre-filled, and confirming proceeds into that mode's existing flow | FIX-01 (SC1) | No browser test framework exists; the behavior is a DOM interaction across four separate entry points | Start a local server on a **fresh, unused port** (`python3 -m http.server <port>`; Safari/Chrome cache ES modules — `docs/DRIVING-THE-GAME.md:11-22`). `localStorage.clear()`. Click Solo → confirm modal → confirm the solo game starts. Repeat for Host a Crew, Join a Crew, Pass & Play. `read_console_messages` must show zero errors at each step. |
| No name doubling ("Crustbeard – Crustbeard") in the captains panel | FIX-01 (SC2) | The regression is visual/state-level, and the guard is a debug hook, not an assertion | After starting a game with a modal-confirmed name, read `window.__pp_app_state_debug()` → `roster[0].name`; it must equal the typed string exactly once. Visually confirm the captains panel renders the name once. |
| `about.html` contains rules, a mid-game screenshot, credits, and a working Ko-Fi button | ABOUT-01 (SC3) | Static page rendering; no assertion surface | Load `about.html` directly **and** via the homepage link. Confirm all four elements render, console is clean, and the screenshot is the D-11-selected mid-game frame — not a placeholder. |
| About rules are deliberately distinct copy, not a third accidental divergent copy | ABOUT-01 (SC4) | Editorial judgement; D-09 is a human sign-off gate | Read-diff About's rules section against the How-To-Play modal text (`index.html:912-936`). Confirm deliberate difference per D-08 and "Isle of Tortuga" (not "Barbados", per RESEARCH.md Pitfall 5). **Record D-09 sign-off.** |
| Both About links navigate correctly | ABOUT-02 (SC5) | Two links live on different surfaces with different visibility rules | From a fresh `index.html` load click the welcome-screen About link. Separately, start a game (the footer `#footerRow` lives inside `#game` and is `display:none` until then — `index.html:1077`) and click the footer About link. |
| Escape-key dismissal confirms-and-proceeds (does not cancel) | FIX-01 / D-02 | New machinery — **there is no Escape handling anywhere in the codebase today** (RESEARCH.md); nothing to regression-test against | Open the modal, press Escape. The modal must close **and the mode's flow must proceed** with the pre-filled name — not cancel back to the welcome screen. Repeat for backdrop click and the X control. |

---

## Validation Sign-Off

- [ ] All tasks have an `<automated>` verify (grep guard or `npm test`) or an explicit Manual-Only row
- [ ] Sampling continuity: no 3 consecutive tasks without an automated verify — the two grep guards
      run after every commit, so this holds by construction
- [ ] Wave 0 procedural item (`docs/DRIVING-THE-GAME.md` fix) landed in the modal-creating task
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s automated
- [ ] Human approval gates recorded: **D-09** (About copy sign-off) and **D-11** (screenshot selection)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
