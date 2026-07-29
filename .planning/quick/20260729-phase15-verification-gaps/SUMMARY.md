---
task: phase15-verification-gaps
type: quick
created: 2026-07-29
completed: 2026-07-29
baseline_commit: 9ddd214
final_commit: 8b18467
status: awaiting-checkpoint
requirements: [NARR-01, NARR-05, NARR-06]
decisions: [D-16, D-17, D-25, D-26, D-29, D-50, D-52, D-53, D-54]
tasks_completed: 8
tasks_total: 9
commits: 8
files_modified: 11
gates_before: 14
gates_after: 15
---

# Quick Task Summary: Phase 15 Verification Gaps

Closed all five gaps `15-VERIFICATION.md` found in Phase 15 across 8 atomic commits, every fix
gated by an automated check that now runs in `npm test`. **Task 9 (the blocking review gate) is
open and awaiting Wyatt** — it was not resolved, per instruction.

## One-liner

Two binding decisions Wyatt recorded in the phase contract (D-17, D-29) had been recorded and then
never executed, the narration coverage self-check was red, and four approved copy lines plus two
icons were dropped — all now applied and permanently gated, with `src/engine/index.js` at an empty
diff throughout.

## What landed

| Gap | Fix | Commit | Gated by |
|---|---|---|---|
| 3 (blocker) | `AD_HOC_META` re-synced to `narrateCurrent`'s shifted sites; inventory regenerated | `0cc674d` | extractor exits 0 |
| 5 (partial) | `⚪️` x2 and the word "firing" restored in the two both-HEADS battle lines | `ed42600` | source literal grep + `emojify()` resolution check |
| 4 (partial) | the 4 divergent approved second-party lines (D-54) applied | `9313b98` | 11 new assertions in `narration_test.js` |
| 1 (blocker) | D-17 — `fmtItem()` renders ingredients as custom art | `e746cf3` | 38 new assertions across all 7 ingredients |
| 2 (blocker) | D-29 — 15 strings in `src/` converted | `1cef2fb` | `shipped == pirateVoice(baseline)` proof |
| 2 (blocker) | D-29 — 17 lines in `index.html` converted, `--` to em dash per D-53 | `6bbf19e` | residual gate returns 0 |
| — | the D-29 register becomes a **standing** invariant, red-proof drilled | `eadfab2` | `ui_contract_check.js` assertion 5 |
| 3b | `AD_HOC_META` re-synced after the copy edits; extractor wired into `npm test` | `8b18467` | orphan/count/placeholder assertions |

`npm test` went from **14 gates to 15** and was green before every one of the 8 commits, not only
at the end.

## Governing constraints — all held

- **`src/engine/index.js` has an EMPTY diff.** Verified after every task and again across the whole
  range: `git diff 9ddd214..HEAD --name-only -- src/engine/` returns 0 files. No event, no event
  field, no engine behaviour changed. All 31 determinism fixtures verify (31/31, "All seeds passed")
  with no re-record.
- `npm test` exit 0 at every commit boundary.
- `src/ui/` still never imports `src/net/` (`module_graph_check.js` green).
- Vanilla JS, no framework, no build step, no new dependency. Every decision annotated inline in the
  established `// D-NN (Wyatt-approved 2026-07-29): ...` form.
- Approved copy rows were matched to source by `AD_HOC_META` label and string literal, never by line
  number.

## How each fix was proven, not just asserted

Three checks are worth calling out because they prove something stronger than "looks right":

1. **D-29 is proven equal to what Wyatt approved.** The audit page ran its own `pirateVoice()` LIVE
   at render, so a card tagged `keep` *displayed* converted text — under D-25 that converted text is
   what he signed off on. Rather than hand-reviewing, each of the 15 shipped literals is asserted
   byte-equal to `pirateVoice()` applied to *its own baseline text at 9ddd214*. That proves
   shipped == approved.
2. **D-17 is proven byte-identical on every non-ingredient path.** `fmtItem()`'s three traps were
   checked probe-by-probe against the baseline blob: `"nothing"`, `"Toasty Wheat"`, `"2 coins"`,
   `"coins"`, `"Toasty Wheat + 2 coins"`, `""` all produce output identical to before the change.
3. **Both new gates were red-proofed against the real tree, not only synthetic fixtures.** Reverting
   one converted line makes `ui_contract_check.js` fail naming `src/ui/panel.js:164`. Drifting one
   `AD_HOC_META` key makes `npm test` exit 1 naming the file, line and enclosing function.

## Deviations from plan

Three, all in *verification commands* rather than implementation. No implementation deviated from
the plan's stated intent, and nothing was weakened to make a gate pass.

### 1. Task 3's `giving away a crate` region grep is over-broad as written — corrected

**Plan text:** `sed -n '470,515p' src/ui/util.js | grep -F 'giving away a crate'` -> FAIL if found.

**Problem:** the third-person spoil clause (`${pn(loser)} bribes their way out of giving away a
crate with ...`) legitimately still reads "giving" — the plan itself requires the winner-addressed
and neutral renderings to stay byte-unchanged. So this gate would fail on a *correct*
implementation.

