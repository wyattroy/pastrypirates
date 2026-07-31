---
quick_id: 260731-ml5
task: file-the-end-of-turn-pause-race-and-make-the-driving-doc-discoverable
type: quick
documentation_only: true
completed: 2026-07-31
status: complete
baseline_commit: 197cac2
commits:
  - 58b8c3a: file the end-of-turn pause race as a v1.3 backlog todo
  - 9d7e5a0: add DRIVING-THE-GAME section 5d — the armed watcher
  - 36b3ce8: point the four first-read files at DRIVING-THE-GAME.md
key-files:
  created:
    - .planning/todos/pending/pause-cannot-beat-end-of-turn-expiry.md
  modified:
    - .planning/ROADMAP.md
    - docs/DRIVING-THE-GAME.md
    - .claude/CLAUDE.md
    - docs/VERIFICATION-CHECKLIST.md
    - docs/MODULES.md
    - .planning/STATE.md
---

# Quick 260731-ml5: File the pause race, and make the driving doc discoverable

Three documentation jobs, no code. The end-of-turn pause race is a real backlog item with one home
on the ROADMAP; the armed-watcher technique that made Phase 13's last checks possible is written
down as `docs/DRIVING-THE-GAME.md` §5d; and four files a future session actually reads first now
point at that doc.

## Milestone: v1.3, on three agreeing pointers

- `.planning/STATE.md` — *"v1.2 SHIPPED 2026-07-31 and archived — ready for /gsd-new-milestone"*
- `.planning/ROADMAP.md` Phase 18 and the v1.2 audit both defer NARR-07 to **v1.3**
- No milestone after v1.2 exists, so nothing moved the numbering. There is no v1.4 anywhere

Wyatt asked for "1.3's (or maybe now it's 1.4's)" backlog. It is v1.3. If a milestone is created
before this is picked up, the number in the todo needs re-checking — it is a fact about today, not
a promise.

## Severity `low`, and the argument for raising it

Judged from effect. It fires only when multiplayer AND timer-on AND a pause in the last ~1s all
coincide; when it fires, one coin moves under the documented penalty and one turn is lost. No
corruption, no crash, no desync, no determinism impact. That matches how `low` is used elsewhere
here (`d41`, `narration-two-schedulers-unenforced`). `medium` in this repo is
`every-client-can-see-every-recipe`, which changes outcomes table-wide.

**The argument for raising it, stated so it is not buried:** the player acted *deliberately* to
prevent the penalty and was penalised anyway. That is worse in feel than a papercut even if it is
one in effect. One-line change if Wyatt wants it.

## ROADMAP placement is a widening, not a clean fit — and the file says so

Filed under `Fair Play Online`, whose rationale cell was widened by a clause from "the negotiation
being honest" to cover the shared turn clock.

Ruled out with reasons: **The Gated Re-Record** (the fix is UI-tier and emits no new event — parking
it behind the one-way `--capture` would be wrong); **Platform Debt** (explicitly "no player sees any
of it", and a player saw this); **Economy Correctness** (that is coins/crates being minted or
deleted — here the penalty is legitimate and correctly applied, the bug is that it could not be
prevented); the rest are unrelated.

The alternative is a standalone single-item row, which is more honest to the current wording but
adds a group carrying one item. Widening was chosen as the smaller change that keeps the section's
own promise — *"Every open backlog item has exactly one home below"* — true.

## The audit was deliberately left unchanged

`.planning/v1.2-MILESTONE-AUDIT.md` has a zero diff, asserted mechanically. It is a dated record of
what one audit found on one day; rewriting it to point forward at a todo that did not exist when it
was written would make it a worse record. **The link runs todo → audit, never the reverse.** This is
the one place in this task where the obvious tidy-up was the wrong move.

## Pointer targets — four accepted, six rejected

