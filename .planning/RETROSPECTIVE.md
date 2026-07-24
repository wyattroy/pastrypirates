# Retrospective

A living record of what worked and what didn't, milestone by milestone.

## Milestone: v1.0 — Edit Pass

**Shipped:** 2026-07-24
**Phases:** 6 | **Punch-list items:** 15 (37 v1 requirements)

### What Was Built

Cleared a 15-item playtesting punch list against the shipped game: fixed the Safari
storm near-crash and the multiplayer timer/refresh state loss, made battles reflip-free
and swap-free, taught the bots the new mechanics (smarter trades, unsticking, fair win
rates), overhauled narration accuracy and pacing, polished ten UI/UX rough edges,
hardcoded bot personalities per captain, and rebuilt the end-of-voyage moment (recipe
win box, Unluckiest-pirate badge, redesigned badges, confetti).

### What Worked

- The two urgent bugs were correctly sequenced first as a hard blocker — everything
  else was polish on a game that stayed playable.
- Human-approval gates (EOV-04 badges, NARR-06 storm text) were respected: mockup and
  audit delivered before the final copy/design shipped.
- The real Safari fix was found by iterating past the first hypothesis — per-character
  DOM writes helped, but the pre-baked PNG rain tile was the actual compositing fix.

### What Was Inefficient

- **GSD execution artifacts were never populated.** The work was executed and merged to
  `main`, but phase `SUMMARY.md` files and plan checkboxes were not written, so the
  milestone had to be closed as an **override** with no verified execution trail. The
  MILESTONES.md accomplishments were reconstructed by hand from the handoff + git log
  rather than extracted automatically.
- The milestone was completed from a worktree branch whose `.planning/` state lagged the
  merged code (STATE showed Phase 1 / 0% while all six phases were live on `main`).

### Key Lessons

- Keep `.planning/` execution artifacts in lockstep with the code as phases land —
  otherwise close-out degrades to a manual, override-based reconstruction.
- When work spans branches/worktrees, verify the planning state matches the merged code
  before trusting the progress counters.

## Cross-Milestone Trends

*(Populated as more milestones ship.)*
