---
task: record-phase-13-checks-2-and-3-closed
quick_id: 260731-m5b
type: quick
created: 2026-07-31
baseline_commit: 2854f51
documentation_only: true
files_modified:
  - .planning/phases/13-multiplayer-turn-clock/13-VERIFICATION.md
  - .planning/milestones/v1.2-phases/13-multiplayer-turn-clock/13-VERIFICATION.md
  - .planning/v1.2-MILESTONE-AUDIT.md
autonomous: true
requirements: [CLOCK-02, CLOCK-03]

must_haves:
  truths:
    - "Phase 13's VERIFICATION file records the guest-initiated #scPause and the #shotClockNum click-to-resume as closed on 2026-07-31, with the room, the measured trace, and the reason the +116ms host re-broadcast is the load-bearing evidence"
    - "The archive copy under .planning/milestones/v1.2-phases/ is byte-identical to the live phase copy, proven by a diff that exits 0"
    - "The v1.2 audit no longer claims three phase-13 human_verification tests are open, and points at where the closure evidence lives"
    - "The end-of-turn pause race is recorded as a NEW finding with its cause marked suspected, clearly separated from the phase-13 check closures"
    - "The full-30s resume is recorded as correct behaviour upholding D-07, so a future reader does not re-open it as a defect"
    - "Nothing under src/ is modified, staged, or committed"
  artifacts:
    - .planning/phases/13-multiplayer-turn-clock/13-VERIFICATION.md
    - .planning/milestones/v1.2-phases/13-multiplayer-turn-clock/13-VERIFICATION.md
    - .planning/v1.2-MILESTONE-AUDIT.md
  key_links:
    - "live phase VERIFICATION -> archive copy: the two must not drift, and `diff` is the only acceptable proof"
    - "audit tech_debt line-17 item -> the appended VERIFICATION sections: the audit must name where the evidence lives rather than restate it"
    - "the timerOff=false precondition -> panel.js's early return: the reason Check 3 is untestable with the timer off, not merely awkward"
---

