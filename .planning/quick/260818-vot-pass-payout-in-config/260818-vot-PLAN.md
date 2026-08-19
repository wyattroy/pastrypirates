---
quick_id: 260818-vot
phase: quick/260818-vot-pass-payout-in-config
plan: 01
type: execute
wave: 1
depends_on: []
autonomous: true
requirements: [RULE-01, RULE-02]
files_modified:
  - .planning/quick/260818-vot-pass-payout-in-config/260818-vot-READERS.md
  - 4/src/engine/index.js
  - 4/src/ui/flow.js
  - 4/src/ui/util.js
  - 4/scripts/pass_coin_test.js
  - 4/scripts/pass_narration_test.js

must_haves:
  truths:
    - "The pass payout is written in exactly ONE place — a `passCoin` field on `roundCfg()` — and every other site derives it. No bare payout literal survives in `doPass`, in the Pass button label, or in the narration tag (QD-1, CLAUDE.md §2 'nothing is a constant')."
    - "At the shipped default the rendered narration is BYTE-IDENTICAL to D-06's approved wording, proven by the existing 100-rendering gate passing with its literal tag constant unchanged. The de-hardcoding is invisible at the default and is proved so rather than asserted (QD-4)."
    - "The amount the narration RENDERS equals the purse delta a real `doPass` OBSERVES — checked at the shipped default AND at a deliberately non-default payout, so neither side of the comparison is read off the other's source line."
    - "The shipped default is pinned against a hand-typed literal in BOTH gates, so moving the config default is caught. This is the assertion a vacuous gate would not have, and it is red-proofed by exactly that sabotage (the central hazard, CLAUDE.md §2)."
    - "`Game.prototype.doPass(p)` still increments the purse BEFORE calling `this.ev(...)`. `ev()` snapshots the purse at call time, so the ordering is a hard predicate, asserted off the recorded snapshot and not off the order of two source lines (QD-2)."
    - "The Pass button states the amount following the ATTACK precedent — leading 🌊 kept, `nobrk`-wrapped parenthetical, raw 🌕 resolved at `panel()`'s emojify chokepoint, no `short:` label (QD-3, D-50)."
    - "The engine emits exactly what it emitted before: no key added, removed or renamed in the pass event. The amount does NOT ride on the event."
    - "`4/src/engine/` stays determinism-clean — zero `Math.random`, `Date.now`, `performance.now`."
    - "A 20-game ladder record is byte-identical before and after the change, so wave 5 plan 06 can still attribute its movement to the pass dubloon and not to this refactor (HARD-WON-LESSONS §2, confounded metrics)."
    - "Every reader of the pass payout — production sites, gate assertions, ladder, docs, planning record — was enumerated as commands BEFORE production code changed, and the enumeration is written down."
    - statement: "No site-identity file left this repository. `CNAME`, `robots.txt` and `sitemap.xml` are untouched. Nothing under the repo-root `src/` was modified. `PP4_STAMP` is untouched — plan 01-06 owns that line."
      verification: backstop
  artifacts:
    - ".planning/quick/260818-vot-pass-payout-in-config/260818-vot-READERS.md"
    - "`passCoin` on `roundCfg()` in 4/src/engine/index.js"
    - "the amount-bearing Pass button in 4/src/ui/flow.js"
    - "the config-derived pass tag in 4/src/ui/util.js"
    - "two gates that stay falsifiable when the payout moves"
  key_links:
    - "`roundCfg().passCoin` -> `doPass(p)` -> the recorded event snapshot -> `4/scripts/pass_coin_test.js`"
    - "`roundCfg().passCoin` -> the Pass button label AND the narration tag -> both must agree with the OBSERVED purse delta -> `4/scripts/pass_narration_test.js`"
    - "before.json / after.json byte-identity -> `01-BALANCE-BASELINE.md` -> wave 5 plan 06's attribution stays clean"
    - "this field becomes the single edit point for D-07's possible payout reduction at the wave 5 checkpoint"
---

<objective>
Move the pass payout out of three independent literals and into one config field on `roundCfg()`,
then put the amount on the Pass button.

