---
phase: 20
slug: the-board-comes-alive
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-02
---

# Phase 20 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `20-RESEARCH.md` §Validation Architecture. Do not re-derive — correct there first.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Custom Node scripts — no Jest/Vitest/Mocha. Plain `console.log`, `process.exit(failures?1:0)`, one PASS/FAIL line per assertion. Convention shared across `scripts/*_check.js` / `scripts/*_test.js`. |
| **Config file** | None — each script is standalone, chained from `package.json`'s `"test"` script (`package.json:7`) |
| **Quick run command** | `node scripts/wind_dot_contract_check.js` |
| **Full suite command** | `npm test` (chains ~20 scripts) |
| **Estimated runtime** | Quick ~1s · full suite ~20s |

---

## Sampling Rate

- **After every task commit:** `node scripts/wind_dot_contract_check.js`
- **After every plan wave:** `npm test`
- **Before `/gsd-verify-work`:** Full suite green
- **Max feedback latency:** ~20 seconds

**Two human gates the suite cannot substitute for:**
1. **Wyatt's D-07/D-29 tuning-page sign-off** — dots do not ship until he approves the numbers.
2. **A real-Safari pass** — REQUIREMENTS.md milestone constraint 2 requires it for any always-on
   wind-layer work. Wyatt runs it on his own machine.

---

## ⚠ Two deterministic `npm test` breaks live inside already-locked decisions

Both were found by reading `scripts/wind_dot_contract_check.js` line by line, not inferred. Neither is
a real defect — each is the existing guard asserting something Phase 20 deliberately changes. **Both
edits must land in the same commit as the change that trips them**, or the suite goes red for reasons
unrelated to any bug.

| # | Locked decision | What breaks | Required guard edit |
|---|---|---|---|
| 1 | **D-04** — dots get a soft edge via a static `radial-gradient` | Assertion 2's blanket `"gradient"` ban fires | Narrow assertion 2 to the terms BUG-01 actually involved (live/animated gradients, `mask-position`, `filter: blur()`) — a static, once-rasterized `radial-gradient` is explicitly permitted by D-04 and is **not** the BUG-01 pattern |
| 2 | **D-06** — the prototype ships always-on; `WIND_PROTOTYPE_ENABLED_DEFAULT` is deleted | Assertion 5's off-by-default check fails permanently | Remove or repurpose assertion 5. D-06 also warns the guard **must not be left silently passing over deleted code** — retire it deliberately or re-point it at the shipped region. |

---

## Per-Task Verification Map