<objective>
Record, in the project's own record, that Phase 13's last two open `human_verification` checks were
closed live on 2026-07-31 in room `SGZZ` — a GUEST-initiated `#scPause`, and clicking `#shotClockNum`
to resume (CLOCK-03's affordance) — and bring the v1.2 milestone audit's tech-debt block back in line
with reality.

Purpose: the audit's single most useful finding was that evidence generated in one session never
flowed back to the phase that recorded the gap. This task is the counter-move for the remaining two
checks. It also files one genuinely new bug found while running them, and explicitly buries one
suspicion that was investigated and withdrawn, so a future session does not chase the same ghost.

Output: three documentation files updated. No code, no tests, no behaviour change.
</objective>

<hard_boundary>
**DOCUMENTATION ONLY. Do not touch anything under `src/`.**

No engine edit, no UI edit, no script edit, no `package.json` edit. If any instruction below seems to
call for a code change, it does not — stop and report instead.

The only three files this task may modify are the three in `files_modified`. A fourth changed file is
a failure, not a bonus.
</hard_boundary>

<content_to_record>

Everything below is the evidence to record. Use it faithfully. Do NOT embellish, inflate, round
numbers, add adjectives of confidence the evidence does not carry, or promote a suspicion to a
finding.

## Setup

Live two-window game, room `SGZZ`, served at `http://localhost:8460`. Wyatt hosting in Safari
(seat 0). Claude driving the guest seat in Chrome (seat 1, identity `claude-guest-430272`).

## The timer had to be ON — a precondition, not a detail

`timerOff` was `false` for these checks. In `src/ui/panel.js` the `if(appState.timerOff){ ... return; }`
branch returns BEFORE any paused-state rendering. With the timer off, the big paused symbol never
renders and CLOCK-03's click handler is never armed — so Check 3 is not merely awkward with the timer
off, it is literally untestable. The handoff note that preceded this session flagged `timerOff` as
possibly needing re-enabling; this is the reason why.

## Method — and why it changed

The checks were NOT driven by hand. Hand-driving failed repeatedly: each browser round-trip costs 1–2
seconds against a 30-second shot clock, and two of the guest's turns were lost to expiry while
trying.

The working approach was an in-page watcher installed in the guest tab that armed itself on a fresh
clock for seat 1 and then fired the whole sequence at page speed, recording a timestamped trace of
local state alongside live Firebase listeners on `rooms/SGZZ/paused` and `rooms/SGZZ/clock`. It was
run twice.

The method change is the reusable lesson: a future session driving this game should know that hand-
clicking cannot hit a sub-second window.

## Run 2 trace — deltas measured from the guest's pause click

    +0ms       guest clicks #scPause (clock fresh, 30s on it)
    +1ms       rooms/SGZZ/paused -> true
    +116ms     rooms/SGZZ/clock -> seat1 paused=true      <-- host re-broadcast
    +204ms     guest renders label "paused"; #shotClockNum onclick armed; #scPauseImg -> play.png
    +8204ms    guest clicks #shotClockNum (pause deliberately held 8s so it was visible on both screens)
    +8205ms    rooms/SGZZ/paused -> false
    +8328ms    rooms/SGZZ/clock -> seat1 paused=false, clock re-armed
    +11208ms   label back to "play in", counting down, turnExpired === false

Run 1 was identical in shape: affordance armed after 200ms, resume re-armed the clock, `turnExpired`
false throughout.

## Why the +116ms line is the load-bearing evidence for Check 2

`rooms/{room}/clock` is written ONLY by the host (`broadcastClock`, reached from the host branch of
`watchPause`). Its appearance carrying `paused=true` proves the guest's pause travelled to the host's
browser and the host applied it.

This is emphatically not the guest setting a local flag and calling it a pass — that distinction is
what made the earlier Check B inconclusive, and the same standard is being held here. Wyatt
independently confirmed the host side visually: *"yes it froze and came back"*.

## Check 3

Its specific failure mode — a stuck clock, BUG-02's failure mode in miniature — did not occur. The
clock re-armed and `turnExpired` stayed false.

## NOT a defect: resume returned a full 30 seconds

That is correct behaviour. The pause was taken at the very top of the turn, so `pauseElapsed` was ~0,
and `applyPauseState`'s `Date.now()+30000-pauseElapsed` therefore yields ~30s. D-07 ("resume
continues from the remaining time, not a fresh 30s") is upheld, not violated. Say so explicitly so a
future reader does not re-open it as a false alarm.

## Investigated and WITHDRAWN — mention only as such, do NOT file a defect

It briefly appeared that `rooms/{room}/paused` could latch true while play continued (`startShotClock`
clears the host's local `shotClockPaused`, but nothing writes the shared flag false). On review the
observation was equally well explained by the game legitimately sitting paused from an earlier click
until it was resumed, and no clean reproduction was obtained. Record it only as "investigated, not
reproduced, no defect filed" — the point is to stop a future session chasing the same ghost, and to
be honest that it was considered.

## NEW finding — record as tech debt / a bug worth filing, NOT as a phase-13 failure

**Pausing in the final ~1 second of a turn does not save the turn.** Wyatt paused from the host with
roughly one second left; the turn expired anyway, the "too slow" penalty was applied, and play
continued.

Suspected cause, from code read and NOT yet isolated with a test: `togglePause` writes to Firebase,
and the host only applies the pause when `watchPause`'s callback fires on the round-trip, while
`shotClockTick` runs locally every 500ms and reaches the 30000ms expiry independently. So there is a
window at the end of a turn that a pause cannot beat.

Worth an explicit decision: accept it, or have the host apply the pause optimistically/locally before
the round-trip completes.

**Mark the cause as suspected, not established.** Phase 13's checks pass — this is not a verification
failure and must be kept visibly separate from the check closures.

## Numbering — be precise, the file uses two schemes

- The `## CLOCK-01 CLOSED 2026-07-31` section lists a still-open **trio**: localStorage version-guard
  blobs, guest-initiated `#scPause`, click `#shotClockNum`. "Check 1" (already closed) is the
  localStorage one; this task closes the second and third of that trio.
- The `### Human Verification Required` list numbers **five** items 1–5. The two closed here are
  items **3** and **5** of that list.

State both mappings so neither numbering misleads a later reader.

## One honest caveat to include

Item **4** of the Human Verification Required list — the solo pause/resume regression — was NOT
exercised today. The v1.2 audit's own accounting ("3 of 5 never closed") counted it among the two
already closed; nothing in this session re-tested it. Record that plainly so the arithmetic is
auditable rather than assumed.

</content_to_record>

<house_style>
The three existing trailing sections in `13-VERIFICATION.md` set the voice — read them before
writing:

- `## CLOCK-01 CLOSED 2026-07-31 by Phase 17 — appended by the v1.2 milestone audit` (line ~155)
- `## Check 1 CLOSED 2026-07-31 — localStorage version guard, verified by Wyatt in Safari` (line ~175)
- `## Check B RE-RUN and CLOSED 2026-07-31 — with a room that actually exists` (line ~203)

What they do, and what the new section must also do:

- **Direct and evidence-first.** The measurement comes before the conclusion.
- **Explicit about what is and is not proven.** Check 1's section says outright that "Case B is
  INCONCLUSIVE by construction, and is not evidence" and that "A, B and C alone are indistinguishable
  from a boot that unconditionally wipes both keys". Match that willingness.
- **Bold used sparingly, on the load-bearing sentence only.**
- **Tables and indented traces for data**; prose for reasoning.
- **Says when something was withdrawn, re-run, or found to be untestable as originally written.**
- Wrapped at ~100 columns, matching the surrounding file.

The file is **append-only by convention**: none of the three prior closures edited the frontmatter
`human_verification` list or the `Observable Truths` table. Follow that. Do not rewrite history
in-place — append.
</house_style>

<tasks>

<task type="auto">
  <name>Task 1: Append the Checks 2 and 3 closure section to both VERIFICATION copies</name>
  <files>.planning/phases/13-multiplayer-turn-clock/13-VERIFICATION.md, .planning/milestones/v1.2-phases/13-multiplayer-turn-clock/13-VERIFICATION.md</files>
  <read_first>
    `.planning/phases/13-multiplayer-turn-clock/13-VERIFICATION.md` in full — in particular the three
    trailing closure sections starting at line ~155, which set the voice, and the
    `### Human Verification Required` list at line ~132, which sets the numbering.
  </read_first>
  <action>
    APPEND one new `##` section to the END of the live phase file
    `.planning/phases/13-multiplayer-turn-clock/13-VERIFICATION.md`, using the Edit tool anchored on
    the last lines of the existing `## Check B RE-RUN and CLOSED` section. Append only — do not touch
    the YAML frontmatter, the Observable Truths table, or any existing section body.

    Heading follows the established pattern, naming what closed and where:
    `## Checks 2 and 3 CLOSED 2026-07-31 — guest-initiated pause and click-to-resume, live in room SGZZ`

    Body covers, in this order, drawing every fact from `<content_to_record>` above and adding none:
    the setup; the `timerOff` precondition and why Check 3 is untestable without it; the method change
    and why hand-driving failed; the Run 2 trace as a 4-space-indented block reproduced exactly as
    given; Run 1's agreement in shape; why the +116ms host re-broadcast is the load-bearing evidence
    for Check 2 and how that differs from a guest setting a local flag; Wyatt's visual confirmation
    quote; Check 3's non-occurrence of the stuck-clock failure mode; the explicit note that the full
    30s on resume is CORRECT and upholds D-07; the withdrawn paused-latch suspicion recorded only as
    investigated / not reproduced / no defect filed; a one-line pointer that the end-of-turn pause
    race is a NEW finding filed in `.planning/v1.2-MILESTONE-AUDIT.md`, not a phase-13 failure; both
    numbering mappings; and the honest caveat about list item 4 never being re-exercised.

    Do NOT copy the trace deltas approximately — reproduce the millisecond figures exactly.

    THEN make the archive copy byte-identical by copying the live file over it:
    `cp .planning/phases/13-multiplayer-turn-clock/13-VERIFICATION.md .planning/milestones/v1.2-phases/13-multiplayer-turn-clock/13-VERIFICATION.md`
    The two files are byte-identical at the baseline commit (confirmed), so a whole-file copy is
    correct and is the only method that guarantees the result. Do NOT apply the same Edit twice to the
    two files — hand-repeating an edit is how trailing-whitespace and wrap divergence gets introduced,
    which is exactly what the diff gate exists to catch.
  </action>
  <verify>
    <automated>
    # 1. Archive copy is byte-identical (the explicit requirement) — must exit 0 with no output
    diff .planning/phases/13-multiplayer-turn-clock/13-VERIFICATION.md .planning/milestones/v1.2-phases/13-multiplayer-turn-clock/13-VERIFICATION.md && echo "BYTE_IDENTICAL_OK"
    # 2. Append-only: an append introduces zero removed lines. Expect 0.
    test "$(git diff -- .planning/phases/13-multiplayer-turn-clock/13-VERIFICATION.md | grep -c '^-[^-]')" -eq 0 && echo "APPEND_ONLY_OK"
    # 3. The load-bearing facts are present, each exactly as measured
    grep -q '+116ms' .planning/phases/13-multiplayer-turn-clock/13-VERIFICATION.md && \
    grep -q 'SGZZ' .planning/phases/13-multiplayer-turn-clock/13-VERIFICATION.md && \
    grep -q 'claude-guest-430272' .planning/phases/13-multiplayer-turn-clock/13-VERIFICATION.md && \
    grep -q 'broadcastClock' .planning/phases/13-multiplayer-turn-clock/13-VERIFICATION.md && \
    grep -q 'D-07' .planning/phases/13-multiplayer-turn-clock/13-VERIFICATION.md && \
    grep -q 'timerOff' .planning/phases/13-multiplayer-turn-clock/13-VERIFICATION.md && echo "FACTS_OK"
    # 4. No src/ file touched by this task
    test -z "$(git status --porcelain -- src/)" && echo "NO_SRC_OK"
    </automated>
  </verify>
  <done>
    Both VERIFICATION copies end with the new `## Checks 2 and 3 CLOSED 2026-07-31` section; `diff`
    between them exits 0 with no output; the phase file's diff contains no removed lines; the trace,
    room, guest identity, `broadcastClock` reasoning, D-07 note and `timerOff` precondition all
    appear; `git status --porcelain -- src/` is empty.
  </done>
</task>

<task type="auto">
  <name>Task 2: Bring the v1.2 audit's tech-debt block in line, and file the new finding</name>
  <files>.planning/v1.2-MILESTONE-AUDIT.md</files>
  <read_first>
    `.planning/v1.2-MILESTONE-AUDIT.md` in full. The four spots that repeat the stale claim are:
    frontmatter line ~17 and line ~18, and prose items **1** (line ~109) and **2** (line ~116) under
    `## Tech debt — what this audit actually found`.
  </read_first>
  <action>
    Make five scoped Edits. Do not rewrite the file wholesale and do not restate the evidence — the
    audit's job is to point at where the evidence lives.

    (a) **Frontmatter line ~17**, currently opening `"3 of 5 human_verification tests never closed:`.
    Replace that one list item with an item stating that Phase 13's `human_verification` list is now
    fully closed: the localStorage version-guard blobs closed earlier on 2026-07-31 (Check 1, plus a
    Check B re-run against a room that actually exists), and the guest-initiated `#scPause` and the
    `#shotClockNum` click-to-resume closed on 2026-07-31 in room `SGZZ`. Point at
    `13-VERIFICATION.md`'s trailing closure sections as the home of the evidence. Preserve the audit's
    own arithmetic honestly — it had recorded 3 of 5 as open, and those 3 are now closed, which leaves
    none open on that accounting; note that list item 4 (solo pause/resume regression) was counted
    among the two already closed and was not re-exercised.

    (b) **Frontmatter line ~18** — this item IS now stale and must be handled, not left. It reads
    `"13-VERIFICATION.md still records CLOCK-01 as PRESENT_BEHAVIOR_UNVERIFIED... nothing propagated
    that back."` The propagation has since happened: this very audit appended the
    `## CLOCK-01 CLOSED 2026-07-31 by Phase 17` section to that file. Rewrite the item to say the
    closure IS now recorded there, and to state the residual precisely: the `Observable Truths` table
    row 1 and the frontmatter `behavior_unverified_items` still carry their original ⚠️ marker,
    deliberately, because the file is append-only by convention — so a reader who skims only the table
    still gets the old picture. That residual is the honest remainder of the item, not its deletion.

    (c) **New `tech_debt:` entry for the new finding.** Append a new list entry to the `tech_debt:`
    block using the sentinel `phase: post-audit-findings` — chosen so a reader or tool scanning
    `tech_debt:` still finds it, while nothing implies it is a Phase 13 verification failure. Its item
    records the end-of-turn pause race per `<content_to_record>`: pausing in the final ~1 second does
    not save the turn (host-side, ~1s left, turn expired, "too slow" penalty applied, play continued);
    the suspected cause (`togglePause` writes to Firebase and the host applies the pause only on
    `watchPause`'s round-trip, while `shotClockTick` reaches the 30000ms expiry locally every 500ms);
    the words **suspected, not isolated with a test**; and the open decision — accept it, or have the
    host apply the pause optimistically/locally before the round-trip completes.

    (d) **Prose item 1** under `## Tech debt — what this audit actually found` — currently
    `**1. Phase 13 has three human-verification tests that were never closed.**` Rewrite it to record
    that all three were closed on 2026-07-31, name which session closed which, and point at
    `13-VERIFICATION.md`'s trailing sections. Keep the audit's existing note that Wyatt had exercised
    pause/resume and timer-off from the host, since that is now the contrast that makes the
    guest-initiated path worth having proven separately.

    (e) **Prose item 2** — currently `**2. Phase 13's file still says CLOCK-01 is unverified.**`
    Rewrite to match (b): the closure is recorded in an appended section; the truths table retains its
    original marker by the file's append-only convention; that is the residual.

    (f) **New prose item 6**, appended after item 5 (`**5. Structural artifacts.**`), for the new
    finding — same facts as (c), same "suspected" hedge, and one sentence stating plainly that it is
    not a Phase 13 verification failure. Add a short dated line noting the tech-debt section was
    amended on 2026-07-31 after the checks closed, so a reader knows the section post-dates the
    audit's own `audited:` stamp.

    Leave alone, having checked them: the Requirements coverage table row for CLOCK-01/02/03 (line
    ~52) is still accurate as written; the Phase verifications table row for Phase 13 (line ~76)
    already hedges with "at the time"; `status: tech_debt` stays, since other phases' debt and this
    new finding remain.

    **Home for the new finding — decision, stated:** the audit's `tech_debt:` block, as above. Two
    alternatives were considered and are recorded here rather than used. `.planning/todos/pending/*.md`
    is a real, well-shaped convention in this project (id/title/status/type/severity/area/created/
    source frontmatter, e.g. `d41-two-greyed-states-never-eyeballed.md`) and is the better LONG-TERM
    home once Wyatt triages it; `ROADMAP.md`'s `## Milestone Backlog` groups candidate milestones and
    has no group this fits cleanly. Both are out of scope here because this task is scoped to exactly
    three files. Note in the SUMMARY that promoting it to a `todos/pending/` file is the recommended
    follow-up, and that it is Wyatt's call.
  </action>
  <verify>
    <automated>
    # 1. The stale literals are gone from the audit file (grep scoped to that file only)
    test "$(grep -c '3 of 5 human_verification' .planning/v1.2-MILESTONE-AUDIT.md)" -eq 0 && echo "STALE_17_GONE"
    test "$(grep -c 'nothing propagated that back' .planning/v1.2-MILESTONE-AUDIT.md)" -eq 0 && echo "STALE_18_GONE"
    test "$(grep -c 'three human-verification tests that were never closed' .planning/v1.2-MILESTONE-AUDIT.md)" -eq 0 && echo "STALE_PROSE_GONE"
    # 2. The new finding is filed, hedged, and separated
    grep -q 'post-audit-findings' .planning/v1.2-MILESTONE-AUDIT.md && \
    grep -qi 'suspected' .planning/v1.2-MILESTONE-AUDIT.md && \
    grep -q 'shotClockTick' .planning/v1.2-MILESTONE-AUDIT.md && echo "NEW_FINDING_OK"
    # 3. Frontmatter still parses as YAML with tech_debt present
    node -e "const fs=require('fs');const t=fs.readFileSync('.planning/v1.2-MILESTONE-AUDIT.md','utf8');const m=t.match(/^---\n([\s\S]*?)\n---/);if(!m)throw new Error('no frontmatter');if(!/\n?tech_debt:/.test(m[1]))throw new Error('tech_debt missing');if(!/post-audit-findings/.test(m[1]))throw new Error('new entry not in frontmatter');console.log('FRONTMATTER_OK');"
    # 4. Only this one file changed in this task, and nothing under src/
    test -z "$(git status --porcelain -- src/)" && echo "NO_SRC_OK"
    </automated>
  </verify>
  <done>
    The audit's frontmatter line-17 item states the phase-13 `human_verification` list is fully closed
    and points at `13-VERIFICATION.md`; the line-18 item is rewritten to record the propagation and
    name the append-only residual; a `post-audit-findings` tech_debt entry carries the end-of-turn
    pause race with its cause marked suspected; prose items 1 and 2 match, and a new item 6 records
    the finding as explicitly not a Phase 13 verification failure; the frontmatter still parses; no
    `src/` file is modified.
  </done>
</task>

</tasks>

<verification>
Run after both tasks, before committing:

    # Archive copy byte-identical — the explicit requirement. Must print nothing, exit 0.
    diff .planning/phases/13-multiplayer-turn-clock/13-VERIFICATION.md \
         .planning/milestones/v1.2-phases/13-multiplayer-turn-clock/13-VERIFICATION.md

    # HARD BOUNDARY — must print nothing. Any output is a failed task, not a warning.
    git status --porcelain -- src/

    # Exactly three files changed, and they are the three named
    git status --porcelain

Expected `git status --porcelain` output is exactly three ` M` lines:

    .planning/phases/13-multiplayer-turn-clock/13-VERIFICATION.md
    .planning/milestones/v1.2-phases/13-multiplayer-turn-clock/13-VERIFICATION.md
    .planning/v1.2-MILESTONE-AUDIT.md

plus the untracked `.planning/quick/260731-m5b-.../PLAN.md` and `SUMMARY.md` for this task itself,
which are expected. Anything else — especially anything under `src/`, `scripts/`, or `package.json` —
means stop and investigate before committing.

**`npm test` is NOT required for this task.** No code is touched, so the 19 gate scripts and the
31-seed determinism corpus cannot be affected by anything here. Running it would only prove the tree
was already green. The `git status --porcelain -- src/` check above is the gate that actually matters
for a documentation-only change, and it IS required before commit.
</verification>

<success_criteria>
- [ ] `diff` between the live phase VERIFICATION and its archive copy exits 0 with no output, and the SUMMARY states that result explicitly
- [ ] The new closure section is APPENDED — the phase file's diff contains zero removed lines; frontmatter, truths table and prior sections are untouched
- [ ] The section names both numbering schemes (trio items 2 and 3; Human Verification Required items 3 and 5) so neither misleads
- [ ] The Run 2 trace appears with its millisecond figures exact, and the +116ms host re-broadcast is identified as the load-bearing evidence for Check 2
- [ ] The `timerOff=false` precondition is recorded with its reason (panel.js's early return before any paused-state render)
- [ ] The full-30s resume is recorded as CORRECT and upholding D-07, not as a defect
- [ ] The paused-latch suspicion appears only as investigated / not reproduced / no defect filed — or not at all
- [ ] The end-of-turn pause race is filed as tech debt with its cause marked **suspected**, visibly separate from the check closures
- [ ] The audit no longer claims three phase-13 checks are open; the stale line-18 item is handled, with the append-only residual named
- [ ] `git status --porcelain -- src/` is empty before commit
- [ ] Exactly three tracked files modified
</success_criteria>

<output>
Write `.planning/quick/260731-m5b-record-phase-13-checks-2-and-3-closed-gu/SUMMARY.md` when done.

It must state:
1. The `diff` result for the archive copy, verbatim (empty output / exit 0), not a paraphrase.
2. That `git status --porcelain -- src/` was empty before commit.
3. Which spots in the audit's prose body were updated (items 1, 2, and new item 6) and which were
   checked and deliberately left alone (Requirements coverage row line ~52, Phase verifications row
   line ~76).
4. That the line-18 frontmatter item was found stale and how it was handled.
5. The chosen home for the new finding, and the recommendation that it be promoted to a
   `.planning/todos/pending/` file at Wyatt's next triage.
6. That `npm test` was not run, and why it was not required.
</output>
