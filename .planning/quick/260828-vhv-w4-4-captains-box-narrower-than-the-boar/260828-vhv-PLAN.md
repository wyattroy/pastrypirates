---
quick_id: 260828-vhv
description: "W4-4 — the captains box is narrower than the board"
created: 2026-08-28
status: in-progress
must_haves:
  truths:
    - "The captains box and the board share one width at every screen size, derived rather than declared twice."
    - "The captain rows fill that width instead of stranding their content in a narrow left column."
  artifacts:
    - "scripts/qa/w44_captains_width_check.mjs — run RED before the fix"
    - "matched-pair renders at 768x954 and 390x844"
---

# W4-4 — the captains box is narrower than the board

## What Wyatt reported

> "At tablet width the captains box is narrower than the board, leaving a ~10px dead strip."

And, from his screenshot, **wider than tablet**: the captain rows end roughly 200px short of the
panel's own right edge on a phone.

## Independent corroboration — this one was found twice

The sea trial's `solo-tablet-wk` leg flagged it without being told to look: captains-panel rows
filling only the left ~15% of a full-width panel at 768px, on a size that had no leg until that day.
That is the tablet leg earning its place, and it means the fault is real before any measurement here.

## The two symptoms may be two faults

1. **The PANEL is narrower than the board** — his "~10px dead strip".
2. **The ROWS are narrower than the panel** — the trial's "left 15%", his "~200px short".

These are different failures and could have different causes. Measure both before assuming one fix
covers them, and say plainly which one each measurement supports.

## Deliberately NOT in this task

**W4-7** — the board's right edge and the captains card possibly running past the right edge of a
390px viewport. Observed by CEO Review 13 in a verification screenshot, **never measured**. It is
overflow, where this is a short row: adjacent, and a different fault. It gets its own item.

## Steps

1. Measure the board's rect, the panel's rect and a row's rect at 768x954 and 390x844. Write the
   prediction down first, with what would prove it wrong.
2. Write `scripts/qa/w44_captains_width_check.mjs` and run it RED.
3. Fix — derived from what the layout already computes, never a typed width (rule 9).
4. Same gate green; `npm test` sweep.
5. Matched-pair renders at both sizes, one boot per size.
6. Fresh-context CEO review, appended to CEO-REVIEWS.md.

## Deviation from the /gsd-quick workflow, named not hidden

The workflow dispatches a `gsd-executor` into a git worktree. Rule 16 retired worktrees in this
repo, and rules 19/22 put layout judgment in the main thread where the screenshots and Wyatt's
rulings live. So this task takes the workflow's ARTIFACTS (this plan, a summary, the STATE row) and
keeps the work in the main checkout under the four steps.
