---
status: testing
phase: 14-engine-adjacent-gameplay-fixes-determinism
source: [14-VERIFICATION.md]
started: 2026-07-26
updated: 2026-07-26
---

## Current Test

number: 1
name: Multiplayer guests do not see the square-by-square storm push — is STORM-01 satisfied?
expected: |
  A decision, not a pass/fail observation.

  What works: in solo play and on the HOST's screen in multiplayer, a ship pushed by a storm now
  visibly steps one square at a time across the full push, and the board never lags behind the
  narration. Wyatt confirmed this live in Safari on 2026-07-26 (all four checks passed).

  What does not: a multiplayer GUEST still sees the boat jump to its final square. A guest renders
  purely from the broadcast event feed, and the intermediate storm squares deliberately emit no
  event. Showing them to a guest would mean adding to the event stream — which the 31-seed
  determinism corpus forbids without another full re-record (a one-way door already walked once in
  this phase).

  STORM-01's wording in REQUIREMENTS.md and ROADMAP.md carries no host/guest qualifier, so as
  written it is arguably only partially met. The limitation is real, reasoned, and documented in
  .planning/debug/resolved/storm-push-not-rendered.md — but it was never put to Wyatt as an
  explicit yes/no, and the verifier declined to let an executor's own "accepted by design" note
  stand in for his decision.

  Wyatt needs to choose one of:
    (a) Accept as-is — STORM-01 is satisfied; amend its wording to say host/solo, and log the
        guest limitation as a known constraint.
    (b) Defer — STORM-01 is satisfied for now; open a follow-up item to give guests the animation
        in a later milestone, which would need a determinism re-record.
    (c) Not satisfied — treat the guest case as in scope for Phase 14, which reopens the phase and
        requires an engine/event-stream change plus another corpus re-record.
awaiting: user response

## Tests

### 1. Multiplayer guests do not see the square-by-square storm push — is STORM-01 satisfied?
expected: A decision between accept-as-is / defer / not-satisfied (full detail above).
result: [pending]

## Summary

total: 1
passed: 0
issues: 0
pending: 1
skipped: 0
blocked: 0

## Gaps
