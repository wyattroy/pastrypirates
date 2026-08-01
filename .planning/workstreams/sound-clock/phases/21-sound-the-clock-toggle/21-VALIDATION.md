---
phase: 21
slug: sound-the-clock-toggle
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-31
---

# Phase 21 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `21-RESEARCH.md` § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Hand-rolled Node harness — no assertion library. `npm test` runs 18 scripts in sequence, each printing PASS/FAIL and exiting non-zero on failure |
| **Config file** | `package.json` → `scripts.test` (single source of truth for harness script order) |
| **Quick run command** | `node scripts/audio_mapping_test.js` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~seconds for the quick script; full suite dominated by the determinism gate |

**Stated limitation — do not paper over this.** The Node harness has no DOM and no audio
decode/playback capability. It can prove the sound-mapping table is complete and correctly shaped
and that the hard fences hold. It **cannot** prove a sound plays, fades, layers, or falls silent in
a real browser. That gap closes with a human browser pass, not with more Node scripts.

---

## Sampling Rate

- **After every task commit:** `node scripts/audio_mapping_test.js` + `node scripts/module_graph_check.js` — both fast and DOM-free
- **After every plan wave:** `npm test` (full suite, includes the determinism gate)
- **Before `/gsd-verify-work`:** full suite green **plus** a human browser pass covering every manual-only row below, in **both Chrome and Safari** — this project's standing compatibility requirement
- **Max feedback latency:** seconds for the quick script

---

## Per-Task Verification Map

> Task IDs fill in once PLAN.md exists. Requirement→behaviour rows are fixed here.

| Req | Behavior | Test Type | Automated Command | File Exists | Status |
|---|---|---|---|---|---|
| AUDIO-01 | All **25** real event types resolve to a known sfx name or an explicit intentional `null` — never `undefined`, never a throw | unit (DOM-free) | `node scripts/audio_mapping_test.js` | ❌ W0 | ⬜ pending |
| AUDIO-01 | Every sfx filename the mapping references exists in `sfx/` at non-zero size | unit (`fs.statSync`) | same script | ❌ W0 | ⬜ pending |
| AUDIO-01 | Storm dedup — a storm affecting N captains fires **once** (D-08) | unit, fabricated events | same script | ❌ W0 | ⬜ pending |
| AUDIO-01 | Sound actually plays, audibly, at the right moment | **manual-only** | browser, per `docs/DRIVING-THE-GAME.md` §5b armed-watcher | — | ⬜ pending |
| AUDIO-01 | Storm fades as the storm resolves; never hard-cuts, never drones (D-09) | **manual-only** | browser, listen through a full storm | — | ⬜ pending |
| AUDIO-01 | Flips layer rather than cut each other off during a fast battle (D-10) | **manual-only** | browser, drive a multi-round battle | — | ⬜ pending |
| AUDIO-02 | `pp_muted` follows the exact `pp_timerOff` write/read pattern | unit (source assertion) | `node scripts/audio_mapping_test.js` | ❌ W0 | ⬜ pending |
| AUDIO-02 | Mute persists across reload mid-game | **manual-only** | browser, reload mid-game | — | ⬜ pending |
| AUDIO-02 | Button visible beside the clock in all three modes; absent at end of voyage; mute still holds through the win screen (D-15/D-16) | **manual-only** | browser, solo + pass-and-play + multiplayer host & guest | — | ⬜ pending |
| AUDIO-03 | Luis credited for sound in `#creditsModal`, no duplicate entry | manual (visual) + copy-gate review | record against `copy-shipped-vs-approved-gate.md` | — | ⬜ pending |
| FIX-02/N-03 | Timer off stops the clock instantly; on re-arms the current turn (D-17/D-18) — identical in all three modes | **manual-only** | browser: play a full turn flipping the toggle **both ways** in each mode | — | ⬜ pending |
| FIX-02/N-03 | No mode shows a greyed, non-functional toggle (D-20) | **manual-only** | browser, all three modes | — | ⬜ pending |
| **Hard fence** | `src/engine/index.js` unchanged — the milestone constraint actually held | ✅ automated, exists | `npm test` → determinism gate | ✓ | ⬜ pending |
| **Hard fence** | New audio module respects tier layering | ✅ automated, exists | `node scripts/module_graph_check.js` (auto-covers new files) | ✓ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/audio_mapping_test.js` — DOM-free, mirrors `scripts/narration_test.js`'s import style. Asserts: all 25 event types map to a known sfx or explicit `null`; every referenced file exists in `sfx/`; flip seam and storm-dedup exercised with fabricated events.
  - **Design constraint this imposes on the implementation:** factor the mapping table and dispatch lookup so they are importable **without** constructing a live `AudioContext`. If the lookup can only be reached through audio-graph side effects, none of the above is testable.
- [ ] Register the new script in `package.json` → `scripts.test`
- [ ] No fixtures needed for the timer refactor — see accepted gap below

---

## Manual-Only Verifications

| Behavior | Req | Why Manual | Test Instructions |
|---|---|---|---|
| Every audible behaviour — plays, fades, layers, mutes, goes quiet in a background tab | AUDIO-01/02 | No headless audio assertion exists in this project; the harness has no DOM | Drive a solo and a two-window multiplayer game per `docs/DRIVING-THE-GAME.md`; listen. Chrome **and** Safari |
| Timer toggle parity across three modes | FIX-02/N-03 | `applyTimerOff()` calls `setClockUI()`, which touches the DOM. Automating needs a `document` stub — out of scope at this phase's size | Play a full turn in each mode, flipping the toggle **off and back on** mid-turn. Confirm the turn can still end |
| Safari audio behaviour under a storm | AUDIO-01 | Safari is where this project's worst bug lived (BUG-01, storm-overlay near-crash). A storm sound firing alongside the storm animation is untested territory | Force a storm in Safari, confirm no jank or crash with sound on |

**Accepted gap, recorded not hidden:** the timer-toggle refactor has no headless-testable surface
without a DOM stub. This is Wyatt's own D-18 note made operational — *"the failure mode is a
game-freezing regression in two modes, found only by playing a full turn with the toggle flipped
both ways."* Treat the manual check as mandatory, not optional.

---

## Validation Sign-Off

- [ ] All tasks have automated verify or a Wave 0 dependency
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Human browser pass complete in **both** Chrome and Safari
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