Purpose: every other coin amount in the game is config-derived. The pass dubloon was the only bare
literal, and once the button carries it there are THREE copies that must move together. Wave 5's
D-07 checkpoint may lower the payout — three literals that must move in lockstep is exactly how the
interface ends up lying to a player about their own purse.

Output: one `passCoin` field; three derived sites; two gates that still fail when they should; a
byte-identical ladder record proving the engine did not move.

**This change is behaviour-neutral by construction and must be proved so.** At the shipped default
of 1 the rendered narration, the purse delta and the ladder output are all unchanged. Anything else
is a bug in this task, not a finding about the game.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
**Read before writing a line** (CLAUDE.md §4; absolute paths — this repo has more than one tree with
an identical internal layout):

- `/Users/wyattroy/Documents/Projects/pastrypirates/.claude/CLAUDE.md` — §2 (nothing is a constant;
  consistency; read the graveyard), §3 (absolute paths; kill every probe; never push blind)
- `/Users/wyattroy/Documents/Projects/pastrypirates/docs/HARD-WON-LESSONS.md` — §0 checklist item 4
  (list what reads a quantity, GATES INCLUDED, before changing how it is produced), §2 (verify
  against an independent path; verify a check can FAIL; beware confounded metrics), §3 (a harness is
  unreviewed code; put a control in every harness whose value you already know)
- `/Users/wyattroy/Documents/Projects/pastrypirates/.planning/phases/01-before-the-engine-freezes/01-CONTEXT.md`
  — D-06 (the approved wording and why it is a subjectless fragment), D-07 (the pending balance gate)
- `/Users/wyattroy/Documents/Projects/pastrypirates/.planning/phases/01-before-the-engine-freezes/01-05-SUMMARY.md`
  — the behaviour-neutrality convention this task copies, including the recorded ladder sha256

**The graveyard was read** (CLAUDE.md §2, run as commands, results recorded here so the executor does
not re-run a settled argument):

```
git log --all --oneline --grep="passCoin" -i     -> no hits
git log --all --format="%h %s" -S "passCoin"     -> no hits
git log --all --format="%h %s" -S "doPass"       -> 01-04 and 01-05 only (introduced 2026-08-18)
```

**Nobody has defended this number and nobody has tried this refactor before.** The payout is one day
old. This is not a settled argument being re-run.
</context>

<tasks>

<task type="auto">
  <name>Task 1: List every reader of the payout, and pin the before-ladder</name>
  <precondition>The working tree is clean and at or after commit `a23af98`, so plan 01-04's `doPass` and plan 01-03's rewritten `scripts/bot_ladder4.js` are both present. `git status --short` prints nothing.</precondition>
  <files>.planning/quick/260818-vot-pass-payout-in-config/260818-vot-READERS.md</files>
  <read_first>
    - `/Users/wyattroy/Documents/Projects/pastrypirates/docs/HARD-WON-LESSONS.md` §0 item 4 — this task IS that item, executed
    - `/Users/wyattroy/Documents/Projects/pastrypirates/.planning/phases/01-before-the-engine-freezes/01-05-SUMMARY.md` — the "Behaviour-neutrality, measured" section carries the ladder command and its recorded sha256
  </read_first>
  <action>
No production file is edited in this task. It exists because the −21.2 ladder regression came from
changing how a quantity is produced without first listing what reads it, and because a gate re-pointed
at a calculation goes VACUOUS rather than wrong.

**(a) Enumerate as commands, not from memory.** Run each of these from the repo root and paste the
raw output into the record file:

```
grep -rn "coins *+= *1\|coins++" /Users/wyattroy/Documents/Projects/pastrypirates/4/src/
grep -rn "Recipe idea" /Users/wyattroy/Documents/Projects/pastrypirates/4/ /Users/wyattroy/Documents/Projects/pastrypirates/scripts/
grep -rn "doPass" /Users/wyattroy/Documents/Projects/pastrypirates/4/
grep -rn "new Game(" /Users/wyattroy/Documents/Projects/pastrypirates/4/ /Users/wyattroy/Documents/Projects/pastrypirates/scripts/bot_ladder4.js
```

