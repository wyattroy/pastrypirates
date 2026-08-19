---
phase: 01-before-the-engine-freezes
plan: 06
subsystem: testing
tags: [game-balance, bot-ladder, determinism, decision-gate, deploy]
status: complete

requires:
  - phase: 01-03
    provides: the one-brain ladder rewrite and the pre-dubloon balance baseline on seed family ×7919
  - phase: 01-04
    provides: the pass dubloon itself — one `doPass(p)` paid at all three emission sites
  - phase: 01-05
    provides: the one-brain engine, so the after-run measures an unconfounded tree
provides:
  - "01-BALANCE-DELTA.md — what the pass dubloon did to bot behaviour on identical seeds, with full provenance and no verdict of its own"
  - "D-07's balance gate CLOSED: Wyatt ruled on 2026-08-19, 'ship it' — the payout stays at one dubloon"
  - "A measured attribution: forcing the payout to zero on the after-tree reproduces the baseline record field for field, so nothing in the 18-commit range moved these numbers except the dubloon"
  - "Phase 1 complete — nothing in it forces the v2 determinism corpus to be recorded twice"
affects: [phase-03-safety-net, phase-06-cutover, phase-09-written-record]

tech-stack:
  added: []
  patterns:
    - "A measurement report that reaches no conclusion, with the decision appended afterwards as a dated event in its own section"
    - "Attribution proved by reverting the suspect on the current tree rather than by citing prior commits' behaviour-neutrality claims"

key-files:
  created:
    - .planning/phases/01-before-the-engine-freezes/01-BALANCE-DELTA.md
  modified: []

key-decisions:
  - "D-07 CLOSED — Wyatt, 2026-08-19: 'ship it'. The pass dubloon ships at one coin. The payout was not lowered, the held-out seed family was not run, the ladder was not re-run."
  - "The build stamp was deliberately NOT bumped. Nothing under 4/ changed in this plan, and a stamp bump with no gameplay behind it is the one thing the stamp exists not to do. 2026-08-18e IS the Phase 1 build."
  - "The decision is recorded in the delta report as an event with its date and his words, in a section of its own, so the report still reaches no verdict of its own."

patterns-established:
  - "Record the ruling, not a conclusion: a measurement document gains a dated decision section rather than being rewritten to agree with the decision."
  - "Repoint a stale line, do not rewrite it: the 'held-out family remains available' sentence became a pointer to the decision instead of being deleted."

requirements-completed: [RULE-01, FIX-06]

metrics:
  duration: "continuation ~35 min; plan 06 end to end ~1h 40m"
  completed: 2026-08-19
---

# Phase 1 Plan 6: D-07's Balance Gate and the Phase Close-out — Summary

**Wyatt saw what the pass dubloon actually did to the bots, on the same 400 games played twice, and told us to ship it at one coin — so the engine can freeze on this rule.**

---

## What happened, in plain words

The one new rule of this milestone is that passing your turn pays you a dubloon. Passing is the move nobody can ever be denied, so paying for it risks giving every captain a reason to sit still. Wyatt made that a **gate on this phase** rather than a note for later, because Phase 3 locks the engine's behaviour into a recorded corpus — after that, changing the payout costs a re-record.

So the ladder played the same 400 games twice: once before the coin existed, once after.

**What moved:** bots pass slightly more — 55.6 passes per 100 turns against 55.0 — and every one of the four captains rose. Voyages did **not** drag; they got a third of a round **shorter**. The trader captain won 15 fewer games out of 400. Nothing stalled, in either run.

**What he decided:** shown those numbers, Wyatt said **"ship it"** (2026-08-19). The dubloon stays at one coin.

**What that means for the phase:** Phase 1 is done. The engine can now freeze on this rule without anyone having to record the determinism corpus twice.

---

## The checkpoint answer, verbatim

> **"ship it"**
> — Wyatt, 2026-08-19

He was given three options: ship at one coin, lower the payout before the freeze, or spend one more run on the held-out seed family first. He took the first.

Consequences, carried out exactly and no further:

