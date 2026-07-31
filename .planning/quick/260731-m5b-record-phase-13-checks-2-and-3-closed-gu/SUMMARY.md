---
quick_id: 260731-m5b
status: complete
date: 2026-07-31
commits: [c20ec59, aabbc8d, pending-d07-correction]
files_changed: 3
code_changed: false
---

# Record Phase 13 checks 2 and 3 closed — guest pause and click-to-resume

Documentation only. No file under `src/` was touched; `git status --porcelain -- src/` was empty
before every commit.

## What was recorded

Phase 13's last two `human_verification` checks were exercised live on 2026-07-31 in room `SGZZ`
(Wyatt hosting in Safari seat 0; Claude driving the guest seat in Chrome seat 1) and both passed:

- **Check 2 — guest-initiated `#scPause`.** The load-bearing evidence is the host's clock
  re-broadcast at `+116ms` carrying `paused=true`. `rooms/{room}/clock` is written only by the host,
  so its appearance proves the guest's pause reached the host's browser and was applied there —
  not a guest-local flag being read back. Wyatt confirmed the host side visually.
- **Check 3 — click-to-resume on `#shotClockNum`.** The clock re-armed; `turnExpired` stayed false.
  The stuck-clock failure mode this check exists to catch did not occur.

Run twice, identical in shape.

## Three files changed

| File | Change |
|---|---|
| `.planning/phases/13-multiplayer-turn-clock/13-VERIFICATION.md` | appended one closure section, house style, append-only |
| `.planning/milestones/v1.2-phases/13-multiplayer-turn-clock/13-VERIFICATION.md` | whole-file `cp` of the above |
| `.planning/v1.2-MILESTONE-AUDIT.md` | frontmatter items 17/18 retired; prose items 1, 2 updated; new item 6 |

`diff` between the live and archive copies: **no output, exit 0** — verified after the executor's
edit and again after the D-07 correction below.

Append-only gate on both verification files: `git diff | grep -c '^-[^-]'` → **0**. Frontmatter,
Observable Truths table, and the three prior closure sections untouched.

## Method, and why it is worth recording

The checks were not driven by hand. Hand-driving failed repeatedly — each browser round-trip costs
1–2 seconds against a 30-second shot clock, and two of the guest's turns were lost to expiry. What
worked was an in-page watcher armed in the guest tab that fired the whole pause/resume sequence at
page speed while recording a timestamped trace against live Firebase listeners.

This is the reusable lesson for anyone driving this game again: hand-clicking cannot hit a
sub-second window.

## New finding filed

**Pausing in the final ~1 second of a turn does not save the turn.** Observed directly by Wyatt:
he paused from the host with roughly a second left, the turn expired anyway, the "too slow" penalty
applied, play continued. Cause is marked **suspected**, not established — `togglePause` writes to
Firebase and the host only applies the pause when `watchPause`'s callback fires on the round-trip,
while `shotClockTick` reaches the 30000ms expiry locally every 500ms. Filed in the audit's
`tech_debt:` under the sentinel `phase: post-audit-findings`, deliberately not under phase 13, since
phase 13's checks pass.

**Recommended follow-up (Wyatt's call):** promote it to a `.planning/todos/pending/` file at next
triage. That directory is the better long-term home and already has the right frontmatter shape;
it was out of scope here only because this task was scoped to three files.

## Two things deliberately NOT recorded as defects

- **Resume returned a full 30 seconds — correct, not a bug.** The pause was taken at the top of the
  turn so `pauseElapsed` was ~0, and `Date.now()+30000-pauseElapsed` yields ~30s. The remaining-time
  rule is upheld. Recorded explicitly so nobody re-opens it as a false alarm.
- **The `paused`-latch suspicion was withdrawn.** Investigated, not reproduced, no defect filed.
  Recorded only so a future session does not chase the same ghost.

## Caveat kept explicit

Item **4** of the Human Verification Required list — the solo pause/resume regression — was **not**
re-exercised today. The audit's "3 of 5 never closed" accounting counted it among the two already
closed. Nothing here re-tested it, and the phrase "fully closed" is never used unqualified in either
the verification file or the audit. The arithmetic is auditable rather than assumed.

## Corrections applied after the executor ran

The executor hedged the **D-07** citation, having checked the planning docs and found the label
resolving to unrelated decisions in four places. It missed the source comment: `src/ui/util.js:1260`
annotates `applyPauseState` with *"(D-07: resume continues from the remaining time, not a fresh
30s)"*. The citation was correct. The paragraph now asserts D-07 as the implementation's own label
**and** keeps the executor's genuinely useful warning that the bare ID is overloaded project-wide
and should be cited alongside the Truth 5 wording, never alone.

The executor's caution was reasonable and its finding was half-right — the overloading is real. Only
the conclusion needed reversing.

## Gates

| Gate | Result |
|---|---|
| archive `diff` | no output, exit 0 |
| append-only, both verification files | 0 removed lines each |
| `git status --porcelain -- src/` | empty before every commit |
| files changed | exactly 3 |
| `npm test` | not run — not required, no code touched |