**(b) Classify every hit into one of four columns** in the record file — this classification is the
deliverable, not the grep output:

| Reader | What it reads | Treatment |
|---|---|---|
| … | the QUANTITY / the RENDERED STRING / the SOURCE TEXT | stays a pinned literal / becomes a derived cross-check / unchanged |

Three readers are already known and must appear with their treatment decided:
- `4/scripts/pass_coin_test.js` asserts the purse delta against a hand-typed 1 — **stays a pinned
  literal**, because that pin is what catches the config default moving.
- `4/scripts/pass_narration_test.js` holds the tag as a hand-typed constant — **stays a pinned
  literal**, for the same reason, and it is D-06's approved wording.
- `4/scripts/pass_coin_test.js` counts substrings in `4/src/ui/flow.js` (`doPass` exactly twice,
  bare pass emissions zero) — **unchanged**, but see the QUOTED-vs-BARE trap in Task 2.

**(c) Answer the NaN question as a command.** `doPass` is about to read a config field. If any
`4/`-engine Game is constructed from a cfg that lacks that field, the purse becomes NaN silently.
The `new Game(` enumeration above must show that every construction site routes through `roundCfg()`
— including the solo-resume rebuild at `4/src/ui/util.js:2009` and the multiplayer host write at
`4/src/orchestrator.js:1512-1526`. Record the verdict. If any site does NOT route through
`roundCfg()`, stop and report it — do not paper over it with a fallback default, which would
re-introduce the hidden constant this task exists to remove.

**(d) Capture the before-ladder and check it against a value known in advance.** Capture to a scratch
directory OUTSIDE the working tree (`mktemp -d`) — these are measurements, not artifacts, and 01-05
did not commit its own:

```
node /Users/wyattroy/Documents/Projects/pastrypirates/scripts/bot_ladder4.js 20 7919 --json > "$SCRATCH/before.json"
shasum -a 256 "$SCRATCH/before.json"
```

**CONTROL (HARD-WON-LESSONS §3 — put a control in every harness whose value you already know):**
plan 01-05 recorded this exact command's output as sha256
`a2224555a51f455dcac2883de28e72051e31aa301d51f3a415ceb5f07e7b9cc1`. If the before-run does not match
that, **stop and report** — something moved between then and now, the neutrality comparison has lost
its anchor, and finding out what moved is more important than this refactor. Record the observed
sha256 in the record file either way.

The run takes minutes. Bound it, do not background it, and leave nothing running (CLAUDE.md §3).
  </action>
  <verify>
    <automated>test -f /Users/wyattroy/Documents/Projects/pastrypirates/.planning/quick/260818-vot-pass-payout-in-config/260818-vot-READERS.md &amp;&amp; grep -q "a2224555a51f455dcac2883de28e72051e31aa301d51f3a415ceb5f07e7b9cc1" /Users/wyattroy/Documents/Projects/pastrypirates/.planning/quick/260818-vot-pass-payout-in-config/260818-vot-READERS.md &amp;&amp; [ -z "$(git -C /Users/wyattroy/Documents/Projects/pastrypirates diff --name-only | grep -v '^\.planning/')" ]</automated>
  </verify>
  <done>
