---
status: testing
phase: 01-before-the-engine-freezes
source: [01-VERIFICATION.md]
started: 2026-08-19T11:30:00Z
updated: 2026-08-19T11:30:00Z
---

## Current Test

number: 2
name: The Pass button and the narration line, on a real phone
expected: |
  Build stamp reads 2026-08-18e. The Pass button reads "Pass (+1🌕)" with the coin as a real coin
  image, and the button text never splits across a line. Passing raises your purse by exactly one.
  The narration line ends "... Recipe idea! (+1🌕)" — again a real coin image, the whole tag staying
  on one line.
awaiting: user response

## Tests

### 1. Confirm the D-07 call was yours
expected: You made the call, and one dubloon is what you meant.
result: passed
evidence: |
  Answered in-session on 2026-08-19. Wyatt was shown the before/after ladder numbers at the blocking
  checkpoint — pass rate 54.99% → 55.62%, voyage length 15.16 → 14.84 rounds, 0 unfinished either
  side, the trader's wins 101 → 86 — together with the three options (ship at one coin / lower the
  payout before the freeze / spend one more run on the held-out seeds). He replied: "ship it".
  Recorded as a dated event at the foot of 01-BALANCE-DELTA.md. The payout is unchanged at 1, the
  held-out family was not run, and the ladder was not re-run.

### 2. The Pass button and the narration line, on a real phone
expected: |
  At playpastrypirates.com/4 (build stamp 2026-08-18e), in a solo game, pass a turn. The Pass button
  reads "Pass (+1🌕)" with a real coin image, not a raw emoji, and never wraps mid-label. Your purse
  goes up by exactly one. The narration ends "... Recipe idea! (+1🌕)", coin image again, tag intact
  on one line.
why_human: |
  The text was proven correct as a string in all 100 renderings, and the purse was proven to rise
  before the event is recorded. What no headless check can see is the browser: whether the coin image
  actually resolves, and whether the no-break wrapping holds at phone width.
result: [pending]

### 3. The two games leave each other's storage alone
expected: |
  After visiting /4 at least once, the live game at playpastrypirates.com still has the turn clock
  set the way you left it — from the second visit onward. /4's clock stays off. Neither game changes
  the other.
why_human: |
  The one-time cleanup is proven against a stand-in store, but the thing FIX-01 exists to protect is
  two real games sharing one real browser's storage. That only happens on a real device.
result: [pending]

### 4. Read back the balance summary
expected: |
  The plain-English opening of 01-BALANCE-DELTA.md describes what you were actually shown: bots pass
  a little more (55.6 per 100 turns vs 55.0), voyages got slightly shorter not longer (14.84 rounds
  vs 15.16), the trader captain won noticeably less (86 vs 101 of 400), and every game finished.
why_human: |
  This is the summary the decision rested on, and Phase 3 freezes the engine on that decision. Worth
  one read-back while changing it is still cheap.
result: [pending]

## Summary

total: 4
passed: 1
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