**Resolution:** used the gate the plan's own failure message describes — scoped to the loser branch
via `grep 'ye bribe yer way out of giving away'`, which is 0. The pre-D-54 loser wording is gone;
the third-person wording correctly survives. This is a plan defect in the check, not in the fix.

### 2. Task 3's test expectations needed correcting three times before passing

My first-draft assertions in `narration_test.js` were wrong in ways the failures exposed:
- Names go through `pn()` (which wraps in `<b style="color:...">`), not bare `pname()`.
- The score slot is **always** attacker-defender order, never winner-first. That is pre-existing
  shipped behaviour of the shared head and out of scope here, so the fabricated event makes the
  *attacker* the winner to reproduce his approved "wins 2-1" rather than "fixing" the ordering.
- The bribe clause keys on `viewerIsLoser`, so the winner's view reads the *third-person* form.

Recorded because it is a real trap for the next person: the pins now use `pn()` as the single source
of truth so they track copy rather than styling.

### 3. Task 7's drill needed a fifth, negative fixture

The plan asked for one synthetic violation. I added four (`5a` src violation, `5b` index.html
violation, `5c` layout corruption, `5d` `layoutWide` count drift) plus **`5e`, a negative control**
proving the exclusion list does not simply swallow everything. `5e` earned its place immediately: it
failed on the first run because my `src/ui/util.js` fixture was not faithful to the real `sidebet`
builder's code shape. An assertion that can only ever pass is not a gate either.

## Recorded, deliberately not done

- **`AD_HOC_META` anchor-text migration.** The line-number keying has now drifted twice. The durable
  fix is the anchor-text convention the extractor already uses in its own D-32 section. It is a
  25-entry refactor with its own failure modes and does not belong in a gap-closure pass — recorded
  as a follow-up in the extractor's header, with instructions for the next person who hits the
  drift. Wiring the extractor into `npm test` at least makes the drift loud.
- **Rows `:482`/`:486` `addressedNotes`** ("but yer firing downwind...", "Ye land a hit!") remain
  unapplied. `rmsg` is a single string in the battle scoreboard with **no per-seat variant
  mechanism**, unlike `flash()`. Delivering these needs new plumbing the verification report did not
  scope. Raised at Task 9.
- **`src/ui/recipe.js`'s cookbook prose** is excluded from both the conversion and the standing gate,
  with a `>>> REMOVE THIS EXCLUSION THE MOMENT HE RULES` marker in `ui_contract_check.js`.

## Known stubs

None. No placeholder values, no TODO/FIXME introduced, no skipped tests, no unrun `<verify>` blocks.

Two `<human-check>` items in the plan are genuinely unrunnable here (no browser in this environment)
and are folded into the already-scheduled two-tab playtest, exactly as the plan specifies:
- **Task 4** — visually confirm a trade line's ingredient renders as the island's custom art
  (`15-VERIFICATION.md`'s **P8 flips from expected-FAIL to expected-PASS**).
- **Task 6** — read the splash, name-entry, room-code and how-to-play screens end to end for
  register consistency.

## OPEN: Task 9 — blocking review gate, not resolved

Four copy rulings are Wyatt's call and were deliberately left for him:

1. **`src/ui/recipe.js:34,69,146`** — recipe descriptions and cooking-method text.
   **Recommendation: LEAVE.** Cookbook prose; "melt-in-yer-mouth" reads as a typo.
2. **`index.html:743`** — the credits paragraph, his own authorial prose about real people.
   **Recommendation: LEAVE.** (Proven still byte-unchanged by Task 6's gate.)
3. **`index.html:650` and `:761`** — the anonymised-playtest-data notice and the feedback-form
   placeholder. **CONVERTED** per D-29 RESOLVED; flagged for confirmation because a privacy
   disclosure in pirate voice is worth showing him.
4. **`misc:battleLine:src/orchestrator.js:482`/`:486` `addressedNotes`** — **Recommendation: defer**
   to a possible Phase 16 item; needs per-seat plumbing the battle footer does not have.

`P12` in `15-VERIFICATION.md` is now answerable. `P1-P4` and `P5` are unchanged and still
playtest-only — no harness can reach them.

## Self-Check: PASSED

All 11 modified files exist on disk. All 8 commit hashes verified present in `git log`. Final
verification block from the plan re-run at `8b18467`:

- `npm test` -> exit 0 (15 gates)
- `node scripts/determinism_baseline.js --verify` -> **31/31, All seeds passed**
- `git diff --stat 9ddd214..HEAD -- src/engine/index.js` -> **empty output**
- `node scripts/module_graph_check.js` -> exit 0
- `node scripts/ui_contract_check.js` -> 5/5 PASS
- `node scripts/ui_contract_check.js --drill` -> ALL 5 ASSERTIONS RED-PROOF DRILLED OK
- `node scripts/extract_narration_lines.js` -> exit 0, inventory byte-stable across two runs
- D-29 residual gate -> **0** in both `src/**.js` and `index.html`
- `layet` -> 0 hits; `layoutWide` -> 4 (index.html) + 1 (board.js), unchanged