The record file exists and contains: the four raw grep outputs, the classification table with a
treatment decided for every reader, the `new Game(` verdict, and the observed before-run sha256
matching the recorded control. `git diff --name-only` shows nothing outside `.planning/` — no
production file was touched in this task.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: One config field, three derived sites — and prove it is invisible at the default</name>
  <files>4/src/engine/index.js, 4/src/ui/flow.js, 4/src/ui/util.js, 4/scripts/pass_narration_test.js</files>
  <read_first>
    - `/Users/wyattroy/Documents/Projects/pastrypirates/4/src/engine/index.js:928-955` (the `doPass` comment block and its two-line body) and `:3012-3054` (`roundCfg`)
    - `/Users/wyattroy/Documents/Projects/pastrypirates/4/src/ui/flow.js:1752-1761` (the ATTACK precedent) and `:1791-1806` (the Pass option and the "a turn must ALWAYS be endable" note above it)
    - `/Users/wyattroy/Documents/Projects/pastrypirates/4/src/ui/util.js:495-525` (the pass builder) and `:662-665` (the `dock:` builder, which is the existing precedent for a narration builder reading a coin amount off `appState.game.cfg`)
  </read_first>
  <behavior>
    - At `passCoin: 1` the narration renders byte-identically to today, on all 100 renderings — the existing gate's hand-typed tag constant proves it without being edited.
    - At `passCoin: 1` a real `doPass` still raises the acting purse by exactly 1, and the recorded snapshot still shows the post-payment purse.
    - At a non-default `passCoin` the purse delta, the button label and the narration tag all move together — no site keeps a stale amount.
    - At `passCoin: 0` the button's parenthetical disappears rather than rendering a zero amount, exactly as Attack's does when powder is free.
  </behavior>
  <action>
**(a) `roundCfg()` gains the field (QD-1).** Add `passCoin:1` on its own line immediately after the
`dockHeads:5,dockTails:2,crateBase:6,` line, so it sits with the other coin amounts and matches their
naming register (`powder`, `callBounty`, `dockHeads`, `dockTails`). Give it a short comment naming
RULE-01 as the rule it implements and D-07 as the reason it is a field rather than a number: the
wave 5 checkpoint may lower it, and this is the one place that edit lands.

**Comment discipline, and it is load-bearing here.** `4/scripts/pass_coin_test.js` counts raw
substrings in these very files, and `4/scripts/seat_arg_check.js`'s first run failed on the comment
documenting the bug it existed to catch (HARD-WON-LESSONS §1b). In any comment you write or edit in
these three files, refer to the field in prose ("the config payout field") — do not write the full
accessor chain, and do not write the approved tag string. `4/scripts/pass_narration_test.js:170`
asserts the tag appears in `util.js` exactly ONCE; a comment quoting it takes that to 2 and the gate
goes red for the wrong reason.

**(b) `doPass(p)` derives (QD-2).** Replace the literal increment with a read of the config field off
`this.cfg`. **The order of the two statements does not change and is not a style preference** — the
purse is raised BEFORE `this.ev(...)`, because `ev()` builds its state snapshot at call time. The
comment block above the method already explains this at length and stays true; do not rewrite it.

**(c) The Pass button states the amount (QD-3).** At `4/src/ui/flow.js:1806`, follow the ATTACK
option at `:1759` literally — same conditional shape, same wrapping, same chokepoint:

- The label becomes a template that keeps the leading 🌊 (Wyatt's own pick, recorded in the comment
  at `4/src/ui/util.js:502`) and appends ` <span class="nobrk">(+…🌕)</span>` **only when the payout
  is truthy**, exactly as Attack appends its cost only when powder costs something. A future D-07
  decision to zero the payout then removes the annotation instead of advertising a zero.
- The amount is read off `appState.game.cfg`, the same accessor Attack uses for powder.
- **The sign is ASCII `+`.** Attack's `−` is U+2212 MINUS SIGN and is NOT the model for a gain — every
  gain parenthetical in this game uses ASCII `+` (`4/src/ui/util.js:917`, `4/src/ui/flow.js:2280`).
- The coin is a raw 🌕 in the builder body, swapped for the image by `panel()`'s emojify call (D-50).
  Never hand-roll `<img>` markup or call `iconImg()` here.
- **No `short:` label.** `4/src/ui/stage.js:968` requires one only when the button's `textContent`
  exceeds 16 characters. Measured: the rendered label is 14 characters raw, and fewer once emojify
  swaps the coin for an image. Attack carries no `short:` for the same reason.
- Update the comment at `4/src/ui/util.js:502`, which quotes the button label, so it stays true. A
  justification rots independently of the behaviour it justifies (HARD-WON-LESSONS §5).