| Req | Behavior | Test Type | Automated Command | File Exists |
|-----|----------|-----------|-------------------|-------------|
| WIND-01 | `windDotSpecs`/`windDotFrame` extended with `period` + `size` stay reproducible, seed-sensitive, bounded | unit (pure-math) | `node scripts/wind_dot_contract_check.js` (assertion 6 — generic, does not check exact field names) | ✅ extends automatically |
| WIND-01 | Compositor-only contract holds over the **shipped** region incl. the new static radial-gradient | unit (mechanical scan) | same, assertion 2 | ⚠️ needs the narrowing edit above |
| WIND-01 | Always-on default (D-06) does not regress to off-by-default | unit (mechanical) | same, assertion 5 | ⚠️ needs the removal/repurpose edit above |
| WIND-02 | Speck arc-waypoint derivation + per-frame position are reproducible / seed-sensitive / bounded | unit (pure-math) | ❌ new: `scripts/wind_speck_test.js`, mirroring assertion 6's pattern | ❌ **Wave 0** |
| WIND-03 | Each whirlpool's seeded rotation duration lands in [8,12]s and is reproducible for a seed | unit (pure-math) | ❌ new: pure `whirlDurationSec(seed,idx)` test | ❌ **Wave 0** |
| WIND-04 | Scent selection — no two consecutive direction-change rounds share a category, all 7 categories reachable, **zero RNG draws** | unit (pure-function) | ❌ new: assert against a real mixed `held`/`!held` round sequence, **not** consecutive integers | ❌ **Wave 0** |
| WIND-05 | `sailHighlightRect` rim-variant + `sailGhostBoats` distinct-head de-dup give identical host and guest output for the same `cells`/`seat` | unit (pure-function) | `node scripts/host_guest_parity_check.js` — existing script already asserts `sailHighlightRect` parity; add assertions | ⚠️ existing file, new assertions |
| D-02 | `windDotsTick` / `windDotsApplyPendingDirection` export cleanly; pending-angle defer survives rapid repeated direction changes | unit (smoke) | ❌ new, or extend `wind_dot_contract_check.js`'s pure-math section | ❌ **Wave 0** |
| D-02 (visual) | The fade actually overlaps narration typing on screen | **manual-only, justified** | Chrome sequencing capture (`docs/DRIVING-THE-GAME.md` — the sequencing technique, **not** the §8a cost-measurement half) + Wyatt's eyeball pass. Precedent: `19-VERDICT.md` was measured by eye because the question was "does this stutter or pop", which is a judgement, not a number. | — |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/wind_speck_test.js` — WIND-02's pure geometry + frame functions (or a widened region in `wind_dot_contract_check.js`)
- [ ] A pure `whirlDurationSec(seed,idx)`-style test — WIND-03's seeded duration draw
- [ ] A scent-derivation test asserting no-repeat-category across **real** round sequences — WIND-04
- [ ] New assertions in `scripts/host_guest_parity_check.js` for the rim-variant highlight and `sailGhostBoats` — WIND-05
- [ ] `wind_dot_contract_check.js` assertion 2 narrowed **and** assertion 5 removed/repurposed — **required, not optional** (see the table above)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| The dots, speck density and whirlpool speed "feel right" | WIND-01/02/03 (D-07, D-29) | Taste. The numbers are Wyatt's to pick; no assertion can stand in for that. | Build the tuning page, then **send him the URL with its port in the same message that asks him to look at it.** The numbers he lands on become the shipped constants. |
| The dot fade overlaps the round line typing out | D-02 | A timing judgement — "does it pop" is not a threshold | Chrome sequencing capture + his own eyes |
| A full voyage stays smooth in real Safari with the layer always on | REQUIREMENTS.md constraint 2 | Needs real Safari on real hardware | Wyatt runs it. Phase 19 precedent: `19-VERDICT.md`. |
| The rim warning reads as "you will be swept" without a legend | WIND-05 (D-12, D-13) | Comprehension, not correctness | Playtest |

---

## Security Domain

`security_enforcement` on, `security_asvs_level: 1`. **This phase has effectively no attack surface:**
no new user input, no new network payload, no new auth surface, and per D-21 no engine change at all.

| ASVS Category | Applies | Note |
|---------------|---------|------|
| V2 Authentication | No | No auth surface touched |
| V3 Session Management | No | Unrelated |
| V4 Access Control | No | Bots and humans already identical (D-27); nothing changes who can do what |
| V5 Input Validation | No new surface | WIND-04's scent derives purely from engine-controlled event fields (`dir`, `round`, `streak`, `windStreak`) — never player-supplied text, no injection surface. Ghost-boat/rim logic reads only engine-built `rim`/`rimHead`. |
| V6 Cryptography | No | Unrelated |

**Two non-traditional threats this codebase does treat seriously:**

| Pattern | Mitigation |
|---------|-----------|
| **Host/guest presentation drift** — a guest sees a materially different board than the host | The shared-builder pattern: `sailHighlightRect` / `sailGhostBoats` are the ONE function each transport calls. Mechanically gated by `scripts/host_guest_parity_check.js`. This function was extracted (G25) *because the two paths had already forked once.* |
| **Determinism-fixture invalidation from an accidental engine RNG draw** | D-21/D-22's private-`mulberry32`-only rule, gated by `wind_dot_contract_check.js` assertion 3 |

No `checkpoint:human-verify` package-installation gate is needed — no packages are installed.

---

## Validation Sign-Off

- [ ] All tasks have an `<automated>` verify or a Wave 0 dependency
- [ ] Sampling continuity: no 3 consecutive tasks without an automated verify
- [ ] Wave 0 covers all ❌ MISSING references above
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] The two guard edits landed in the same commits as the changes that trip them
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