| | |
|---|---|
| `passCoin` on `roundCfg()` in `4/src/engine/index.js` | **unchanged at 1** — verified `3048: passCoin:1,` |
| the held-out seed family (×104729) | **not run** — he did not ask for it |
| the 400-game ladder | **not re-run** — nothing changed, so there was nothing new to measure |

---

## The report still carries no verdict of its own

This mattered enough to handle carefully. `01-BALANCE-DELTA.md` was written to report movement and reach no conclusion, and it still does. The decision was **appended as an event** — its own section at the foot of the file, headed *"The decision — recorded, not concluded"*, carrying the date, the option chosen and his exact words.

Nothing above that section was altered to agree with it. The measurements, the yardstick, the attribution test and the *"why it plausibly moved"* reasoning are byte-for-byte what they were before he answered.

One line did need attention: *"It remains available as one more ~90-second run..."* about the held-out family was present-tense and would have gone stale the moment he ruled. It was **repointed, not rewritten** — it now reads as the past-tense offer it was, with an arrow to the decision below it. A pointer cannot go stale; a copy always can (CLAUDE.md §5).

---

## The build stamp — why it was deliberately not bumped

The plan's must_have says to bump `PP4_STAMP` and push, "because the only way Wyatt can see any of this is `playpastrypirates.com/4` on his phone." That was written when this plan might still have **changed the payout**. It did not.

**Nothing under `4/` changed in this plan.** Proved, not assumed:

```
$ git diff --name-only | grep -E '^(4/|src/|CNAME|robots\.txt|sitemap\.xml)' | wc -l
       0
```

Bumping the stamp would send Wyatt to look for a new build carrying no new gameplay — which is precisely the thing the stamp exists **not** to do. Its whole value is that a new stamp means new work he can play.

**The must_have is satisfied in substance, just earlier in the phase.** The stamp was bumped four times as the phase went — `2026-08-18a` (wave 1), `b` (wave 2), `c` (the pass dubloon playable), `d` (wave 4, one brain in the engine) — and finally **`2026-08-18e`**, which is **the Phase 1 build**. That stamp already carries everything this phase produced: the window guard, the namespaced turn-clock key, the pass dubloon, the narration tag, and the Pass button that says what it pays.

```
$ grep -n "PP4_STAMP" 4/src/ui/stage.js
32:const PP4_STAMP = "2026-08-18e";
929:    stamp.textContent = "v4 · build " + PP4_STAMP;
```

**The stamp to look for is `2026-08-18e`, at https://playpastrypirates.com/4**

---

## Evidence, re-verified and quoted

Nothing below is recalled. Every line is what the command printed today.

### All six `4/` gates exit 0

```
stage_import_check exit=0
pp4_timeroff_check exit=0
pass_coin_test exit=0
pass_narration_test exit=0
planner_singleton_check exit=0
4/no_undef_check exit=0
```

### Root `npm test`

```
PASSED — 0 failing check(s)
```

21 gates, counted rather than typed: `node -e "console.log(require('./package.json').scripts.test.split('&&').length)"` → `21`.

### The engine is still determinism-clean

```
$ grep -rn "Math\.random\|Date\.now\|performance\.now" 4/src/engine/ | wc -l
       0
```

`planner_singleton_check.js` reports the same independently, naming the two files it scanned: *"scanning 2 file(s): bakeoff.js, index.js"*, then `no Math.random` / `no Date.now` / `no performance.now`, each `got=0 want=0`. Two paths agree.

### The two undeclared-identifier checkers are still byte-identical

```
$ diff scripts/no_undef_check.js 4/scripts/no_undef_check.js
diff exit=0 IDENTICAL
$ cmp scripts/no_undef_check.js 4/scripts/no_undef_check.js
cmp exit=0 byte-identical
```

Both exit 0 on their own trees.

### Site-identity files

```
$ git status --short -- CNAME robots.txt sitemap.xml
(nothing)
$ git diff --name-only 8edd8ea..HEAD | grep -E '^(CNAME|robots\.txt|sitemap\.xml)$' | wc -l
       0
```