**Do NOT sweep this onto Dock or the sidebet Call (QD-5).** CLAUDE.md §2's consistency rule will
tempt you to, and the codebase convention it must be swept against is the opposite one: a button
states its amount when the amount is CERTAIN at the moment of the tap. Buy states its price, Attack
states its powder, and a pass pays a known amount — so those three annotate. Dock is a coin flip and
Call is conditional on being right, so both put their amounts in the prompt text instead and are
deliberately left alone. Say in the reply which surfaces you checked and why the two were excluded.

**(d) The narration tag derives (D-06, QD-4).** At `4/src/ui/util.js:521` the amount inside the tag
is read off `appState.game.cfg`, following the `dock:` builder at `:664`, which already reads
`dockHeads`/`dockTails` off the live game unguarded from inside this same table. Everything else
about the line is untouched: the `nobrk` span still wraps the WHOLE tag, the fragment is still
subjectless, the raw coin still resolves at the chokepoint, and all 100 hand-written sea-creature
strings stay untouched.

**The event shape does not change.** Do not add the amount to `{t:"pass"}` — no key added, removed or
renamed in what the engine emits. Phase 3 freezes this stream.

**(e) One fixture addition, and nothing else, to `4/scripts/pass_narration_test.js`.** The narration
builder now reads the live game, and that gate does not seat one. Add a real
`appState.game = new Game(roundCfg(STRATS), <fixed seed>, true)` and validate the fixture before
using it (HARD-WON-LESSONS §3 — a fixture that cannot exist in the game proves nothing): assert the
payout field is a finite number and that it is the shipped default. **Change no existing assertion.**
The 100 renderings must still be compared against the same hand-typed tag constant they are compared
against today — their passing UNCHANGED is the evidence that the de-hardcoding is invisible at the
default, and editing them would destroy that evidence. Show this gate's `git diff` in the summary.

**(f) Prove the neutrality.** Capture the after-ladder with the identical command and diff it:

```
node /Users/wyattroy/Documents/Projects/pastrypirates/scripts/bot_ladder4.js 20 7919 --json > "$SCRATCH/after.json"
shasum -a 256 "$SCRATCH/before.json" "$SCRATCH/after.json"
diff "$SCRATCH/before.json" "$SCRATCH/after.json"
```

Byte-identical is the required result. **A difference here is the finding and it stops the task** —
it means adding a cfg field or deriving the increment perturbed the engine, and wave 5's attribution
would be confounded. Do not explain a difference away with a second, friendlier number
(HARD-WON-LESSONS §2, "do not swap the recorded metric").

Identity between two runs is normally an alarm rather than a result, so it is red-proofed in Task 3
rather than believed here.
  </action>
  <verify>
    <automated>node --check /Users/wyattroy/Documents/Projects/pastrypirates/4/src/engine/index.js &amp;&amp; node --check /Users/wyattroy/Documents/Projects/pastrypirates/4/src/ui/flow.js &amp;&amp; node --check /Users/wyattroy/Documents/Projects/pastrypirates/4/src/ui/util.js &amp;&amp; node /Users/wyattroy/Documents/Projects/pastrypirates/4/scripts/pass_coin_test.js &amp;&amp; node /Users/wyattroy/Documents/Projects/pastrypirates/4/scripts/pass_narration_test.js</automated>
  </verify>
  <done>
