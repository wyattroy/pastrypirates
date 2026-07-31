---
phase: 15-narration-audit-fixes
plan: 02
subsystem: ui
tags: [narration, timing, chat-bubbles, pacing]

# Dependency graph
requires: ["15-01"]
provides:
  - "CHAT_BUBBLE_HOLD_MULTIPLIER and chatBubbleHoldMs() in src/ui/util.js — a chat-bubble-specific hold curve, independent of the shared narration curve"
  - "10%-cut MSG_HOLD_MULTIPLIER (0.72) and BOT_MSG_HOLD_MULTIPLIER (0.45), stacking on v1.0's own 20% cut"
  - "Pure-function timing assertions for all three hold curves (numeric relationship, NARR-06 empty, NARR-06 encoding, D-15 invariant) in scripts/narration_test.js"
affects: [15-03, 15-04, 15-05, 15-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Named pacing constant, never an inline literal — CHAT_BUBBLE_HOLD_MULTIPLIER follows the exact house convention already established by MSG_HOLD_MULTIPLIER/BOT_MSG_HOLD_MULTIPLIER/SHIP_GLIDE_MS"
    - "A hold curve's cut is always applied to the CLAMPED result, so the floor and cap scale with it uniformly instead of leaving short messages stuck at an unchanged floor"
    - "Test-computed 'old' values via a parameterized holdFormula() helper (base/per-char/pause/clamp + multiplier), never hardcoded from memory — so the 0.9x relationship is mechanically enforced against the documented formula, not a magic number"

key-files:
  created: []
  modified:
    - src/ui/util.js
    - src/ui/panel.js
    - scripts/narration_test.js

key-decisions:
  - "CHAT_BUBBLE_HOLD_MULTIPLIER set to 0.8 (msgHoldMs's pre-Phase-15 value), not 1.0 — per the plan's explicit <planner_correction>, since showChatBubble already rode the shared curve's 0.8 multiplier before this plan; 1.0 would have made every bubble hold 25% longer than today, a change D-15 never asked for"
  - "Both hold multipliers take the identical 0.9 ratio (0.8->0.72, 0.5->0.45) so the human and bot narration curves stay in proportion to each other, per D-14's literal reading"

requirements-completed: [NARR-06]

coverage:
  - id: D1
    description: "Chat bubbles run on their own named hold curve (chatBubbleHoldMs/CHAT_BUBBLE_HOLD_MULTIPLIER), holding for exactly the same duration they held before this plan; showChatBubble's fade timer is repointed to it, flash() keeps consuming the shared msgHoldMs curve, REVEAL_MS_PER_CHAR is untouched"
    requirement: "NARR-06"
    verification:
      - kind: unit
        ref: "node -e 'import(\"./src/ui/util.js\")...' — chatBubbleHoldMs(t) equals the pre-change msgHoldMs(t) formula for a sample sentence"
        status: pass
      - kind: unit
        ref: "awk '/export function showChatBubble/,/^}/' src/ui/panel.js | grep -c 'chatBubbleHoldMs(' — returns 1"
        status: pass
      - kind: unit
        ref: "awk '/export async function flash/,/^}/' src/ui/panel.js | grep -c 'msgHoldMs' — returns 1"
        status: pass
      - kind: unit
        ref: "grep -c 'REVEAL_MS_PER_CHAR=20' src/ui/panel.js — returns 1"
        status: pass
    human_judgment: false
  - id: D2
    description: "Both narration hold multipliers are cut to exactly 0.9x their previous values (MSG_HOLD_MULTIPLIER 0.8->0.72, BOT_MSG_HOLD_MULTIPLIER 0.5->0.45), applied to the clamped result; CHAT_BUBBLE_HOLD_MULTIPLIER, REVEAL_MS_PER_CHAR, SHIP_GLIDE_MS, STORM_STEP_MS, and BOT_STORM_STEP_MS are all untouched"
    requirement: "NARR-06"
    verification:
      - kind: unit
        ref: "node scripts/narration_test.js — numeric-relationship, pinned-literal (2160/1170/2400), and D-15-invariant assertions"
        status: pass
      - kind: unit
        ref: "node -e '...' — direct msgHoldMs/botMsgHoldMs/chatBubbleHoldMs check against the documented formula with the new multipliers"
        status: pass
      - kind: unit
        ref: "grep -c 'REVEAL_MS_PER_CHAR=20' src/ui/panel.js && grep -c 'SHIP_GLIDE_MS=350' src/ui/util.js — both return 1"
        status: pass
    human_judgment: false
  - id: D3
    description: "msgHoldMs, botMsgHoldMs, and chatBubbleHoldMs each return a positive, clamped-floor integer for '', null, and undefined input — never NaN, zero, or negative"
    requirement: "NARR-06"
    verification:
      - kind: unit
        ref: "scripts/narration_test.js — 'NARR-06 empty' block: 9 checks (3 curves x 3 empty-ish inputs) plus 9 Number.isInteger/positivity checks"
        status: pass
    human_judgment: false
  - id: D4
    description: "A 20-astral-emoji string (String.length 40) and a 40-ASCII-character string produce the identical hold on all three curves — the curves measure UTF-16 code units, not grapheme clusters"
    requirement: "NARR-06"
    verification:
      - kind: unit
        ref: "scripts/narration_test.js — 'NARR-06 encoding' block: emoji sample String.length===40 assertion plus 3 equal-hold checks (one per curve)"
        status: pass
    human_judgment: false
  - id: D5
    description: "Perceptual confirmation: narration holds visibly shorter, chat bubbles hold exactly as long as before, in a live solo game plus a two-seat chat exchange"
    verification: []
    human_judgment: true
    rationale: "Timing 'feel' is a perceptual judgment that pure-function assertions cannot substitute for. Deferred to end-of-phase human verification per config.json's human_verify_mode: end-of-phase, alongside 15-01's own deferred two-tab addressed-narration check."

# Metrics
duration: 8min
completed: 2026-07-28
status: complete
---

# Phase 15 Plan 02: Cut Narration Hold 10%, Give Chat Bubbles Their Own Curve Summary

**Both narration hold curves (human and bot) now hold text for 10% less time via a stacking 0.9x cut on their existing multipliers, while chat bubbles were first split onto their own named hold curve so the cut cannot reach them — all three curves pinned by pure-function assertions covering the numeric relationship, empty/null/undefined input, and UTF-16 code-unit-length encoding.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-07-28T01:14:00Z
- **Completed:** 2026-07-28T01:22:00Z
- **Tasks:** 2
- **Files modified:** 3 (`src/ui/util.js`, `src/ui/panel.js`, `scripts/narration_test.js`)

## Accomplishments

- Added `CHAT_BUBBLE_HOLD_MULTIPLIER` (0.8) and `chatBubbleHoldMs(text)` to `src/ui/util.js`, mirroring `botMsgHoldMs`'s exact shape (same base/per-char/pause formula, same 1200/7000 clamp as the shared narration curve, multiplier applied to the clamped result).
- Repointed `showChatBubble`'s fade timer (`src/ui/panel.js`) from the shared `msgHoldMs` to the new `chatBubbleHoldMs` — bubbles now hold for exactly what they held before this plan, immune to the narration cut. `flash()`'s own default hold keeps consuming `msgHoldMs`; `REVEAL_MS_PER_CHAR` was never touched.
- Cut `MSG_HOLD_MULTIPLIER` (0.8 -> 0.72) and `BOT_MSG_HOLD_MULTIPLIER` (0.5 -> 0.45) — exactly 0.9x each, stacking on v1.0's own 20% cut, applied to the clamped result so the floor and cap scale with it uniformly. Extended the existing in-file comments to document this as a second, stacking cut rather than replacing the v1.0 history.
- Appended a headed assertion block to `scripts/narration_test.js` (Task 2) covering: the 0.9x numeric relationship on a pinned 40-code-unit sample (computed from the documented formula with the OLD multiplier, not hardcoded from memory); NARR-06 empty (`""`, `null`, `undefined` on all three curves, each returning a positive clamped-floor integer); NARR-06 encoding (a 20-astral-emoji string and a 40-ASCII-character string, both `String.length===40`, hold identically on all three curves); and the D-15 invariant restated across every sample string in the block (`chatBubbleHoldMs(t) > msgHoldMs(t)`).

## Task Commits

Each task was committed atomically:

1. **Task 1: Give chat bubbles their own hold curve (D-15)** - `fc68f74` (feat)
2. **Task 2: Cut both narration hold multipliers 10% and pin all three curves (D-14)** - `80fadd4` (feat)

**Plan metadata:** committed separately per `<final_commit>` step (see STATE.md/ROADMAP.md commit).

## Files Created/Modified

- `src/ui/util.js` - New `CHAT_BUBBLE_HOLD_MULTIPLIER`/`chatBubbleHoldMs()` export pair; `MSG_HOLD_MULTIPLIER` 0.8->0.72; `BOT_MSG_HOLD_MULTIPLIER` 0.5->0.45; comments extended (not replaced) on all three constants
- `src/ui/panel.js` - `showChatBubble`'s fade-timer hold call repointed to `chatBubbleHoldMs`; `chatBubbleHoldMs` added to the `./util.js` import list; `flash()` and `REVEAL_MS_PER_CHAR` unchanged
- `scripts/narration_test.js` - `msgHoldMs`/`botMsgHoldMs`/`chatBubbleHoldMs` added to the import list; new headed assertion block (numeric relationship, NARR-06 empty, NARR-06 encoding, D-15 invariant) appended before the final PASSED/FAILED summary

## Decisions Made

- `CHAT_BUBBLE_HOLD_MULTIPLIER` is `0.8`, not `1.0`, per the plan's explicit `<planner_correction>` — `15-PATTERNS.md` had proposed 1.0, but `showChatBubble` already rode the shared curve's 0.8 multiplier before this plan, so reproducing today's exact bubble timing requires 0.8. Shipping 1.0 would have made every bubble hold 25% longer than it does today, a change D-15 never requested.
- Both narration multipliers take the identical 0.9 ratio (0.8->0.72 human, 0.5->0.45 bot) so the two curves stay in proportion, per D-14's literal instruction to take CONTEXT.md's clean two-decimal readings as written.

## Deviations from Plan

None — plan executed exactly as written, including the planner-corrected `CHAT_BUBBLE_HOLD_MULTIPLIER` value.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All three hold curves (`msgHoldMs`, `botMsgHoldMs`, `chatBubbleHoldMs`) are pinned by pure-function assertions in `scripts/narration_test.js` (13th `npm test` gate), now 112 checks total — the 25-key inventory baseline + Wave 0/NARR-05/tracer assertions from 15-01, plus this plan's Task 2 timing block.
- `src/engine/index.js` remains untouched (`git diff --stat` empty both times this plan ran); the 31-seed determinism corpus stayed green throughout, confirming no engine/event-stream drift.
- **Pending human verification (deferred to end-of-phase per `config.json`'s `human_verify_mode: end-of-phase`):** a live solo game watching a few narration beats (confirming the visibly shorter hold), then a second seat sending a chat message (confirming the bubble holds exactly as long as it did before this phase). Bundles with 15-01's own deferred two-tab addressed-narration check.
- No blockers for 15-03 onward.

---
*Phase: 15-narration-audit-fixes*
*Completed: 2026-07-28*

## Self-Check: PASSED

- FOUND: src/ui/util.js
- FOUND: src/ui/panel.js
- FOUND: scripts/narration_test.js
- FOUND: .planning/phases/15-narration-audit-fixes/15-02-SUMMARY.md
- FOUND: commit fc68f74 (Task 1)
- FOUND: commit 80fadd4 (Task 2)