| File | Decision | Reason |
|---|---|---|
| `.claude/CLAUDE.md` | **ADDED** (4 lines) | Loaded into every session automatically — the only file with that property, and it did not mention the doc at all. The highest-value gap, and the only pointer requiring nobody to go looking |
| `docs/VERIFICATION-CHECKLIST.md` | **ADDED** (one clause) | Already the "what to verify" half of the pair and already carries the §4a callout. Extended to name §5d; no second callout |
| `docs/MODULES.md` | **ADDED** (one paragraph) | Following it verbatim walks you into the trap — it prints `python3 -m http.server 8000` as *the* canonical dev server, and §1 exists to say port reuse serves cached ES modules. Framed as the verification-pass exception, so 8000 stays right for ordinary dev |
| `.planning/STATE.md` | **ADDED** (to the existing bullet) | Every GSD command loads it. The MP test-harness bullet pointed at MEMORY.md but not at the repo's own runbook |
| `README.md` | REJECTED | Public-facing, for people who want to play the game. A browser-automation runbook is not that. Diff-gated to zero, and it holds |
| `.planning/HANDOFF.md` | REJECTED | Stale — names a branch and a "nothing merged" claim untrue for three milestones. A pointer in a document nobody trusts is noise |
| `.planning/PROJECT.md` | REJECTED | CLAUDE.md's project block is generated *from* it; a pointer here would duplicate or fight the CLAUDE.md one on regeneration |
| `.continue-here.md` | no change | Already points at the doc, and is transient anyway |
| `AGENTS.md`, `CONTRIBUTING.md` | REJECTED | Neither exists |
| `RULES.md`, `Rules_boardgame.md` | REJECTED | Player-facing game rules — wrong audience |

## Two things kept accurate on purpose

**The detach bullet does not claim a test catches you.** §5d states that
`scripts/net_contract_check.js` inventory-gates the watchers *declared* in `src/net/watchers.js`
against `registry.attach()` calls in source, so a console-attached listener is invisible to it. The
reason to detach is tidiness. Written so a reader cannot come away thinking the gate has their back.
*(This corrects the brief the planner was given, which had the rationale wrong.)*

**§5d cites both copies of `13-VERIFICATION.md`** — the working copy first, and the
`.planning/milestones/v1.2-phases/` archive named as the one that survives `/gsd-cleanup`. A
permanent `docs/` file pointing only at a directory that gets archived would rot.

## The cause is recorded as SUSPECTED everywhere

In the todo's heading, its prose, and its framing. It came from a code read after the fact and was
never isolated with a test. The one number quoted — 116ms from Phase 13's Run 2 trace — is labelled
as one sample from one session on one network, not a characterisation of the round-trip. The
suspected window has never been measured directly.

## The CLAUDE.md placement risk, recorded rather than hidden

The new section sits between `<!-- GSD:workflow-end -->` and `<!-- GSD:profile-start -->`, outside
every GSD marker block, because content inside a block is overwritten when that block regenerates.
Outside is the safest available position but **not a guarantee** — a future GSD command that
rewrites the file wholesale would still take it. Worth re-checking after any `/gsd-map-codebase` or
`/gsd-profile-user` run. The section is four lines; that file loads into every session.

## Verification

| # | Check | Result |
|---|---|---|
| 1 | `git status --porcelain -- src/` empty | PASS — before each of the three commits, not just at the end |
| 2 | audit / `README.md` / `package.json` / `index.html` / `scripts/` unchanged vs `197cac2` | PASS — zero-line diff |
| 3 | 11/11 frontmatter fields in the todo's first 13 lines | PASS |
| 4 | §5c < §5d < §6 in `docs/DRIVING-THE-GAME.md` | PASS (172 < 235 < 296) |
| 5 | All four pointer files contain `DRIVING-THE-GAME` | PASS |
| 6 | `GSD:profile-*` block byte-identical to committed form | PASS |
| 7 | Exactly one ROADMAP home for the finding | PASS |

§5d added 61 lines, removed 0. `npm test` not run — no code touched.

## OPEN FOR WYATT

**The pause race is filed, not fixed, and not diagnosed.**

- Cause is **suspected only** — a reading of the source, never isolated with a test, and the width
  of the window has never been measured.
- **The decision has not been made:** accept the race as a known limit of a shared clock over a
  network, or have the host apply the pause optimistically and locally before the round-trip. Option
  two has a real cost — `applyPauseState` is deliberately host-only and the guest branch of
  `watchPause` deliberately never mutates the deadline (**D-06**), so an optimistic local apply must
  respect that authority split or it trades a fairness papercut for a desync.
- Reproducing it needs the §5d armed watcher. A hand-driven session cannot hit the window — that is
  why §5d exists.

Two smaller calls, each reversible in one line: **severity `low`**, and the **ROADMAP placement** as
a widening of `Fair Play Online` rather than a standalone row.