Both existing gates exit 0 with every pre-existing assertion byte-unchanged — including the purse
delta of 1 and all 100 renderings of D-06's approved string. `4/src/engine/` is still
determinism-clean (that gate's own scan). The 20-game ladder record is byte-identical before and
after, with both sha256 values recorded. The Pass button reads `🌊 Pass (+1🌕)` at the shipped
default and drops the parenthetical when the payout is zero.
  </done>
</task>

<task type="auto">
  <name>Task 3: Keep both gates falsifiable when the payout MOVES — then prove it by sabotage</name>
  <files>4/scripts/pass_coin_test.js, 4/scripts/pass_narration_test.js</files>
  <read_first>
    - `/Users/wyattroy/Documents/Projects/pastrypirates/4/scripts/pass_coin_test.js` — read the whole header; it documents the ordering predicate, the CONTROLS convention and the QUOTED-vs-BARE trap this task must not break
    - `/Users/wyattroy/Documents/Projects/pastrypirates/4/scripts/pass_narration_test.js` — same, plus the fixture-validation convention
    - `/Users/wyattroy/Documents/Projects/pastrypirates/.planning/phases/01-before-the-engine-freezes/01-05-SUMMARY.md` — "The two failure demonstrations" is the house format for recording a red-proof
  </read_first>
  <action>
**This is the task the whole job exists for.** Both gates pass today and will keep passing after
Task 2 — that is correct and is the point. The danger is the OTHER direction: re-pointing them at
the config field so that they assert `delta === cfg.passCoin` while the engine computes
`coins += cfg.passCoin` makes them tautologies. They would be unable to fail and would still print
PASS. **Read the same constant twice and you have built a mirror, not a check.**

Three legs, and each one exists because the other two cannot catch what it catches. Say which leg
each new assertion belongs to, in the gate's own header, so a future session cannot collapse them.

**LEG A — the shipped default, pinned to a hand-typed literal.** Neither gate may lose its literal.
- `pass_coin_test.js`: add `check("the shipped default payout is one dubloon", roundCfg(STRATS).passCoin, 1)`
  and keep the existing hand-typed purse-delta assertion exactly as it is.
- `pass_narration_test.js`: keep the tag constant hand-typed and label it in a comment as D-06's
  approved wording, and add an assertion that the shipped default is 1 so the pin's precondition is
  visible in the output rather than implied.

*Catches:* the config default silently moving. **A tautological gate survives this and a pinned one
does not — this is the leg the central hazard is about.**

**LEG B — derivation, proved at a payout that is NOT the default.** A hardcoded site passes every
test run at 1 and fails the moment the number moves, which under D-07 is next week.
- `pass_coin_test.js`: build a second game from `{...roundCfg(STRATS), passCoin: 7}` and assert a real
  `doPass` moves the purse by exactly 7, with the recorded snapshot still showing the post-payment
  purse. Build a third at `passCoin: 0` and assert a delta of exactly 0 — there is no hidden floor.
  Use `=== 0` comparisons and `== null` tests throughout; seat 0 and a zero payout are both real
  values (HARD-WON-LESSONS §3, the falsy zero).
- `pass_narration_test.js`: re-render all 100 with the fixture game's payout set to 7 and assert every
  rendering ends with the tag carrying 7, wrapped whole in the no-break span. Restore the default and
  re-render before the file's own structural assertions run.

*Catches:* any site that kept a literal, or reads a stale copy.

**LEG C — agreement between an OBSERVED delta and a RENDERED string.** This is the anti-tautology
leg and it must not be built out of one constant read twice.
- In `pass_narration_test.js`: run a real `doPass` on the fixture game, capture the observed purse
  delta as a number, then render the narration for that same game and assert the rendered tag carries
  that observed delta. Do this at both payouts from Leg B. One side is behaviour the engine performed;
  the other is a string the renderer produced. Neither is a constant either side read off the other.
- The Pass button cannot be rendered here — its label is built inside `humanAct`, which needs a DOM,
  which is why half two of `pass_coin_test.js` reads `flow.js` as raw text. **Say so plainly in the
  gate's header rather than dressing a source read up as a rendering.** Assert instead, on the
  anchored pass-option region of `flow.js`:
    1. it contains the coin parenthetical built from the same `cfg` field the narration uses;
    2. the region matches no literal-digit gain parenthetical — a regex for a `+` immediately
       followed by a digit inside the parenthetical, which is what a re-hardcoded label looks like;
    3. **CONTROL:** the ATTACK option's own precedent shape is still present and still anchors. If
       the anchor convention rots, this control fails loudly instead of the region silently coming
       back empty — the existing `regionAfter()` helper already prints its anchor line and counts
       anchors found, and any new anchor goes through it.
- Same negative-regex assertion over the anchored `doPass` body in the engine and the anchored `pass:`
  builder body in `util.js`.

**QUOTED vs BARE, again.** Any new count-based assertion must count a string that prose in these
files cannot naturally contain — prefer the full accessor chain over the bare field name. If a
comment you write would inflate a count, change the comment, not the assertion; and print the count,
because a bare "OK" is not falsifiable.

**One more control, cheap:** after the existing full-voyage run in `pass_coin_test.js`, assert every
purse is `Number.isFinite`. A cfg missing the field would give every passing captain a NaN purse, and
NaN is exactly the class of failure that renders as a dash and gets reported as a UI bug three days
later.

**THE RED-PROOF. Four sabotages, each applied, run, recorded and reverted.** A check nobody has seen
fail is not yet a check (CLAUDE.md §4), and identity between two runs is normally an alarm
(HARD-WON-LESSONS §0). Record each one in the summary in 01-05's format — observed exit code and the
verbatim named failing assertions — then revert and re-run to green:

1. **Change the config default from 1 to 2.** Expect FAIL in BOTH gates, on the Leg A pins: the
   engine's hand-typed delta and the rendered tag against D-06's wording. **This is the sabotage a
   vacuous gate survives.** If either gate stays green here, the gate is a mirror — stop and fix it
   before going further. Revert.
2. **Re-hardcode the button** — put a bare amount back in the `flow.js` label. Expect FAIL on the
   Leg C literal-digit assertion for the button region. Revert.
3. **Point the narration at the wrong config field** — read the powder amount instead of the payout.
   Expect FAIL on Leg C's agreement check (the rendered tag no longer carries the observed delta) at
   both payouts. Revert.
4. **Swap the two statements in `doPass`** so the event records before the purse is raised. Expect
   FAIL on the existing ORDERING assertions, which read the recorded snapshot. This re-proves the
   hard predicate against the new derived code rather than assuming 01-04's proof carried over.
   Revert.

**Then restore, sweep and prove the tree is clean.** Sabotage 1 changed engine behaviour, so a
sabotage that was not fully reverted would look exactly like a successful refactor. Re-run the
20-game ladder a third time and confirm it is still byte-identical to `before.json` — 01-05 did the
same for the same reason. Then run every gate by name (there is still no combined runner for `4/`;
wiring one is Phase 3's TEST-04/05 and is out of scope):

```
node /Users/wyattroy/Documents/Projects/pastrypirates/4/scripts/stage_import_check.js
node /Users/wyattroy/Documents/Projects/pastrypirates/4/scripts/no_undef_check.js
node /Users/wyattroy/Documents/Projects/pastrypirates/4/scripts/pp4_timeroff_check.js
node /Users/wyattroy/Documents/Projects/pastrypirates/4/scripts/planner_singleton_check.js
node /Users/wyattroy/Documents/Projects/pastrypirates/4/scripts/pass_coin_test.js
node /Users/wyattroy/Documents/Projects/pastrypirates/4/scripts/pass_narration_test.js
npm test          # root, 21 gates — note in the summary that NOT ONE of them loads 4/
git -C /Users/wyattroy/Documents/Projects/pastrypirates diff --name-only
```

The last command must name only the six files this plan owns. Name the trees you did not touch and
prove it: root `src/`, `v2/`, `v2bakeoff/`, `3/`, plus `CNAME`, `robots.txt`, `sitemap.xml` and
`PP4_STAMP`. Nothing is pushed (out of scope for this task; plan 01-06 owns the stamp bump and the
push, which is why Wyatt will not see this on his phone and should not be told to look for it).

**One sentence the summary must carry for the next agent:** plan 01-06 line 218 tells wave 5 to
"change the amount at its single source in `doPass`" if Wyatt lowers the payout. After this task that
single source is the `roundCfg()` field, and `doPass` derives from it. Say so plainly — a pointer
that has moved and been left unrecorded is how this project loses days.
  </action>
  <verify>
    <automated>node /Users/wyattroy/Documents/Projects/pastrypirates/4/scripts/pass_coin_test.js &amp;&amp; node /Users/wyattroy/Documents/Projects/pastrypirates/4/scripts/pass_narration_test.js &amp;&amp; node /Users/wyattroy/Documents/Projects/pastrypirates/4/scripts/stage_import_check.js &amp;&amp; node /Users/wyattroy/Documents/Projects/pastrypirates/4/scripts/no_undef_check.js &amp;&amp; node /Users/wyattroy/Documents/Projects/pastrypirates/4/scripts/pp4_timeroff_check.js &amp;&amp; node /Users/wyattroy/Documents/Projects/pastrypirates/4/scripts/planner_singleton_check.js</automated>
    <human-check>Read the four rendered narration samples the narration gate prints at the shipped default and confirm they are the copy Wyatt approved. The gate prints rendered copy rather than describing it (D-06) — the donut-shrimp line is sample #04.</human-check>
  </verify>
  <done>
All four sabotages were applied, observed to FAIL with named assertions, and reverted — recorded in
the summary with exit codes. Sabotage 1 (the config default moved) failed in BOTH gates, proving
neither is a tautology. Every `4/` gate and root `npm test` exit 0 on the restored tree, the ladder
record is byte-identical for a third time, and `git diff --name-only` names only the six files this
plan owns.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| none new | No network call, no user input, no deserialization and no package install is added by this task. The only boundary in scope is the existing engine→UI one, and it does not change: the event shape is untouched. |
| host→guest (latent) | `4/src/orchestrator.js:1515` writes the whole `cfg` to the room, so `passCoin` rides to guests automatically and correctly. `4/` multiplayer has never executed (Phase 2 opens it); noted as fact, not as work. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-VOT-01 | Tampering | `4/scripts/pass_coin_test.js`, `4/scripts/pass_narration_test.js` | high | mitigate | The real risk in this task: a gate re-pointed at the config field becomes a tautology that cannot fail and still prints PASS. Mitigated by the three-leg design in Task 3 and by sabotage 1, which a vacuous gate survives and a pinned one does not. |
| T-VOT-02 | Tampering | supply chain — npm/pip/cargo | low | accept | No package is installed and no dependency file is touched. No Package Legitimacy Audit is required because there are no install tasks. |
| T-VOT-03 | Information disclosure | `CNAME`, `robots.txt`, `sitemap.xml` | critical | mitigate | Never copied, never moved, never synced. Proved by `git diff --name-only` naming only the six owned files. A second repo carrying `CNAME` takes the live game down for real players. |
| T-VOT-04 | Denial of service | the developer's own machine | medium | mitigate | No browser or local server is started by this plan. Any probe is bounded and killed before replying (CLAUDE.md §3). |
</threat_model>

<verification>
1. Both gates exit 0 on the restored tree with their Leg A literals intact.
2. All four sabotages observed FAILING, with exit codes and named assertions recorded.
3. The 20-game ladder record byte-identical across three captures, anchored to 01-05's recorded
   sha256 `a2224555…`.
4. `npm test` (root, 21 gates) exit 0 — reported alongside the standing note that not one of those
   gates loads `4/`.
5. `git diff --name-only` names only the six files in `files_modified`.
</verification>

<success_criteria>
- The pass payout is written once, on `roundCfg()`, and derived at all three sites.
- The rendered narration at the shipped default is byte-identical to D-06's approved wording, proved
  by 100 unchanged assertions passing.
- The Pass button states the amount, Attack-shaped, and drops the parenthetical at a zero payout.
- Both gates fail when the config default moves. Demonstrated, not asserted.
- The engine did not move: three byte-identical ladder records.
- Wave 5 plan 06 can still attribute its delta to the pass dubloon, and knows where the single edit
  point now lives.
</success_criteria>

<output>
Create the quick-task SUMMARY in
`.planning/quick/260818-vot-pass-payout-in-config/` when done. It must carry: the reader
classification table, the three ladder sha256 values, the four failure demonstrations in 01-05's
format, the `git diff` of `4/scripts/pass_narration_test.js`'s fixture addition, the list of trees
proved untouched, and the one sentence telling plan 01-06 where the payout's single source moved.
</output>