**Untouched, and never copied anywhere.** This plan performed no preview deploy and no file sync of any kind — the only `rsync`-shaped operation in this repo is `scripts/deploy-preview.sh`, which was not run. T-01-15 mitigated.

### Git divergence — re-run after the last commit, not recalled

```
$ git fetch origin
$ git rev-list --count origin/main..main
0
$ git rev-list --count main..origin/main
0
```

These were both `0` at fetch time. **This agent did not push** — the orchestrator owns the push, so the count from this plan's two commits (`8107356` already pushed, `09aac6e` local) must be re-read after that push, never carried from here. Naming that explicitly is the point of T-01-17.

---

## Diff-scope proof — and one honest exception

The phase range is `8edd8ea..HEAD` (`8edd8ea` is the last commit before Phase 1's first artifact).

**The four trees that must be absent, counted:**

```
v2/        -> 0
v2bakeoff/ -> 0
3/         -> 0
src/       -> 0
```

Root `src/` at zero is the one that matters most: **the game real players are playing right now was not touched by this phase at all.**

**One path sits outside the plan's named set, and it is not glossed over:**

```
$ git diff --name-only 8edd8ea..HEAD | grep -v '^4/' | grep -v '^\.planning/' \
    | grep -v '^scripts/no_undef_check\.js$' | grep -v '^scripts/bot_ladder4\.js$'
.claude/CLAUDE.md
```

That is `2de0a63`, the quick task `260818-vot` that ran interleaved with this phase — it is where **Wyatt's own plain-English rule (rule 4) was written into the rulebook** last night. It is not game code, not a tree that must be absent, and not a site-identity file. It is named here rather than filtered away, because a scope proof that quietly widens its own filter has stopped being a proof.

---

## Phase-wide consistency sweep (CLAUDE.md §2)

Every surface this phase touched, checked in one place rather than per-plan. Counts are measured.

**The turn-clock key — five `4/`-side sites now on the namespaced key.** `pp4_timerOff` appears 8 times across `4/src/orchestrator.js` and `4/src/ui/stage.js` (reads, writes and one explanatory comment). Six mentions of the old shared `pp_timerOff` survive and **all six are correct**: five are comments explaining the migration, and the sixth is the deliberate `store.removeItem("pp_timerOff")` at `4/src/ui/stage.js:1522` — the one-time cleanup, fenced behind the `pp4_timerOffCleaned` marker at `:1521`/`:1523`. **No live write to the shared key remains.**

**The three shared identity keys, deliberately left un-prefixed.** `pp_id` (8), `pp_lastName` (7) and `pp_muted` (2) still sit un-namespaced in `4/src/`, and that is D-04 working as intended — *share who you are, split how you play*. Not an oversight; the precedent Phase 6's cutover copies.

**The three pass sites, all routed through one method.** `4/src/ui/flow.js:1882` (human menu), `4/src/ui/flow.js:2163` (bot fallback in the animated turn), `4/src/engine/index.js:2742` (engine fallback) — every one calls `doPass(p)`, declared once at `4/src/engine/index.js:958`.

**Both bot paths pay.** The engine fallback and the browser fallback are separate code and both were changed. A fix to only the engine would have paid the simulator and left every real browser game unpaid.

**The two copies of the undeclared-identifier checker: still byte-identical**, proved above by both `diff` and `cmp`.

**The deleted planner subtree: gone, and gated.** `planTurnClassic` appears 0 times anywhere in `4/`.

**The four v3-suffixed helpers: still standing**, named by the gate rather than by memory — `legTurns3`, `turnsToWin3`, `turnsToWin3If`, `tour3`, each confirmed declared as a method. That one-character distinction was plan 05's whole risk and a gate now holds it.

---

## Health check findings

```
"status": "degraded"
errors: 0
W019 count: 8
non-W019 warnings: 0
```

**All eight warnings are `W019`**, on exactly the eight files Wyatt keeps deliberately — `COPY-AND-TASTE-REVIEW.md`, `HANDOFF.md`, `PLAYTEST-2026-08-01-PHASE-18-21-22.md`, `REPO-STRUCTURE-AUDIT.md`, `WINDOWS.md`, `art-audit.md`, `art-generation-process.md`, `how-to-play-pastry-pirates.md`. This is the known-noise list in `docs/PLANNING-HEALTH.md`, matched item for item. **Zero errors and zero warnings of any other code** — nothing new appeared during this phase.

The one `info` was `I001: 01-06-PLAN.md has no SUMMARY.md`, which this file closes.

---

## Probes and servers

```
$ ps aux | grep -E "remote-debugging-port|http\.server" | grep -v grep | wc -l
       0
$ pkill -f remote-debugging-port; pkill -f http.server
$ ps aux | grep -E "remote-debugging-port|http\.server" | grep -v grep | wc -l
       0
```

**Zero before and zero after.** This plan started no headless Chrome and no local server — the ladder is a counted loop that needs neither. The kill was run anyway, and it found nothing to kill.

---

## Deviations from Plan

**1. The build stamp was not bumped, and that is the deviation.**
- **Found during:** Task 3
- **Issue:** The plan's must_have and Task 3 both require bumping `PP4_STAMP`. That requirement was written on the assumption that this plan might change the payout. Wyatt's decision was to ship as is, so nothing under `4/` changed.
- **Judgement:** Applied the rule's intent over its letter. A stamp bump exists to tell Wyatt "there is new work to play". Bumping it here would have sent him to look for a build identical to the one he already has.
- **Substance preserved:** The stamp was bumped five times across the phase, ending at `2026-08-18e`, which carries every piece of Phase 1's gameplay. The work is on `main`.
- **Files modified:** none.

**2. Task 3's payout-change branch was not executed.**
- Not a deviation so much as the branch not being taken: Task 3 opens *"Carry out the decision from the checkpoint first, if it was anything other than shipping as-is."* It was shipping as-is, so the third ladder run, the narration-tag update and the held-out family run were all correctly skipped.

**3. `.claude/CLAUDE.md` appears in the phase diff, outside the plan's named path set.**
- **Cause:** the interleaved quick task `260818-vot` (`2de0a63`), which wrote Wyatt's plain-English rule into the rulebook.
- **Action:** none — it is documentation, not game code. Recorded above rather than filtered out of the scope proof.

**No auto-fixes were needed.** No bug, missing-critical-functionality or blocking issue arose. Rules 1–3 were not invoked.

---

## Known Stubs

None. No placeholder, hardcoded empty value or unwired component was introduced by this plan — its only output is a document.

---

## Threat Flags

None. This plan introduced no network endpoint, auth path, file-access pattern or schema change. The two `high` threats in the plan's register are deployment-integrity threats, both mitigated and evidenced above: **T-01-15** (site-identity files — zero in the phase diff, no sync performed), **T-01-16** (diff scope — four trees confirmed absent, root `src/` untouched), **T-01-17** (git state re-run, never recalled), **T-01-18** (the verdict was Wyatt's, taken at a blocking checkpoint, not auto-approved).

---

## What this closes

**Phase 1 is complete.** All five of its success criteria hold, and D-07 — the one that could not be closed by any measurement, only by Wyatt — is closed with his ruling on the record.

**Nothing in this phase forces the v2 determinism corpus to be recorded twice.** That was the phase's whole purpose. Phase 3 can now record against an engine whose one new rule has been measured, ruled on, and left alone.

---

## Task Commits

1. **Task 1: Measure after, and report exactly what moved** — `8107356` (docs)
2. **Task 2: D-07 decision checkpoint** — answered by Wyatt, no commit
3. **Task 3: Record the decision and close the phase** — `09aac6e` (docs)

## Self-Check: PASSED

- `01-BALANCE-DELTA.md` — FOUND
- `01-06-SUMMARY.md` — FOUND
- commit `8107356` — FOUND
- commit `09aac6e` — FOUND
