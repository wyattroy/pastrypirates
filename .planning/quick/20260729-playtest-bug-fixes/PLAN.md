---
task: playtest-bug-fixes
type: quick
created: 2026-07-29
baseline_commit: a278781
starts_after: "quick/20260729-narration-audit-tool-hardening — its Tasks 1-9 MUST be committed first (Task 1 below verifies this and HALTS if not)"
engine_baseline: ab98e04
files_modified:
  - src/ui/flow.js
  - src/ui/util.js
  - src/ui/panel.js
  - src/ui/lobby.js
  - src/shared/index.js
  - index.html
  - scripts/ui_contract_check.js
  - scripts/narration_test.js
  - scripts/narration_flow_test.js
  - scripts/engine_contract_check.js
  - art-review/narration-inventory.json
  - art-review/narration-audit.html
  - art-review/narration-table-baseline.json
autonomous: true
requirements: [NARR-01, NARR-06, UI-06]
findings: [F1, F2, F5, F9, F10, F12]
findings_out_of_scope: [F7, F11]
decisions: [D-16, D-25, D-26, D-29, D-38, D-40, D-41, D-46, D-48, D-50, D-53, D-57, D-58]

must_haves:
  truths:
    - "A captain can never pay more coins than they hold: the bot's counter-demand is capped against the coins NOT already pledged, and across a full grid of purse/offer/shortfall combinations `offerCoins + askFor` never exceeds the purse (F12)"
    - "Every place the game POINTS AT a row to say 'this one is the reader' reads plain `you`; every place the game SPEAKS still reads ye/yer — and the register gate now knows the difference by name, with the reason attached so a later pass cannot undo it (F1)"
    - "A lobby seat prints its captain's name exactly once, and a seated player who typed no name still shows a name (UI-06)"
    - "An ingredient icon sits immediately before the noun it names — island name or ingredient name — including inside the dock flavour phrases, where the insertion point is DECLARED IN DATA and never guessed from the string (F5)"
    - "No addressed dock line contains a pronoun with no antecedent: `bought`, `coins` and `empty` each name their place and their goods, per D-46's letter (F10)"
    - "Docking on tails with under 3 coins shows the buy option greyed with Wyatt's own reason instead of silently resolving to the coins (F9, D-41)"
    - "The narration box is never empty: a line persists until another line replaces it, and the hold that paces CONSECUTIVE lines is untouched (F6)"
    - "GOVERNING: `src/engine/index.js` has an empty diff against ab98e04; 31/31 determinism fixtures verify; `npm test` is green at every commit boundary"
  artifacts:
    - .planning/quick/20260729-playtest-bug-fixes/COIN-AUDIT.md
    - .planning/quick/20260729-playtest-bug-fixes/MORNING-PLAYTEST-BRIEF.md
  key_links:
    - "`DOCK_FLAVOR`'s declared `{prefix,name}` split -> `dockFlavorIcon()` -> every dock string in flow.js and util.js: ONE place decides where the icon goes, so the branches cannot drift apart again"
    - "the F1 label exception in `ui_contract_check.js` -> its three content anchors: a named, presence-verified exception, so a stale entry fails loudly instead of rotting into cover"
    - "`counterHeadroom()` -> `humanTrade`'s counter -> the property grid in `narration_flow_test.js`: the arithmetic that corrupted state becomes a pure function whose test cannot be satisfied by inspection"
    - "a changed shipped line -> the copy gate's divergence list -> the morning brief: a post-approval wording change is SURFACED to Wyatt, never absorbed silently"
---

<objective>
Fix the six playtest findings that are mine to fix, so Wyatt has a working build to play when he wakes
up. He is asleep and cannot be asked anything, so every decision that is genuinely his is either
(a) already settled by a recorded decision or requirement, or (b) drafted in his voice, marked, and
listed for his morning review. No bug is left unfixed because a question exists.

In scope: **F12** (coins go negative — the only finding that corrupts state), **F1/F2** (the `ye`/`you`
label class + the doubled lobby name, which is requirement UI-06), **F5** (an ingredient icon goes
directly before the noun it names), **F10** (the addressed dock lines' dangling "it"), **F9** (the
unaffordable buy option vanishes instead of greying).

Out of scope, owned by the parallel `narration-audit-tool-hardening` executor: **F7** (its Task 9) and
**F11** (its Task 8). Do not touch `src/ui/util.js`'s `ask()` broadcast line or `humanAct`'s `sub`
chain — they belong to that plan and are already fixed by the time this one starts.

Output: 8 commits and two plain-language artifacts, the last of which is a morning playtest brief
written for a non-coder: what changed, what to look at in what order, and every item awaiting his word.
</objective>

<sequencing>
## This plan starts AFTER another executor finishes, and Task 1 proves it

A `gsd-executor` is running `.planning/quick/20260729-narration-audit-tool-hardening/PLAN.md` right now.
At the time this plan was written, its Tasks 1 and 2 were committed (`04c41ad`, `b1566f7`) and its
Tasks 3-11 were still ahead. Everything below is written against the tree as that plan will leave it:

| Artifact that plan creates | This plan depends on it for |
|---|---|
| `art-review/narration-core.js` | nothing directly — but the copy gate imports its projections, so a copy change is judged through it |
| `art-review/narration-table-baseline.json` | **Tasks 6 and 7 change table-card text and must RE-PIN this fixture** |
| `art-review/narration-approved-baseline.json` | the 104 drift rows; a deliberate wording change re-pins here, not in Wyatt's disposition file |
| `scripts/narration_copy_check.js` (gate 17) | flags every line this plan changes that Wyatt had already approved — by design |
| `scripts/narration_audit_check.js` (gate 16) | every NEW copy site this plan adds must be marked, extracted and placed on a card, or this gate fails |
| `ui_contract_check.js` assertion 6 (co-reachability) | **Task 8's F9 fix is REQUIRED by it**: a new `disabled:` option must carry a reachable reason |
| `ui_contract_check.js` assertion 7 (delivery) | untouched here; Task 1 asserts it is green so a later failure is attributable |
| `// @copy <id>` markers | any new copy site added here needs one, per that plan's id rules |

**Acceptable state to start:** that plan's Tasks 1-9 committed. Tasks 10 (a runbook) and 11 (Wyatt's
own sitting) may be outstanding — neither touches anything this plan reads or writes.

**Unacceptable:** any of its Tasks 3-9 missing, `npm test` red, or a dirty working tree. Task 1 halts.
</sequencing>

<governing_constraints>
These hold for EVERY task. A task that violates one is wrong even if its own check passes.

1. **`src/engine/index.js` keeps an EMPTY diff** against `ab98e04`. 31 determinism fixtures depend on
   it. Every fix here is presentation-tier. Assert per task:
   `git diff --stat ab98e04..HEAD -- src/engine/index.js` prints nothing.
2. **F12 touches game economy but not the engine.** The bug lives in `humanTrade` (`src/ui/flow.js`), a
   path `Game.play()`'s headless corpus never executes — the same reasoning D-19 used to establish that
   zero `parley` events appear in any of the 31 fixtures. The engine has its own separate trade
   settlement (`src/engine/index.js:454`) which this plan does not touch. State this in the code
   comment, and prove it with the determinism verify.
3. **`npm test` green at every commit boundary**, exit 0, at whatever gate count the hardening plan
   left (expected 17). It never goes red in between.
4. **`node scripts/determinism_baseline.js --verify` stays 31/31.**
5. **No build step, no CDN, no new dependency.** `package.json`'s `dependencies`/`devDependencies` keys
   stay byte-identical; no `package-lock.json` appears. `src/ui/` never imports `src/net/`.
6. **Vanilla JS at the surrounding density.** Annotate every change inline in the established form.
   For decisions cite `// D-NN (Wyatt-approved 2026-07-29): ...`; for the items he approved verbally
   during today's playtest cite the finding id and the date: `// F5 (Wyatt-approved 2026-07-29): ...`.
7. **D-16 is absolute.** An icon is never dropped. F5 MOVES icons; it removes none. Every assertion
   below that compares text before/after strips the icon markup and compares what remains, so a
   silently-dropped icon fails rather than passing as "text unchanged".
8. **Never edit `15-DISPOSITIONS-FINAL.json` or any of Wyatt's disposition/approval files.** They are
   the record of what he said. A shipped line that legitimately changes after his review is reconciled
   by the procedure below and surfaced in the brief — never by rewriting what he said.
9. **Wyatt is a non-coder.** The morning brief is plain language, no commands, no gate output. Gate
   output is read by Claude.
</governing_constraints>

<gate_reconciliation>
## When a gate goes red because a fix is CORRECT — the procedure, in order

Tasks 4, 6, 7 and 8 change strings that Wyatt already reviewed. The copy gate (`narration_copy_check.js`)
and the health gate (`narration_audit_check.js`) exist to notice exactly that. **A red gate here is the
system working.** Apply the first option that applies, and never any option below one that applies:

1. **Gate stays green.** Nothing to do. Record the observation in the commit message so the next reader
   knows it was checked rather than skipped.

2. **A DRIFT row fails** (`art-review/narration-approved-baseline.json`, or the table fixture
   `art-review/narration-table-baseline.json`) — Wyatt stored no copy for it; the baseline is a pin on
   "nobody changed this silently". A deliberate change re-pins it. **Re-pin in the SAME commit as the
   wording change**, using whatever regeneration mode the hardening plan's Task 3/4 shipped
   (`node scripts/narration_audit_check.js --print --table-only` and the migration's baseline writer —
   read the script's own header/`--help` for the exact flag; do NOT hand-edit the JSON), and put the
   reason in the commit body: the finding id, the date, and one sentence.

3. **An APPROVAL row fails** — the shipped text no longer matches words Wyatt typed. Do NOT edit his
   text and do NOT revert the fix. Add ONE `KNOWN_DIVERGENT` entry per row, each carrying:
   - the row id,
   - the reason, naming the finding, the date, and what supersedes what, e.g.
     `F5 icon placement (Wyatt-approved 2026-07-29, 15-PLAYTEST-NOTES.md) — supersedes the icon POSITION in this approval; his words are unchanged`,
   - and nothing else. If Task 6 of the hardening plan set a numeric cap on that list, raise the cap by
     exactly the number of entries added, with the same reason inline. Never widen a pattern, never
     delete an assertion, never soften a message.

4. **A NEW copy site is unplaced or unmarked** (health gate assertions "every live site is placed
   exactly once" / "no live copy site without a marker"): give the site a `// @copy <id>` marker
   following that plan's id rules (character set `[a-z0-9.-]+`, no parens, no pre-conversion pronoun
   token, named for the MOMENT AND ROLE never the wording), regenerate the inventory, and place the
   card in the same flow-chart node as its nearest sibling.

5. **A pinned COUNT moved** (`SINK_EXPECTED`, `LAYOUT_WIDE_EXPECTED`): update the literal deliberately
   with a one-line reason beside it. That is what those tables are for.

**Every entry added under option 3 goes on the morning brief's list**, in plain language: "three lines
changed after you reviewed them — the review tool will show them to you again next time."
</gate_reconciliation>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|---|---|
| a player-typed name -> the lobby seat row's HTML | Task 4 removes an `escHtml()` call while de-duplicating a name |
| human input -> coin arithmetic in `humanTrade` | Task 2 changes what a player can be made to pay |
| repo source -> the audit tool's `new Function()` render | unchanged by this plan; only the strings it renders change |
| package manager | **no installs anywhere in this plan** |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-PB-01 | Tampering | `humanTrade`'s counter-offer arithmetic (`src/ui/flow.js`) | high | mitigate | The fix is a pure exported function with a property test over a full purse/offer/shortfall grid asserting `offerCoins+askFor <= coins` and `askFor >= 0`; the call site is pinned by a source-text assertion so a future inline rewrite cannot reintroduce it. Determinism verify proves the engine's own settlement is untouched. |
| T-PB-02 | Elevation of Privilege | the lobby seat row's name interpolation (`src/ui/lobby.js`) | high | mitigate | The de-duplication must KEEP an escaped rendering: `pn(i)` -> `pname(i)` -> `escHtml(s.name)`. Task 4 asserts that a name containing HTML metacharacters comes back escaped from `pname()`, and that no raw `s.name` reaches the template. |
| T-PB-03 | Tampering | `DOCK_FLAVOR` restructured from strings to objects in `src/shared/index.js` | medium | mitigate | `dockFlavor()` keeps its exact signature and return value: Task 5 asserts all 7 joined strings are byte-identical to a hardcoded copy of today's literals, and that `dockFlavorIcon()` differs from `dockFlavor()` only by the inserted icon. Consumers change in a later, separate commit. |
| T-PB-04 | Repudiation | a post-approval wording change silently absorbed | medium | mitigate | `<gate_reconciliation>` forbids editing Wyatt's disposition files; every divergence gets a named, reasoned allowlist entry AND a plain-language line in the morning brief. |
| T-PB-05 | Denial of Service (of play) | F6 changes the narration display path on every screen | low | mitigate | The hold is explicitly preserved and pinned by assertion; only the fade trigger changes; chat bubbles (D-15) are asserted untouched; the task lands last so it is the cleanest thing to revert. |
| T-PB-SC | Tampering | npm/pip/cargo installs | high | accept | **No package-manager install occurs in this plan.** The Package Legitimacy Gate is not applicable and no legitimacy checkpoint is required. Asserted mechanically per task: `dependencies`/`devDependencies` byte-identical, no `package-lock.json`. |
</threat_model>

<ordering_rationale>
Cheapest-and-most-certain first, so a problem is easy to isolate, and the two changes that touch the
most screens land at the tip of the branch.

1. **Task 1 — preflight.** Reads only. Proves the tree is the tree this plan was written against.
2. **Task 2 — F12.** One expression, one pure helper, one property test. The most serious finding and
   the most self-contained. Nothing else in the plan depends on it, so it goes first.
3. **Task 3 — the coin audit.** A report, no code. Answers the "does anything else go negative?"
   question the finding raised, without acting on the answer.
4. **Task 4 — F1/F2/UI-06.** Three string changes plus a named gate exception. Small, and settled by an
   existing requirement, so it needs no judgment call.
5. **Task 5 — F5's data layer.** Restructure `DOCK_FLAVOR`, change no rendered text. Isolated on
   purpose: if a pinned export list or a fixture moves, it moves here, with nothing else in the diff.
6. **Task 6 — F5 in `flow.js`.** Two prompt/button strings. No table card involved, so its gate
   fallout is disjoint from Task 7's.
7. **Task 7 — F5 + F10 in `util.js`.** The four dock narration branches. Table cards, so this is where
   the table fixture is re-pinned.
8. **Task 8 — F9.** Adds the only new string in the plan, so it is also the only task that has to
   register a new copy site. Depends on Task 5's helper and Task 6's import.
9. **Task 9 — F6.** Last, not because it is risky — Wyatt corrected that framing, and the hold is
   explicitly preserved — but because it is the only change that touches every screen, so it is the
   cleanest thing to have at the tip if anything looks off.
10. **Task 10 — the morning brief.** Assembled from what actually landed.
</ordering_rationale>

<tasks>

<!-- planner-discipline-allow: fadeOut -->
<!-- planner-discipline-allow: sleep(500) -->
<!-- planner-discipline-allow: Math.min(shortfall,p.coins) -->
<!-- planner-discipline-allow: — ye -->
<!-- planner-discipline-allow: that's ye! -->
<!-- planner-discipline-allow: (ye) -->
<!-- planner-discipline-allow: ${ingIcon} ${flavor} -->
<!-- planner-discipline-allow: buy it anyway -->

<task type="tracer" id="1">
  <name>Task 1: preflight — prove this is the tree the plan was written against, or HALT</name>
  <files>(reads only — no file is modified, no commit)</files>
  <precondition>The `narration-audit-tool-hardening` executor has finished at least through its Task 9 (`fix(f7): broadcast neutral content plus per-seat variants, and gate viewer-branching broadcasts`).</precondition>
  <action>
Read the tree and report. **Change nothing. Commit nothing.** This task exists because the plan was
written while another agent was still working, and every later task assumes that agent's output.

Establish and print, as one block:

1. `git rev-parse --short HEAD` and `git log --oneline ab98e04..HEAD` — the actual commits on the
   branch. Task 10 uses this list to write the brief, so print it in full.
2. Whether the hardening plan's Tasks 3-9 are all present, identified by their commit subjects
   (`refactor(audit): extract a DOM-free render core…`, `fix(audit): re-key the page…`,
   `test(audit): gate shipped narration copy…`, `feat(audit): apply approved narration copy…`,
   `test(audit): census every player-facing sink…`, `fix(f11): the greyed Trade reason…`,
   `fix(f7): broadcast neutral content…`). Tasks 10 and 11 may be absent — say which are.
3. The gate count in `package.json`'s `test` script, and whether `npm test` exits 0.
4. That F11 and F7 are genuinely fixed, so this plan does not need to touch them: `humanAct`'s helper
   text no longer puts the cargo reason in an `else` arm, and no broadcast's content argument
   references the local seat.
5. That the artifacts later tasks depend on exist: `art-review/narration-core.js`,
   `art-review/narration-table-baseline.json`, `art-review/narration-approved-baseline.json`,
   `scripts/narration_copy_check.js`.
6. Whether the working tree is clean.
7. The current values later tasks will need to preserve or update: the exact 7 `DOCK_FLAVOR` literals,
   `MSG_HOLD_MULTIPLIER`, and the three `ui_contract_check.js` exclusion list names.

**If anything in 2-6 differs from the expected state, STOP.** Do not begin Task 2. Report exactly what
differs, what you found instead, and which later tasks are affected — the sequencing table in this plan
maps each artifact to the tasks that need it. A missing Task 10 or 11 is NOT a reason to stop.
  </action>
  <verify>
    <automated>
set -e
echo "== HEAD and branch commits =="
git rev-parse --short HEAD
git log --oneline ab98e04..HEAD | tee /tmp/pb-commits.txt

echo "== hardening Tasks 3-9 present =="
for pat in "extract a DOM-free render core" "re-key the page" "gate shipped narration copy" \
           "apply approved narration copy" "census every player-facing sink" \
           "greyed Trade reason" "broadcast neutral content"; do
  grep -qF "$pat" /tmp/pb-commits.txt || { echo "MISSING hardening commit: $pat — HALT"; exit 1; }
done

echo "== gates and npm test =="
node -e 'const s=require("./package.json").scripts.test;const n=s.split("&&").length;console.log("gate count:",n);if(n<17)throw new Error("expected >=17 gates, got "+n);'
npm test

echo "== F11 fixed (not this plan's job) =="
node -e '
const s=require("fs").readFileSync("src/ui/flow.js","utf8");
const i=s.indexOf("let sub=null");if(i<0)throw new Error("humanAct helper-text block not found");
const region=s.slice(i,i+900);
if(/else\s+if\s*\([^)]*tradeOpp/.test(region))throw new Error("F11 is NOT fixed — the cargo reason is still in an else-if arm. HALT: that is the other plan Task 8.");
console.log("PASS F11 fixed upstream");'

echo "== F7 fixed (not this plan's job) =="
node scripts/ui_contract_check.js 2>&1 | tee /tmp/pb-uic.txt
grep -qi 'delivery' /tmp/pb-uic.txt || { echo "assertion 7 (delivery) absent — F7 not landed. HALT"; exit 1; }
grep -qi 'co-reachab' /tmp/pb-uic.txt || { echo "assertion 6 (co-reachability) absent — F11 gate not landed. HALT"; exit 1; }
grep -E '^FAIL' /tmp/pb-uic.txt && { echo "ui_contract_check has failures — HALT"; exit 1; } || true

echo "== dependent artifacts exist =="
for f in art-review/narration-core.js art-review/narration-table-baseline.json \
         art-review/narration-approved-baseline.json scripts/narration_copy_check.js; do
  test -f "$f" || { echo "MISSING $f — HALT"; exit 1; }
done
node scripts/narration_audit_check.js
node scripts/narration_copy_check.js

echo "== clean tree, empty engine diff =="
test -z "$(git status --porcelain)" || { echo "working tree dirty — HALT"; git status --porcelain; exit 1; }
git diff --stat ab98e04..HEAD -- src/engine/index.js
test -z "$(git diff --stat ab98e04..HEAD -- src/engine/index.js)" || { echo "engine diff NOT empty — HALT"; exit 1; }

echo "== values later tasks preserve =="
node --input-type=module -e '
const m=await import("./src/shared/index.js");
const ING=["sugar","vanilla","spice","wheat","dairy","eggs","cocoa"];
console.log(JSON.stringify(Object.fromEntries(ING.map(i=>[i,m.dockFlavor(i)])),null,1));'
grep -n 'MSG_HOLD_MULTIPLIER=' src/ui/util.js
grep -n 'REGISTER_SKIP_FILES\|REGISTER_LINE_ANCHORS\|REGISTER_IDENT_FRAGMENTS' scripts/ui_contract_check.js
echo "PREFLIGHT PASS"
    </automated>
  </verify>
  <done>
The branch carries the hardening plan's Tasks 3-9; `npm test` is green at 17+ gates; F11 and F7 are
fixed upstream and their two gate assertions run clean; all four dependent artifacts exist; the tree is
clean; the engine diff is empty. The 7 dock-flavour literals, `MSG_HOLD_MULTIPLIER` and the three
exclusion-list names are printed for later tasks. Nothing was modified and nothing was committed.
  </done>
</task>

<task type="auto" id="2" tdd="true">
  <name>Task 2: F12 — a bot's counter can no longer take coins the captain does not have</name>
  <files>src/ui/flow.js, scripts/narration_flow_test.js</files>
  <behavior>
    - The playtest case: shortfall 1, purse 1, already-pledged 1 -> the headroom is 0, so the existing `askFor>0` guard suppresses the counter entirely and the flow falls through to the refusal.
    - Purse 3, pledged 1, shortfall 5 -> 2 (name the smaller amount they CAN afford — the comment's stated intent, now computed correctly).
    - Purse 1, pledged 0, shortfall 1 -> 1 (an unpledged purse is unaffected; this is the case that always worked).
    - PROPERTY, over every combination of shortfall 0..8, purse 0..8, pledged 0..purse: `pledged + headroom <= purse` and `headroom >= 0`. This is the invariant the bug violated, and it cannot be satisfied by inspection.
    - The call site uses the helper: a source-text assertion fails if the expression is ever inlined again.
  </behavior>
  <action>
`src/ui/flow.js:554` caps the bot's counter-demand against the captain's TOTAL purse, but `:563-564`
debits `give.coins+askFor`. The coins already pledged in the offer are counted twice — once as part of
the offer, once as headroom for the counter. With 1 coin pledged and 1 coin held, `askFor` computes 1,
`totalCoins` becomes 2, and the captain is debited 2 against a balance of 1. Wyatt went to −1; the
`tradeBonus` `p.coins++` two lines later masked it back to 0, which is why it survived until now.

**The fix, as a pure exported helper rather than an inline expression.** Add to `src/ui/flow.js`,
beside the other pure exported builders the harness already imports (`brokeSailLine`,
`brokeAnchorLine`, `stormIntroClause`):

- `counterHeadroom(shortfall, coins, offerCoins)` returning `Math.max(0, Math.min(shortfall, coins - offerCoins))`.

Then `:554` becomes a call to it, passing `shortfall`, `p.coins`, `give.coins`.

Two reasons it is a helper and not a one-line edit: the arithmetic is the whole defect, and a pure
function is the only shape this repo can regression-test without a DOM (`humanTrade` needs one);
and the `Math.max(0, …)` floor makes an over-pledged purse impossible to express as a negative demand
even if a future caller passes something unexpected.

**Comment it in the established form**, citing F12, the date, and three facts: that the coins in the
offer are debited too (name the line that does it), that the existing `askFor>0` guard is what turns
zero headroom into "no counter offered" — the D-41 pattern behaving correctly, one fewer dead-end
rather than a new one — and that this is UI-tier: `humanTrade` is a path `Game.play()`'s headless
corpus never executes, which is why the 31 determinism fixtures contain zero `parley` events (D-19's
own reasoning), and the engine's separate trade settlement is untouched.

**Tests in `scripts/narration_flow_test.js`**, following that file's existing conventions exactly (a
local `check(name, actual, expected)` counter, plain `console.log`, `process.exit(failures?1:0)`, pure
exported builders imported directly and source-text assertions for anything needing a DOM):

- the four numeric cases in `<behavior>`, each with the playtest's own numbers where it has them;
- the property grid, reported as ONE check with the first violating triple named if it fails;
- a source-text assertion that `humanTrade`'s counter block calls the helper, so the expression cannot
  be inlined back. Locate the block by the `scoffs — but counters` prompt rather than by line number.

Do not change the prompt wording, the button labels, the event payload, or the refusal line.
  </action>
  <verify>
    <automated>
set -e
# 1. the helper exists, is pure, and gets the playtest case right
node --input-type=module -e '
const m = await import("./src/ui/flow.js");
if (typeof m.counterHeadroom !== "function") throw new Error("counterHeadroom must be exported");
const eq=(a,b,w)=>{if(a!==b)throw new Error(w+": got "+a+" want "+b);};
eq(m.counterHeadroom(1,1,1),0,"the live playtest case (shortfall 1, purse 1, pledged 1)");
eq(m.counterHeadroom(5,3,1),2,"names the smaller affordable amount");
eq(m.counterHeadroom(1,1,0),1,"unpledged purse unaffected");
eq(m.counterHeadroom(4,2,3),0,"over-pledged purse floors at 0, never negative");
let bad=null;
for(let s=0;s<=8;s++)for(let c=0;c<=8;c++)for(let o=0;o<=c;o++){
  const a=m.counterHeadroom(s,c,o);
  if(a<0||o+a>c){bad=`shortfall=${s} purse=${c} pledged=${o} -> ${a}`;break;}
}
if(bad)throw new Error("INVARIANT VIOLATED: "+bad);
console.log("PASS counterHeadroom: 4 cases + 405-point invariant grid");'

# 2. the call site uses it — the old total-purse cap is gone from non-comment source
node -e '
const s=require("fs").readFileSync("src/ui/flow.js","utf8");
const code=s.split("\n").filter(l=>!/^\s*\/\//.test(l)).join("\n");
const i=code.indexOf("scoffs — but counters");
if(i<0)throw new Error("counter prompt not found — re-locate before asserting");
const region=code.slice(Math.max(0,i-800),i+200);
if(!/counterHeadroom\s*\(/.test(region))throw new Error("the counter block does not call counterHeadroom");
if(/Math\.min\(shortfall\s*,\s*p\.coins\s*\)/.test(code))throw new Error("the total-purse cap is still present in live code");
console.log("PASS call site uses the helper; the old cap is gone");'

# 3. the harness covers it and stays green
node scripts/narration_flow_test.js 2>&1 | tee /tmp/pb-t2.txt
grep -qi 'counterHeadroom\|headroom' /tmp/pb-t2.txt || { echo "the harness must name the new assertions"; exit 1; }
grep -E '^\s*FAIL' /tmp/pb-t2.txt && { echo "harness failures"; exit 1; } || true

# 4. governing constraints
npm test
node scripts/determinism_baseline.js --verify
test -z "$(git diff --stat ab98e04..HEAD -- src/engine/index.js)"
test ! -f package-lock.json
    </automated>
  </verify>
  <done>
`counterHeadroom()` is exported from `src/ui/flow.js`, computes the headroom against coins NOT already
pledged, floors at zero, and is used by `humanTrade`'s counter block; the old total-purse cap appears
nowhere in live code. `narration_flow_test.js` pins the live playtest case (no counter is offered at
purse 1 with 1 pledged), three further numeric cases, a 405-point invariant grid proving
`pledged + headroom <= purse` always, and a source-text assertion against re-inlining. `npm test` green,
31/31 determinism, engine diff empty.
  </done>
  <commit>fix(f12): cap a bot's counter-demand against unpledged coins, so a captain can't be paid into the negative</commit>
</task>

<task type="auto" id="3">
  <name>Task 3: the coin-floor audit — every other path that debits coins, reported not assumed</name>
  <files>.planning/quick/20260729-playtest-bug-fixes/COIN-AUDIT.md</files>
  <action>
F12 asked a second question that must be answered and must NOT be acted on unilaterally: can any other
path drive a captain's coins below zero, and does a central non-negative invariant belong somewhere?
**Report. Do not implement a guard.**

Audit every coin debit outside the engine, plus the engine's own for comparison. The sites, measured
while planning — confirm each still exists rather than trusting these line numbers:

| Site | Shape |
|---|---|
| `src/ui/flow.js` `humanTrade` counter | fixed in Task 2 — record it as the found instance |
| `src/ui/flow.js` `humanTrade` accepted offer (`p.coins-=give.coins`) | pledge chosen from a `p.coins>=n` filtered list |
| `src/ui/flow.js` dock buy (`p.coins-=3`) | gated on `p.coins>=3` (Task 8 turns that gate into a greyed button) |
| `src/ui/flow.js` storm dodge (`p.coins--`) | compare with the engine's own copy, which requires `p.coins>=3` to pay 1 — explain the asymmetry or flag it |
| `src/ui/flow.js` aground half-loss | `Math.max(1, floor(coins/2))` inside a `p.coins>0` branch |
| `src/ui/flow.js` sail steps (`p.coins--`, two sites) | reachability gated on affordability upstream |
| `src/ui/flow.js` bot hail settlement (`p.coins-=finalPrice`) | the debited party is the BOT; check how `raises` is bounded |
| `src/orchestrator.js` spoils/powder/flee debits | several use `Math.min`; check each |
| `src/ui/util.js` `applyShotClockPenalty` | `Math.min(1, p.coins)` — safe in isolation |

For each: the guard that protects it, a verdict (SAFE / AT RISK / NEEDS A SECOND PAIR OF EYES), and for
anything not SAFE, the shortest sequence that would reproduce it.

**One hypothesis to confirm or refute explicitly, because it is the same family as F12 and cannot be
seen by reading a single line:** the shot-clock penalty takes a coin *while a decision is pending*.
Every `ask()` is awaited, so a captain can choose a coin offer, have `applyShotClockPenalty` fire at
the 20-second mark, and only then reach the settlement that debits what they pledged. Read the await
points and say whether the pledge is re-validated after the penalty. If it is not, that is a second
real instance and it belongs in the report as AT RISK — not fixed here.

Then a **recommendation section** with exactly three options and one recommendation:
(a) do nothing, (b) a development-time assertion at each debit site, (c) a headless invariant asserting
no player's coins go negative across the 31 determinism fixtures. Weigh each in one sentence, recommend
one, and state plainly that the choice is Wyatt's. Task 10 carries the recommendation into the brief in
plain language.

Plain enough for Wyatt to follow the verdict column; the mechanism prose can be technical.
**No source file changes in this commit.**
  </action>
  <verify>
    <automated>
set -e
test -f .planning/quick/20260729-playtest-bug-fixes/COIN-AUDIT.md
node -e '
const t=require("fs").readFileSync(".planning/quick/20260729-playtest-bug-fixes/COIN-AUDIT.md","utf8");
const files=["src/ui/flow.js","src/orchestrator.js","src/ui/util.js","src/engine/index.js"];
for(const f of files) if(!t.includes(f)) throw new Error("audit must cover "+f);
const verdicts=(t.match(/SAFE|AT RISK|NEEDS A SECOND PAIR OF EYES/g)||[]).length;
if(verdicts<9)throw new Error("expected a verdict per site (>=9), found "+verdicts);
if(!/shot.?clock/i.test(t))throw new Error("the shot-clock interleaving hypothesis must be confirmed or refuted by name");
if(!/recommend/i.test(t))throw new Error("a recommendation section is required");
for(const opt of ["(a)","(b)","(c)"]) if(!t.includes(opt)) throw new Error("all three options must be weighed: missing "+opt);
if(!/Wyatt/.test(t))throw new Error("the report must state that the choice is Wyatt's");
console.log("PASS coin audit: "+verdicts+" verdicts, hypothesis addressed, recommendation present");'

# report only — the only pending change at this point must be the report itself
{ git diff --name-only; git diff --cached --name-only; git ls-files --others --exclude-standard; } \
  | sort -u | grep -vE '^\.planning/' | tee /tmp/pb-t3.txt || true
test ! -s /tmp/pb-t3.txt || { echo "this task must contain no source change"; cat /tmp/pb-t3.txt; exit 1; }
npm test
    </automated>
  </verify>
  <done>
`COIN-AUDIT.md` covers every non-engine coin debit plus the engine's own, gives each a guard and a
verdict, reproduces anything not SAFE, confirms-or-refutes the shot-clock interleaving hypothesis by
name, and closes with three weighed options, one recommendation, and the statement that the ruling is
Wyatt's. No source file changed. `npm test` green.
  </done>
  <commit>docs(f12): audit every coin-debit path for a negative floor, and recommend without deciding</commit>
</task>

<task type="auto" id="4">
  <name>Task 4: F1/F2/UI-06 — an identifying LABEL says "you"; a lobby seat says its name once</name>
  <files>src/ui/lobby.js, src/ui/util.js, index.html, scripts/ui_contract_check.js</files>
  <behavior>
    - The lobby seat row reads `Wyatt — you` for the reader, the plain name for another human, and `Davy Scones — 🤖 bot` for an empty seat: one name, never two.
    - A seated player who typed no name still shows a name (their captain default), per UI-06's own wording.
    - `pname()` still HTML-escapes a typed name: a name containing metacharacters comes back escaped, so removing the second `escHtml()` call cannot open an injection.
    - Every OTHER second-person site in these files still reads ye/yer — the exception covers the label class only, and a synthetic spoken string using the plain pronoun in the same file still FAILS the register gate.
    - An exception whose anchor text is no longer present FAILS as stale, rather than sitting as permanent cover.
  </behavior>
  <action>
Three sites use the second-person pronoun where the word is an identifying LABEL rather than address.
Wyatt: *"this should say 'you' not 'ye'."* The rule to encode in the comment and the gate: **the pirate
register applies to text the GAME SPEAKS. A label that points at a row, seat or field to say "this one
is the reader" is UI chrome — not a sentence, no verb, not spoken in the game's voice — and takes plain
"you."** `name — ye` is not pirate; it is a grammar error, because `ye` is a pronoun standing in for a
person, so a bare `name — ye` reads as "Wyatt — thou" rather than "Wyatt — that's the one that's you".

**The three label sites** (locate by content, not by the line numbers recorded in the playtest notes —
the hardening plan has inserted marker comments since):

| File | Currently | Becomes |
|---|---|---|
| `src/ui/lobby.js` `renderSeatList` | the `me` suffix on the seat label | the plain-pronoun form |
| `src/ui/util.js` `buildPlayerRows` | the player-row `title` tooltip's `that's …!` | the plain-pronoun form |
| `index.html` | `ppName0`'s placeholder `Player 1 (…)` | the plain-pronoun form |

**F2/UI-06 in the same task, because they are the same two lines.** `renderSeatList` renders
`${pn(i)} — ${label}` while `label` itself begins with the seated player's name, so a joined human's
name prints twice — the `Wyatt — Wyatt — ye` in his screenshot. This is not a new judgment call:
**requirement UI-06 already specifies the exact rendering**, including the plain pronoun and the
no-name case. Deliver it:

- reader's seat -> `{name} — you`
- another human -> `{name}`
- empty seat -> `{captain default} — 🤖 bot`

Keep `pn(i)` as the single name rendering and drop the duplicate from `label`, so `label` becomes only
the suffix (or empty). `pn(i)` already carries the seat colour and, through `pname()`, the HTML
escaping — so the remaining rendering is the one that was already there, and the escaping is preserved
rather than re-implemented. Suppress the separator when the suffix is empty.

**The no-name case is UI-06's own requirement, so handle it rather than deferring it.** `pname()`
returns `escHtml(s.name)` for any seated player, which is an empty string when a player joined without
typing a name — the seat renders nameless everywhere, not just in the lobby. `rawName()` two functions
below already carries exactly the fallback UI-06 asks for. Mirror it in `pname()`: escape the trimmed
name, and fall back to the captain default when it is empty. One place, no new markup, no change for
any non-blank name — assert that.

**Then the register gate, or `npm test` goes red on correct work.** `scripts/ui_contract_check.js`
assertion 5 drives the plain second-person pronoun to zero across `src/` and `index.html`, so these
three restorations trip it. Add a fourth exclusion list beside the three that exist, in the same style
as the `src/ui/recipe.js` entry — named, individually reasoned, content-anchored:

- one entry per site, each carrying the file, the exact anchor text, and a one-line reason naming the
  label class and the finding, so a later pass cannot "fix" them back;
- scoped per file, so a fragment can never excuse a spoken string elsewhere;
- **and a staleness check**: if an entry's anchor is not present in its file, FAIL naming the entry.
  An exclusion that no longer matches anything is cover, not an exclusion — the discipline the
  hardening plan applies to its own allowlists.

Extend `--drill` with three cases, using the existing fixture helper: a synthetic *spoken* string in
`src/ui/lobby.js` using the plain pronoun still FAILS (the negative control that proves the exception
did not widen into the file); a stale anchor FAILS; and a fixture matching the real anchors PASSES.

Annotate all three source sites with the rule, citing F1 and UI-06 and the date. Do not touch any of
the ~50 in-sentence address sites.
  </action>
  <verify>
    <automated>
set -e
# 1. the three label sites read the plain pronoun, and the pre-conversion forms are gone from live code
#    NOTE: the lobby's suffix and its separator are now in DIFFERENT expressions (the separator is
#    suppressed for an empty suffix), so assert the suffix literal inside renderSeatList — never the
#    concatenated rendering, which no longer exists as one literal in source.
node -e '
const fs=require("fs");
const strip=s=>s.split("\n").filter(l=>!/^\s*(\/\/|\/\*|\*)/.test(l)).join("\n");
const lobby=strip(fs.readFileSync("src/ui/lobby.js","utf8"));
const util=strip(fs.readFileSync("src/ui/util.js","utf8"));
const html=strip(fs.readFileSync("index.html","utf8"));
const seatFn=lobby.slice(lobby.indexOf("renderSeatList"),lobby.indexOf("hideBootLoader"));
if(!/["\x27`]you["\x27`]/.test(seatFn))throw new Error("renderSeatList must carry the plain-pronoun suffix as its own literal");
if(!/label\s*\?/.test(seatFn))throw new Error("the separator must be suppressed when the suffix is empty");
if(!/that.s you!/.test(util))throw new Error("player-row tooltip must read the plain pronoun");
if(!/Player 1 \(you\)/.test(html))throw new Error("the name placeholder must read the plain pronoun");
if(/— ye"/.test(lobby))throw new Error("the old lobby label form is still in live code");
if(/that.s ye!/.test(util))throw new Error("the old tooltip form is still in live code");
if(/Player 1 \(ye\)/.test(html))throw new Error("the old placeholder form is still in live code");
console.log("PASS all three label sites converted, no old form in live code");'

# 2. one name per seat row: the duplicate rendering is gone
node -e '
const s=require("fs").readFileSync("src/ui/lobby.js","utf8");
const i=s.indexOf("renderSeatList");
const region=s.slice(i,s.indexOf("export function",i+10)<0?undefined:s.indexOf("export function",i+10));
const code=region.split("\n").filter(l=>!/^\s*(\/\/|\/\*|\*)/.test(l)).join("\n");
const pn=(code.match(/pn\(i\)/g)||[]).length;
const esc=(code.match(/escHtml\(s\.name\)/g)||[]).length;
if(pn!==1)throw new Error("expected exactly one pn(i) rendering in the seat row, found "+pn);
if(esc!==0)throw new Error("the duplicate escHtml(s.name) rendering is still present ("+esc+")");
console.log("PASS one name per seat row");'

# 3. escaping is PRESERVED (T-PB-02) and the no-name fallback works (UI-06)
node --input-type=module -e '
const st=await import("./src/state/index.js");
const u=await import("./src/ui/util.js");
st.appState.roster=[{id:"a",name:"<img src=x onerror=1>"},{id:"b",name:"   "},{},{}];
const escaped=u.pname(0);
if(/<img/.test(escaped))throw new Error("pname() no longer escapes a typed name: "+escaped);
if(!/&lt;img/.test(escaped))throw new Error("expected HTML-escaped output, got: "+escaped);
const blank=u.pname(1);
if(!blank.trim())throw new Error("UI-06: a seated player with no typed name must still show a name");
st.appState.roster=[{id:"a",name:"Wyatt"},{},{},{}];
const plain=u.pname(0);
if(plain!=="Wyatt")throw new Error("a non-blank name must be unchanged, got: "+plain);
console.log("PASS escaping preserved; blank-name fallback ->",JSON.stringify(blank));'

# 4. the register gate is green, the three exceptions are named WITH reasons, and staleness fails
node scripts/ui_contract_check.js 2>&1 | tee /tmp/pb-t4.txt
grep -E '^FAIL' /tmp/pb-t4.txt && { echo "register gate has failures"; exit 1; } || true
node -e '
const s=require("fs").readFileSync("scripts/ui_contract_check.js","utf8");
if(!/label/i.test(s))throw new Error("the new exception list must name the label class");
for(const f of ["lobby.js","util.js","index.html"])
  if(!s.includes(f))throw new Error("the exception list must name "+f);
if(!/stale/i.test(s))throw new Error("a stale-anchor check is required — an unmatched exclusion is cover, not an exclusion");
console.log("PASS label exception list: 3 named, reasoned, staleness-checked entries");'
node scripts/ui_contract_check.js --drill 2>&1 | tee /tmp/pb-t4d.txt
grep -qi 'negative control' /tmp/pb-t4d.txt
grep -qi 'stale' /tmp/pb-t4d.txt || { echo "drill must cover a stale label anchor"; exit 1; }
grep -qi 'label' /tmp/pb-t4d.txt || { echo "drill must exercise the label exception"; exit 1; }
node scripts/ui_contract_check.js --drill

# 5. the audit tool's own gates: reconcile per <gate_reconciliation> if either goes red
node scripts/narration_audit_check.js
node scripts/narration_copy_check.js

# 6. governing constraints
npm test
node scripts/determinism_baseline.js --verify
test -z "$(git diff --stat ab98e04..HEAD -- src/engine/index.js)"
    </automated>
  </verify>
  <done>
The three identifying-label sites read the plain pronoun and no pre-conversion form survives in live
code. A lobby seat renders its name exactly once — `{name} — you` for the reader, the bare name for
another human, `{captain} — 🤖 bot` for an empty seat — and a seated player who typed no name still
shows their captain default, satisfying UI-06. `pname()` still escapes typed names, proven against a
metacharacter payload. `ui_contract_check.js` carries a fourth, named, individually-reasoned,
content-anchored exception list for the label class with a staleness check, and its drill proves a
spoken string in the same file still fails, a stale anchor fails, and a matching fixture passes. Both
audit gates green (or reconciled per procedure). `npm test` green, 31/31 determinism, engine diff empty.
  </done>
  <commit>fix(f1,ui-06): an identifying label reads "you", and a lobby seat prints its name once</commit>
</task>

<task type="auto" id="5" tdd="true">
  <name>Task 5: F5's data layer — declare where the icon goes, never guess it from the string</name>
  <files>src/shared/index.js, scripts/engine_contract_check.js, scripts/narration_test.js</files>
  <behavior>
    - `dockFlavor(x)` returns byte-identical strings for all 7 ingredients, compared against a hardcoded copy of today's literals — this task changes NO rendered text.
    - `dockFlavorIcon(x)` equals `prefix + " " + <the ingredient's icon markup> + " " + name` for all 7.
    - Stripping the icon markup out of `dockFlavorIcon(x)` and collapsing whitespace yields exactly `dockFlavor(x)` — proving the icon is the ONLY difference, so no word and no icon can be lost (D-16).
    - An unknown ingredient key falls back on both helpers without throwing.
  </behavior>
  <action>
Wyatt's rule: *"when the ingredient icons are referencing an ingredient (not the island) they should
always consistently go directly in front of the ingredient, not in front of the flavor like they do
now."* Three narration branches render the icon before the whole flavour PHRASE, and the insertion
point cannot be derived from the string: `iname("cocoa")` is *"Cacao Pods"* while the flavour reads
*"Luscious Cacao Beans"*, so there is no substring to match. A regex would silently produce
*"a pod of Luscious 🍫 Cacao Beans"*. So the split is declared as data.

**Restructure `DOCK_FLAVOR` in `src/shared/index.js` from 7 strings to 7 `{prefix, name}` pairs.** The
split falls between the quantity/container phrase and the product name — the name keeps every adjective
that belongs to it, which is precisely the *"Luscious"* case above:

| key | prefix | name |
|---|---|---|
| sugar | `a jar of` | `Crystal Sugar` |
| vanilla | `a bundle of` | `Velvety Vanilla Beans` |
| spice | `sprigs of` | `Red-Hot Cinnamon` |
| wheat | `a sack of` | `Toasty Wheat` |
| dairy | `some jugs of` | `Fresh Milk` |
| eggs | `a dozen` | `Sand-Speckled Eggs` |
| cocoa | `a pod of` | `Luscious Cacao Beans` |

Note `eggs`: the prefix carries no "of". That asymmetry is exactly why this is data and not a pattern.

**Keep `dockFlavor(x)` returning the joined string, unchanged in signature and in value.** Two things
depend on that and both must keep working untouched: the seven `misc:dockFlavor:<ing>` audit cards
render `dockFlavor(ing)` directly, so an identical return keeps Wyatt's seven reviewed rows exactly as
they were; and the neutral dock narration's own wording is unchanged by this task.

**Add `dockFlavorIcon(x)`** returning `prefix`, the ingredient's icon markup, then `name` — built with
the module's own `iconImg`/`ING_IMG` so there is one place that decides where the icon goes. Give it
the same unknown-key fallback shape `dockFlavor` has (icon plus the plain name), and export it.

If a pinned export list rejects the new symbol (`SHARED_MOVED_SYMBOLS` in
`scripts/engine_contract_check.js` is the likely one), add it there deliberately with no other change —
that is what the pin is for.

**Change no consumer in this task.** `flow.js` and `util.js` move in Tasks 6 and 7. This commit exists
so that if a fixture or a pinned list moves, it moves with nothing else in the diff.

Pin the four behaviours in `scripts/narration_test.js`, which already imports the shared module's
helpers, using a hardcoded copy of today's seven literals as the comparison input — never a value
re-derived from the new structure, which would compare the change to itself.
  </action>
  <verify>
    <automated>
set -e
node --input-type=module -e '
const m = await import("./src/shared/index.js");
// today's literals, hardcoded — NOT re-derived from the new structure
const BEFORE={sugar:"a jar of Crystal Sugar",vanilla:"a bundle of Velvety Vanilla Beans",
  spice:"sprigs of Red-Hot Cinnamon",wheat:"a sack of Toasty Wheat",dairy:"some jugs of Fresh Milk",
  eggs:"a dozen Sand-Speckled Eggs",cocoa:"a pod of Luscious Cacao Beans"};
for(const [k,want] of Object.entries(BEFORE)){
  const got=m.dockFlavor(k);
  if(got!==want)throw new Error("dockFlavor("+k+") CHANGED: "+JSON.stringify(got)+" want "+JSON.stringify(want));
}
if(typeof m.dockFlavorIcon!=="function")throw new Error("dockFlavorIcon must be exported");
for(const k of Object.keys(BEFORE)){
  const withIcon=m.dockFlavorIcon(k);
  const icon=m.iconImg(m.ING_IMG[k]);
  if(!withIcon.includes(icon))throw new Error("dockFlavorIcon("+k+") dropped the icon (D-16)");
  // the ONLY difference is the inserted icon
  const stripped=withIcon.split(icon).join(" ").replace(/\s+/g," ").trim();
  if(stripped!==BEFORE[k])throw new Error("dockFlavorIcon("+k+") changed words too: "+JSON.stringify(stripped));
  // and it sits between prefix and name, not at the front
  if(withIcon.trim().startsWith(icon))throw new Error("dockFlavorIcon("+k+") put the icon before the whole clause");
  const before=withIcon.slice(0,withIcon.indexOf(icon)).trim();
  if(!before)throw new Error("dockFlavorIcon("+k+") has no prefix before the icon");
  if(!BEFORE[k].startsWith(before))throw new Error("the prefix does not match the original phrase: "+before);
}
// unknown key: both helpers survive
m.dockFlavor("nonsuch"); m.dockFlavorIcon("nonsuch");
console.log("PASS 7 joined strings byte-identical; icon inserted between prefix and name; fallback safe");'

node scripts/narration_test.js 2>&1 | tee /tmp/pb-t5.txt
grep -qi 'dockFlavorIcon' /tmp/pb-t5.txt || { echo "the harness must pin the new helper"; exit 1; }
grep -E '^\s*FAIL' /tmp/pb-t5.txt && { echo "harness failures"; exit 1; } || true

# no rendered text changed, so BOTH audit gates and the table fixture must still be green untouched
node scripts/narration_audit_check.js
node scripts/narration_copy_check.js
npm test
node scripts/determinism_baseline.js --verify
test -z "$(git diff --stat ab98e04..HEAD -- src/engine/index.js)"
    </automated>
  </verify>
  <done>
`DOCK_FLAVOR` declares seven `{prefix, name}` pairs; `dockFlavor()` returns byte-identical strings for
all seven against a hardcoded copy of today's literals; `dockFlavorIcon()` inserts the icon between
prefix and name and differs from `dockFlavor()` by nothing but that icon, proven by stripping it back
out; both helpers survive an unknown key. No consumer changed, no rendered text changed, the table
fixture and both audit gates are green untouched. `npm test` green, 31/31 determinism, engine diff empty.
  </done>
  <commit>refactor(f5): declare the dock-flavour icon insertion point in data, not in a regex</commit>
</task>

<task type="auto" id="6">
  <name>Task 6: F5 in the dock button and the tails prompt — icon before the noun it names</name>
  <files>src/ui/flow.js, scripts/narration_flow_test.js</files>
  <action>
Two strings in `src/ui/flow.js` put an ingredient icon in front of a whole clause instead of in front
of the noun it labels.

**Site 1 — the dock action button.** Wyatt's own example: *"In the 'Dock at Full Cream Folly' the icon
should go directly in front of the island name — 'Dock at 🥛 Full Cream Folly'"*. Move the icon from
in front of the anchor-plus-verb clause to immediately before the place name. Nothing else about the
label changes.

**Site 2 — the dock-on-tails buy prompt**, which renders the icon before the flavour phrase, the same
shape as the three narration branches. Replace the separate icon-plus-flavour interpolation with
`dockFlavorIcon()` from Task 5, so the icon lands before the ingredient NAME.

Note in the commit body that site 2 was **not** in the playtest notes' six-site audit table — it is a
seventh site with the identical shape, found while implementing. Same rule, same fix, no new copy.

**Leave the dock flip prompt exactly as it is.** The playtest notes measured it as already correct
(icon directly before the place name). Assert that it did not change.

The buy button's own label already renders icon-then-name through `ilabelImg`, so it is correct too —
leave it and assert it.

Import `dockFlavorIcon` and drop `dockFlavor` from this file's import list if site 2 was its only use
in `flow.js`.

Pin all of it in `scripts/narration_flow_test.js` as source-text assertions, this file's established
convention for anything inside a DOM-needing function: extract each template literal by content and
assert the icon interpolation appears AFTER the words it must follow and BEFORE the name it labels.
Locate by content, never by line number.

Then re-run both audit gates. The dock button is a `button:` card and its text changes, so expect the
copy gate to speak up — that is the system working. Apply `<gate_reconciliation>` in order: re-pin a
drift baseline if that is what fails, or add one named `KNOWN_DIVERGENT` entry citing F5, the date and
`15-PLAYTEST-NOTES.md`, recording that his WORDS are unchanged and only the icon position moved.
  </action>
  <verify>
    <automated>
set -e
# 1. the dock button puts the icon after "Dock at", and the flip prompt is untouched
node -e '
const s=require("fs").readFileSync("src/ui/flow.js","utf8");
const code=s.split("\n").filter(l=>!/^\s*\/\//.test(l)).join("\n");
const btn=code.match(/`[^`]*Dock at[^`]*`/g)||[];
if(!btn.length)throw new Error("dock button label not found");
const label=btn.find(t=>t.includes("⚓"));
if(!label)throw new Error("the anchor-prefixed dock label not found");
if(label.indexOf("Dock at")>label.indexOf("iconImg"))throw new Error("the icon still precedes the whole clause: "+label);
if(!/Dock at \$\{iconImg/.test(label))throw new Error("the icon must sit immediately before the place name: "+label);
const flip=btn.find(t=>t.includes("flip!"));
if(!flip||!/Docking at \$\{iconImg/.test(flip))throw new Error("the dock FLIP prompt must be unchanged (it was already correct)");
console.log("PASS dock button icon moved; flip prompt untouched");'

# 2. the tails prompt uses the declared split, and no icon-before-flavour interpolation survives
node -e '
const s=require("fs").readFileSync("src/ui/flow.js","utf8");
const code=s.split("\n").filter(l=>!/^\s*\/\//.test(l)).join("\n");
const i=code.indexOf("Tails! Take");
if(i<0)throw new Error("the tails buy prompt not found");
const region=code.slice(i-120,i+260);
if(!/dockFlavorIcon\s*\(/.test(region))throw new Error("the tails prompt must use dockFlavorIcon()");
if(/iconImg\(ING_IMG\[ing\]\)\}\s*\$\{dockFlavor\(/.test(code))throw new Error("an icon-before-flavour interpolation survives");
if(/ilabelImg\(ing\)/.test(region)===false)throw new Error("the buy BUTTON label must keep its icon-then-name rendering");
console.log("PASS tails prompt uses the declared split; buy button label untouched");'

# 3. the harness pins it
node scripts/narration_flow_test.js 2>&1 | tee /tmp/pb-t6.txt
grep -qiE 'dock at|icon' /tmp/pb-t6.txt || { echo "the harness must pin the icon placement"; exit 1; }
grep -E '^\s*FAIL' /tmp/pb-t6.txt && { echo "harness failures"; exit 1; } || true

# 4. audit gates — reconcile per <gate_reconciliation>; a KNOWN_DIVERGENT entry must carry a reason
node scripts/narration_audit_check.js
node scripts/narration_copy_check.js 2>&1 | tee /tmp/pb-t6c.txt
node -e '
const t=require("fs").readFileSync("/tmp/pb-t6c.txt","utf8");
const lines=t.split("\n").filter(l=>/KNOWN_DIVERGENT/i.test(l)&&/F5/.test(l));
if(/KNOWN_DIVERGENT/i.test(t)&&!lines.length&&/dock/i.test(t)) throw new Error("a dock divergence exists but carries no F5 reason");
console.log("PASS copy gate reconciled"+(lines.length?" with "+lines.length+" reasoned F5 entr(ies)":" with no divergence"));'

npm test
node scripts/determinism_baseline.js --verify
test -z "$(git diff --stat ab98e04..HEAD -- src/engine/index.js)"
    </automated>
  </verify>
  <done>
The dock action button reads the anchor, the verb, then the icon immediately before the island name; the
dock-on-tails buy prompt renders the flavour through `dockFlavorIcon()` so the icon precedes the
ingredient name; the already-correct flip prompt and buy-button label are asserted unchanged; no
icon-before-flavour interpolation survives in the file. `narration_flow_test.js` pins the ordering by
content. Both audit gates green or reconciled with a reasoned entry naming F5 and the date. `npm test`
green, 31/31 determinism, engine diff empty.
  </done>
  <commit>fix(f5): the dock button and tails prompt put the icon directly before the noun it names</commit>
</task>

<task type="auto" id="7" tdd="true">
  <name>Task 7: F5 + F10 in the dock narration — icon before the noun, and no pronoun without an antecedent</name>
  <files>src/ui/util.js, scripts/narration_test.js, art-review/narration-table-baseline.json</files>
  <behavior>
    - For every ingredient and every one of the four dock branches, the NEUTRAL line is the pre-change neutral line with the icon moved and nothing else: strip the icon markup, collapse whitespace, and it is byte-identical to a hardcoded copy of today's text.
    - The addressed `bought` line names both the place and the goods, so its "it" has an antecedent — pinned as an exact expected string for one ingredient.
    - The addressed `coins` and `empty` lines likewise name their place and goods, per D-46's letter.
    - The addressed `ing` (heads) line still drops the place clause and leads with the payoff — the ONE branch D-46 sanctioned for the cut — with the icon now before the ingredient name.
    - Every branch, addressed and neutral, still contains the ingredient's icon markup (D-16).
  </behavior>
  <action>
Two findings meet in one builder, `EVENT_NARRATION.dock` in `src/ui/util.js`.

**F5, sites 3-5.** The `ing`, `bought` and `coins` branches render the icon before the flavour PHRASE.
Replace the separate icon-plus-flavour interpolation with a single `dockFlavorIcon()` value used by
every branch that names goods, so the icon sits before the ingredient name in all of them and one place
decides where it goes.

**F10 — the addressed lines have a pronoun with no antecedent.** Read live on seat 1:
*"Claude — ye flip ⚫ TAILS, but buy it anyway for 3🌕"*. "It" refers to nothing, because the goods
clause was cut. The neutral sibling reads correctly precisely because it names the goods earlier in the
same sentence.

**This is a deviation from a binding decision, so the fix is a restoration and invents no words.**
D-46 says: *"Only the `ing` (heads) narration branch loses its place clause. The other three dock
branches still need theirs. Do not apply the cut across all four."* The addressed `bought`, `coins` and
`empty` branches were cut anyway. Restore them by person-shifting their own neutral siblings — place
clause and goods intact, third-person verbs to second person, no new phrasing:

- `bought` -> the neutral `bought` line in second person; its "it" then resolves to the goods named
  earlier in the same sentence, exactly as the neutral's does.
- `coins` -> the neutral `coins` line in second person. It is less broken than `bought` (taking coins
  needs no antecedent) but equally uninformative: a player reading only their own line never learns
  which island or ingredient they just passed up.
- `empty` -> the neutral `empty` line in second person. **This is one line wider than F10 named, and
  deliberately so:** F10 names `bought` and `coins`, but D-46's letter covers all three non-`ing`
  branches, and restoring two of three would leave a NEW inconsistency where there is currently a
  uniform one. Call it out in the commit body and in the morning brief as a D-46-letter restoration.

**Leave the addressed `ing` branch leading with the payoff.** That is the single cut D-46 sanctioned,
it was confirmed correct in live play, and only its icon position changes.

**Update the stale comment above the builder.** It currently states that the addressed line drops the
place clause for `ing`/`empty`/`bought`/`coins` — the very over-application D-46 forbade. Rewrite it to
state D-46's actual scope, cite F10 and the date, and record that D-48's flavour text is kept on every
branch.

Pin it in `scripts/narration_test.js`, which already builds synthetic events and renders them per
viewer:

- the icon-stripped equality for all 7 ingredients x 4 branches x both viewer forms, against a
  hardcoded copy of today's neutral text for one ingredient plus the structural equality for the rest;
- the exact expected addressed `bought` string for one ingredient, written out in full so a future
  re-cut fails;
- a presence assertion for the icon markup on every branch (D-16).

**Then re-pin the table fixture.** These are `table:dock~*` cards, and `art-review/narration-table-baseline.json`
pins them byte-for-byte, so this task MUST re-pin it — in this same commit, using the regeneration mode
the hardening plan shipped rather than a hand edit, with the reason in the commit body. Then apply
`<gate_reconciliation>` for the copy gate: Wyatt approved the dock copy verbatim (NARR-01/D-25/D-46/D-48),
so expect approval rows to speak up, and reconcile with named entries citing F5/F10 and the date,
recording that his words are restored rather than rewritten.
  </action>
  <verify>
    <automated>
set -e
# 1. the comparison input is a HARDCODED copy of the pre-change text, never re-derived from the new
#    code — otherwise the equality compares the change to itself and can only pass. The rendering
#    itself is asserted inside narration_test.js, which already carries the synthetic-event bootstrap.
node -e '
const t=require("fs").readFileSync("scripts/narration_test.js","utf8");
const need=["some jugs of Fresh Milk","Full Cream Folly"];
for(const n of need) if(!t.includes(n))
  throw new Error("narration_test.js must hardcode the pre-change dock text as the comparison input, missing: "+n);
if(!/dockFlavor\(/.test(t)&&!/BEFORE|PRE_/.test(t))
  throw new Error("the expected text must be a committed literal, not derived from the live builder");
console.log("PASS the dock equality compares against hardcoded pre-change text, not against itself");'

# 2. the harness carries every pin, including the exact addressed bought line
node scripts/narration_test.js 2>&1 | tee /tmp/pb-t7.txt
grep -E '^\s*FAIL' /tmp/pb-t7.txt && { echo "harness failures"; exit 1; } || true
node -e '
const t=require("fs").readFileSync("/tmp/pb-t7.txt","utf8");
for(const need of ["bought","coins","empty","icon"])
  if(!new RegExp(need,"i").test(t))throw new Error("the harness must report a "+need+" assertion");
console.log("PASS harness pins all four dock branches plus icon presence");'

# 3. no pronoun without an antecedent: the addressed bought/coins/empty name place AND goods
node -e '
const s=require("fs").readFileSync("src/ui/util.js","utf8");
const i=s.indexOf("dock:(e,at,cellPx,viewerSeat)");
if(i<0)throw new Error("the dock builder moved — re-locate before asserting");
const region=s.slice(i,i+1800);
const code=region.split("\n").filter(l=>!/^\s*\/\//.test(l)).join("\n");
const gA=code.slice(code.indexOf("const gA="),code.indexOf("const capM="));
for(const br of ["bought","coins","empty"]){
  const line=gA.slice(gA.indexOf(br+":"),gA.indexOf(br+":")+220);
  if(!/place/.test(line))throw new Error("addressed "+br+" must name the place (D-46)");
}
if(!/bought:.*(goods|dockFlavorIcon)/.test(gA))throw new Error("addressed bought must name the goods — that is F10");
if(/\$\{ingIcon\}\s*\$\{flavor\}/.test(code))throw new Error("an icon-before-flavour interpolation survives");
console.log("PASS addressed bought/coins/empty name place and goods; no icon-before-flavour form left");'

# 4. the table fixture was RE-PINNED in this commit, not left stale
git diff --name-only HEAD~1..HEAD 2>/dev/null | grep -q 'narration-table-baseline.json' \
  || { echo "the table fixture must be re-pinned in this same commit"; exit 1; }
node scripts/narration_audit_check.js
node scripts/narration_copy_check.js 2>&1 | tee /tmp/pb-t7c.txt
node -e '
const t=require("fs").readFileSync("/tmp/pb-t7c.txt","utf8");
if(/KNOWN_DIVERGENT/i.test(t)){
  const bad=t.split("\n").filter(l=>/KNOWN_DIVERGENT/i.test(l)&&!/F5|F10/.test(l)&&/dock/i.test(l));
  if(bad.length)throw new Error("a dock divergence carries no F5/F10 reason: "+bad[0]);
}
console.log("PASS copy gate reconciled with reasoned entries or no divergence");'

npm test
node scripts/determinism_baseline.js --verify
test -z "$(git diff --stat ab98e04..HEAD -- src/engine/index.js)"
    </automated>
  </verify>
  <done>
All four dock branches render the icon immediately before the ingredient name through one shared value;
every neutral line is its pre-change self with the icon moved and nothing else, proven by stripping the
icon back out; the addressed `bought`, `coins` and `empty` lines name their place and their goods per
D-46's letter, so no pronoun is left without an antecedent, with the exact addressed `bought` string
pinned in full; the addressed `ing` line still leads with the payoff; every branch still carries its
icon (D-16); the stale comment now states D-46's real scope. `art-review/narration-table-baseline.json`
is re-pinned in this commit with its reason, and the copy gate is green or reconciled with entries
naming F5/F10. `npm test` green, 31/31 determinism, engine diff empty.
  </done>
  <commit>fix(f5,f10): dock narration puts the icon before the ingredient name, and restores D-46's place-and-goods clauses</commit>
</task>

<task type="auto" id="8" tdd="true">
  <name>Task 8: F9 — the unaffordable buy option greys out and says why, instead of vanishing</name>
  <files>src/ui/flow.js, scripts/narration_flow_test.js, art-review/narration-inventory.json, art-review/narration-audit.html</files>
  <behavior>
    - Docking on tails with the buy rule on and stock remaining ALWAYS shows the prompt: the coin gate no longer decides whether the choice appears, only whether the buy option is clickable.
    - Under 3 coins: the buy option renders disabled and the helper slot carries Wyatt's reason; the take-the-coins option still works and the turn resolves as before.
    - At 3 or more coins: the prompt and both options are exactly as they are today, and the helper slot is empty — the reason appears only in the state it explains.
    - The reason ships byte-exact, including its U+2014 em dash and its coin emoji shorthand.
    - A forced or edge selection of the disabled option cannot spend coins the captain does not have (the D-40 safety-net pattern).
  </behavior>
  <action>
Observed on seat 1 with 2 coins docking at Full Cream Folly: **no prompt appeared at all**. The turn
resolved straight to taking the coins, and the player never learned that buying the crate was possible
but unaffordable — which is exactly the information that teaches the dock-on-tails rule. Same family as
D-41's dead-ends, inverted: instead of offering an option that cannot work, this removes the choice with
no explanation.

**The fix, following D-41's own reference implementation** (the Attack button: `disabled` plus helper
text in the `sub` slot, confirmed working in live play):

- Split the affordability test out of the branch condition. The prompt is shown whenever the buy rule is
  on and the island still has stock; affordability decides only `disabled` on the buy option.
- Pass the reason through `ask()`'s existing 4th argument, supplied **only** when unaffordable, so an
  affordable captain sees no helper text. No mechanism change: `ask()` already forwards `disabled` per
  option and `sub` through both the local and the remote prompt paths.
- Keep the D-40 safety net: guard the purchase itself on affordability as well as on the returned
  choice, so a forced or edge selection can never spend coins that are not there. Cite D-40.

**The reason is Wyatt's own copy, approved 2026-07-29 — ship it verbatim:**

    Yer too broke to buy it — take the 3🌕 instead.

Three things to get right, all of them load-bearing:
- the dash is a U+2014 em dash per D-53 and the house style — not an en dash, not a hyphen;
- the coin glyph stays as the emoji shorthand in source, because `emojify()` turns it into the coin
  artwork at the `panel()` chokepoint (D-50) — do not hand-roll an image tag;
- comment it in the established approved form, citing F9, D-41 and the date. It matches his existing
  siblings — the Attack powder line and the broke-sail line — so there is no register concern.

**Do not change the prompt sentence.** It already names the alternative, and the helper text explains
why that alternative is greyed; rewriting it would be new copy nobody asked for.

**This is the only NEW copy site in the plan, so it must be registered or the health gate fails.** After
the change, run the extractor. If it reports an unmarked live site, add a `// @copy <id>` marker
following the hardening plan's id rules — character set `[a-z0-9.-]+`, no parens, no pre-conversion
pronoun token, named for the moment and role rather than the wording. Then confirm the health gate's
"every live site is placed exactly once" assertion passes; if the new card is unplaced, place it in the
same flow-chart node as the dock-tails prompt it belongs to. Check whether any pinned per-file sink
count moved; if so update the literal deliberately with a one-line reason.

**Note the composition with the gate the other executor just added.** `ui_contract_check.js`'s
co-reachability assertion requires every `disabled:` option to have a reachable reason. This task adds a
`disabled:` option, so that gate now covers it — and would fail if the reason were ever removed. Say so
in the code comment: the gate and the fix hold each other up.

Pin the behaviour in `scripts/narration_flow_test.js` as source-text assertions: the coin test is out of
the branch condition; the buy option carries `disabled:`; the reason string is present in the same call
and supplied conditionally; the em dash is U+2014; and the purchase is guarded.
  </action>
  <verify>
    <automated>
set -e
# 1. the coin gate no longer decides whether the prompt appears
node -e '
const s=require("fs").readFileSync("src/ui/flow.js","utf8");
const code=s.split("\n").filter(l=>!/^\s*\/\//.test(l)).join("\n");
const i=code.indexOf("Tails! Take");
if(i<0)throw new Error("the tails prompt not found");
// the branch condition is the `if(...)` immediately preceding the prompt
const cond=code.slice(Math.max(0,i-420),i);
const lastIf=cond.lastIndexOf("if(");
const guard=lastIf<0?cond:cond.slice(lastIf);
if(/p\.coins\s*>=\s*3/.test(guard))
  throw new Error("the coin test is STILL in the branch condition — the prompt would keep vanishing: "+guard.trim());
if(!/dockBuy/.test(guard)||!/tokens/.test(guard))throw new Error("the buy rule and stock tests must remain in the condition");
const call=code.slice(i-40,i+700);
if(!/disabled\s*:/.test(call))throw new Error("the buy option must carry a disabled flag");
if(!/p\.coins\s*>=\s*3/.test(call))throw new Error("affordability must be computed for the disabled flag");
console.log("PASS the prompt always shows; affordability only greys the option");'

# 2. the reason ships byte-exact, em dash and coin shorthand included, and only when unaffordable
node -e '
const s=require("fs").readFileSync("src/ui/flow.js","utf8");
const WANT="Yer too broke to buy it — take the 3\u{1F315} instead.";
if(!s.includes(WANT))throw new Error("the approved reason is not present byte-exact (check the U+2014 em dash and the coin shorthand)");
if(/Yer too broke to buy it –|Yer too broke to buy it -/.test(s))throw new Error("the dash must be U+2014, not an en dash or hyphen (D-53)");
if(/<img[^>]*coin[^>]*>\s*instead/i.test(s))throw new Error("keep the coin emoji shorthand — emojify() renders the art (D-50)");
const i=s.indexOf(WANT);
const around=s.slice(Math.max(0,i-400),i+120);
if(!/\?\s*null\s*:|canBuy\s*\?/.test(around))throw new Error("the reason must be supplied conditionally, so an affordable captain sees no helper text");
console.log("PASS reason byte-exact, em dash correct, supplied only when unaffordable");'

# 3. the purchase is guarded (D-40) — a forced selection cannot overspend
node -e '
const s=require("fs").readFileSync("src/ui/flow.js","utf8");
const code=s.split("\n").filter(l=>!/^\s*\/\//.test(l)).join("\n");
const i=code.indexOf("Tails! Take");
const after=code.slice(i,i+900);
const buyGuard=(after.match(/if\s*\(\s*buy[^)]*\)/)||[""])[0];
if(!buyGuard)throw new Error("the purchase branch was not found");
if(!/&&/.test(buyGuard))throw new Error("the purchase must be guarded on affordability as well as on the returned choice (D-40): "+buyGuard);
console.log("PASS D-40 safety net present:",buyGuard);'

# 4. co-reachability gate now covers the new disabled option, and the new copy site is registered
node scripts/ui_contract_check.js 2>&1 | tee /tmp/pb-t8u.txt
grep -E '^FAIL' /tmp/pb-t8u.txt && { echo "ui_contract_check failures — a disabled option without a reachable reason?"; exit 1; } || true
node scripts/extract_narration_lines.js
node scripts/narration_audit_check.js 2>&1 | tee /tmp/pb-t8a.txt
grep -E '^FAIL' /tmp/pb-t8a.txt && { echo "health gate failures — register the new copy site per <gate_reconciliation> option 4"; exit 1; } || true
node scripts/narration_copy_check.js

# 5. the harness pins it
node scripts/narration_flow_test.js 2>&1 | tee /tmp/pb-t8.txt
grep -qiE 'broke to buy|disabled' /tmp/pb-t8.txt || { echo "the harness must pin the greyed buy option and its reason"; exit 1; }
grep -E '^\s*FAIL' /tmp/pb-t8.txt && { echo "harness failures"; exit 1; } || true

npm test
node scripts/determinism_baseline.js --verify
test -z "$(git diff --stat ab98e04..HEAD -- src/engine/index.js)"
    </automated>
  </verify>
  <done>
Docking on tails with the buy rule on and stock remaining always shows the choice; under 3 coins the buy
option renders disabled with Wyatt's approved reason in the helper slot, byte-exact including its U+2014
em dash and coin shorthand, supplied only in the state it explains; at 3 or more coins nothing changed;
the purchase is guarded on affordability as well as on the returned choice (D-40). The new copy site is
marked, extracted and placed, so the health gate is green, and the co-reachability assertion now covers
the new disabled option. `narration_flow_test.js` pins all of it. `npm test` green, 31/31 determinism,
engine diff empty.
  </done>
  <commit>fix(f9): the unaffordable dock-buy option greys out with its reason instead of vanishing</commit>
</task>

<task type="auto" id="9" tdd="true">
  <name>Task 9: F6 — the narration box is never empty; a line persists until another replaces it</name>
  <files>src/ui/panel.js, scripts/narration_test.js</files>
  <behavior>
    - The guest display path schedules no timed fade: its body references neither the fade class nor the hold curve, so a trailing line stays on screen until the next line replaces it.
    - The host path STILL awaits the hold — `msgHoldMs(text)` remains in `flash()`, so pacing between consecutive lines is unchanged — and no longer fades to empty or waits out a trailing fade.
    - Chat bubbles are untouched: `showChatBubble` still fades on its own curve (D-15), so the fade class keeps a live consumer and nothing is orphaned.
    - The hold curves themselves are untouched: `MSG_HOLD_MULTIPLIER` is still 0.72 and the existing pinned hold values still hold.
    - An explicit clear still clears: a caller passing empty content still empties the panel, because a caller asking for an empty box is not a timer clearing one.
  </behavior>
  <action>
Wyatt, choosing between four options: *"Never fade the last line — only fade when something replaces
it."* His reasoning is the load-bearing part: *"we want players to be able to see and think about each
others' turns with them, as they think."* And on scope: *"this shouldn't be risky — you're just not
fading out the LAST line of a spectator until something replaces it — the blue box should never be
empty."*

**So the rule is exactly: the narration box is never empty, and a line persists until another line
replaces it.** The hold stays. The only thing that changes is what happens at the END of a line: the
fade stops being fired by a timer and is fired by the arrival of the next line.

**The guest path — `showNarration()`.** Today it renders, waits for the typewriter reveal, holds
`msgHoldMs(text)`, then adds the fade class. Under F6 the trailing line must survive, so delete that
timed hold-and-fade entirely. The next line's own render is what removes it — which IS "fade only when
something replaces it", and no timer can ever leave the box empty. Nothing awaits `showNarration()`, so
removing its internal wait changes no caller's pacing. The reveal is unaffected: `panel()` owns it and
stashes the promise on the element.

If the supersession token loses its last reader once the timed block is gone, **delete it too** and
record why in the comment — its only job was cancelling the fade it no longer schedules, and a variable
nothing reads is dead code, which D-33/D-34/D-40 exist to prevent.

**A cross-fade was considered and rejected, so record it rather than leaving it as an open question.**
Keeping the outgoing element alive to fade it over the existing half-second would delay every guest line
by that half-second — the opposite of D-58's anti-drag note — and would briefly put two lines in the box,
which snaps the panel height (BUG-01's own note about the box not animating its height). Replacement is
the transition.

**The host path — `flash()`.** KEEP the hold exactly as it is: it still awaits `msgHoldMs(text)`, so
pacing between consecutive lines is untouched, and `MSG_HOLD_MULTIPLIER`, `msgHoldMs()` and the chat
bubble curve are not to be touched at all. Remove only the two things that clear the box at the end: the
fade class, and the trailing half-second wait that exists solely to let that fade finish. The next
render replaces the line. This reclaims roughly half a second per line, which serves D-58's standing
note for free — a benefit, not a risk.

**Leave chat bubbles alone.** They fade on their own curve by D-15, so the fade class keeps a live
consumer and nothing is orphaned.

**Leave the explicit-clear path alone.** A caller passing empty content still empties and hides the
panel. A caller asking for an empty box is a different thing from a timer producing one.

**Update the D-57/D-58 comment block and the BUG-01 note in place**, citing F6 and the date, stating the
rule in one sentence, recording that the hold is deliberately preserved, and recording the honest
consequence for NARR-06 below. Do not delete the D-57 history — it explains why the guest path exists at
all.

**NARR-06, recorded honestly and NOT silently re-written.** Its criterion is *"narration stays fully
visible 10% less time before it begins fading."* Under F6 a TRAILING line never begins fading, so the
criterion is inapplicable to it. The hold still governs the gap between consecutive lines, so the 10% cut
still does real work. The requirement's literal wording is superseded by this decision and should be
**re-worded rather than re-verified** — that is a change to `.planning/REQUIREMENTS.md` that only Wyatt
can authorise, so put the note in the code comment and on the morning brief's list, and do NOT edit the
requirement here.

Pin all of it in `scripts/narration_test.js` as source-text assertions over `src/ui/panel.js`, extracting
each function's body by name. **The assertions must strip comment lines**, because this task's own
comments necessarily name the class and the behaviour they remove — a raw substring check would fail on
its own documentation.
  </action>
  <verify>
    <automated>
set -e
node -e '
const fs=require("fs");
const src=fs.readFileSync("src/ui/panel.js","utf8");
// strip comment lines: this task's own comments name what it removes
const code=src.split("\n").filter(l=>!/^\s*(\/\/|\/\*|\*)/.test(l)).join("\n");
function body(name){
  const i=code.indexOf(name);
  if(i<0)throw new Error(name+" not found");
  const j=code.indexOf("\nexport ",i+name.length);
  return code.slice(i,j<0?undefined:j);
}
const sn=body("export function showNarration");
const fl=body("export async function flash");
const cb=body("export function showChatBubble");

// guest: no timed fade, no hold curve — the trailing line survives
if(/fadeOut/.test(sn))throw new Error("showNarration still schedules a fade");
if(/msgHoldMs/.test(sn))throw new Error("showNarration still holds on a timer");
if(/_narrToken/.test(code)&&!/_narrToken/.test(sn))throw new Error("a supersession token survives with no reader — dead code");

// host: the hold is PRESERVED; the trailing clear is gone
if(!/msgHoldMs\(text\)/.test(fl))throw new Error("flash() must STILL await msgHoldMs(text) — the hold is deliberately preserved");
if(/fadeOut/.test(fl))throw new Error("flash() still fades to empty");
if(/sleep\(500\)/.test(fl))throw new Error("flash() still waits out a trailing fade");

// chat bubbles untouched (D-15), so the fade class keeps a live consumer
if(!/fadeOut/.test(cb))throw new Error("showChatBubble must keep its own fade (D-15)");

// an explicit clear still clears
if(!/panel\(html\?/.test(sn)&&!/if\(!html\)/.test(sn))throw new Error("the explicit-clear path must survive");
console.log("PASS F6: no timed fade, hold preserved, bubbles untouched, explicit clear intact");'

# the hold CURVES are untouched — the existing pinned values must still pass unchanged
node -e '
const s=require("fs").readFileSync("src/ui/util.js","utf8");
if(!/MSG_HOLD_MULTIPLIER=0\.72/.test(s))throw new Error("MSG_HOLD_MULTIPLIER must not change");
console.log("PASS hold curve untouched");'
node scripts/narration_test.js 2>&1 | tee /tmp/pb-t9.txt
grep -q '2160' /tmp/pb-t9.txt || { echo "the existing pinned hold values must still be asserted"; exit 1; }
grep -qiE 'never empty|persists|F6' /tmp/pb-t9.txt || { echo "the harness must pin the F6 rule by name"; exit 1; }
grep -E '^\s*FAIL' /tmp/pb-t9.txt && { echo "harness failures"; exit 1; } || true

# NARR-06 is NOT silently re-worded
git diff --name-only ab98e04..HEAD -- .planning/REQUIREMENTS.md | tee /tmp/pb-req.txt
test ! -s /tmp/pb-req.txt || { echo "REQUIREMENTS.md must not be edited — NARR-06 re-wording is Wyatt's call"; exit 1; }

node scripts/narration_audit_check.js
node scripts/narration_copy_check.js
npm test
node scripts/determinism_baseline.js --verify
test -z "$(git diff --stat ab98e04..HEAD -- src/engine/index.js)"
    </automated>
  </verify>
  <done>
The guest display path schedules no timed fade and no timed hold, so a trailing line stays on screen
until the next replaces it; `flash()` still awaits `msgHoldMs(text)` — pacing between consecutive lines
is unchanged and the curves are untouched — and no longer fades to empty or waits out a trailing fade,
reclaiming roughly half a second per line; chat bubbles keep their own fade (D-15) so nothing is
orphaned; an explicit clear still clears. No dead token survives. The rejected cross-fade and the
NARR-06 supersession are both recorded in the comment, and `.planning/REQUIREMENTS.md` is untouched
because re-wording NARR-06 is Wyatt's call. `narration_test.js` pins every one of these by name.
`npm test` green, 31/31 determinism, engine diff empty.
  </done>
  <commit>fix(f6): never fade the last narration line — the box holds it until another line replaces it</commit>
</task>

<task type="auto" id="10">
  <name>Task 10: the morning playtest brief — written for Wyatt, not for Claude</name>
  <files>.planning/quick/20260729-playtest-bug-fixes/MORNING-PLAYTEST-BRIEF.md</files>
  <action>
Write `MORNING-PLAYTEST-BRIEF.md` for a **non-coder**. He opens a link and plays. No commands, no gate
output, no file paths, no jargon — no "assertion", "gate", "projection", "frontmatter", "baseline".
Short sentences. Build the "what changed" list from what actually landed: read
`git log --oneline ab98e04..HEAD` rather than from this plan, so the brief describes the real branch
including the other executor's fixes.

Six sections, in this order:

**1. While you were asleep.** One short paragraph: what was broken, what is fixed, and the one thing
that mattered most — a bot could take coins you did not have and push you below zero.

**2. Open this and play.** The link, on its own line. Then one sentence, in plain language, telling him
to force a full refresh the first time (hold Shift and click reload, or Command-Shift-R) because the
browser keeps old copies of the game's code and two false alarms in yesterday's session traced to
exactly that. If a local server has to be running, say so in ONE plain sentence naming the link — not a
command block.

**3. What to look at, in order.** Numbered, cheapest first. For each: what to do, then what he should
see. Cover, in this order:
   1. the lobby, before starting — each seat shows its name once, and his own says "you", not "ye";
   2. the dock button and the flip prompt — the ingredient picture sits directly in front of the island
      name;
   3. dock and read the narration line — the picture sits directly in front of the ingredient's name,
      and the tails lines now say which island and which goods, so nothing reads as a bare "it";
   4. dock on tails with fewer than 3 coins — the buy choice now appears greyed out with a reason
      instead of silently disappearing, which is one extra click for him;
   5. trade with a bot while nearly broke — when a bot counters and he cannot cover it, the counter is
      not offered at all any more, and his coins can never go below zero;
   6. watch a bot's or another player's turn — the last line stays on screen instead of fading away, so
      the box is never empty.

**4. Tell me yes or no.** Only genuinely open items. Do NOT list F9's helper text — he approved that
wording. As of writing, the list is:
   - the way the last line now behaves: it stays until the next line replaces it, with no gentle fade in
     between. Is that what he meant?
   - the lobby's no-name case: a player who joins without typing a name now shows their captain name.
   - the four dock lines, read as copy — do they read right?
   - one line that was restored beyond what he named: the empty-island line now names the island too,
     for consistency with the two he did name.
   - the "10% less time before it fades" requirement: a last line never fades now, so that sentence
     needs re-wording rather than re-testing. Does he want it changed?
   - the coin check: whether to add a permanent guard so coins can never go below zero anywhere, with the
     recommendation from `COIN-AUDIT.md` stated in one plain sentence.
   - if any lines changed after he had already approved them, one plain sentence: the review tool will
     show them to him again next time.

**5. Still open on purpose.** The end-of-voyage box still stays on screen (a separate, known item), plus
anything the audit found and did not act on.

**6. Already fixed earlier today.** One line each, plain language, for the items that landed before this
plan and in the parallel work: his rewritten opening banner and the Lookout wording; the fishing range
dash; the confusing prompt of his that used to appear on other players' screens, and the empty blue box
that came from it; and the greyed Trade button that showed the wrong explanation.

Read it back once as if you were him. If a sentence needs a programmer to parse it, rewrite it.
  </action>
  <verify>
    <automated>
set -e
B=.planning/quick/20260729-playtest-bug-fixes/MORNING-PLAYTEST-BRIEF.md
test -f "$B"
node -e '
const t=require("fs").readFileSync(process.argv[1],"utf8");
// no commands, no code blocks
if(/```/.test(t))throw new Error("no code blocks — he does not run commands");
for(const cmd of ["npm ","node ","git ","grep "]) if(t.includes(cmd)) throw new Error("a command leaked into the brief: "+cmd);
// no jargon
for(const w of ["assertion","gate","projection","frontmatter","baseline","regression","allowlist","determinism"])
  if(new RegExp("\\b"+w,"i").test(t))throw new Error("jargon in a brief for a non-coder: "+w);
// the six sections
const heads=(t.match(/^#{1,3} .*/gm)||[]).length;
if(heads<6)throw new Error("expected at least 6 sections, found "+heads);
// a link and the hard-refresh warning
if(!/https?:\/\/|localhost/.test(t))throw new Error("the brief must give him a link");
if(!/refresh|reload/i.test(t))throw new Error("the brief must tell him to force a full refresh");
// the ordered walkthrough covers all six areas
for(const k of ["lobby","dock","tails","trade","coins","last line"])
  if(!new RegExp(k,"i").test(t))throw new Error("the walkthrough must cover: "+k);
// an approval list that does NOT ask him to re-approve his own F9 wording
if(!/yes or no/i.test(t))throw new Error("the approval section is required");
if(/too broke to buy it/.test(t))throw new Error("F9 wording is APPROVED — it must not be on the approval list");
console.log("PASS brief: "+heads+" sections, plain language, link + refresh note, 6 walkthrough areas, approval list clean");
' "$B"

# it describes the real branch, and every in-scope finding is accounted for somewhere in the plan dir
node -e '
const fs=require("fs");
const dir=".planning/quick/20260729-playtest-bug-fixes/";
const all=fs.readdirSync(dir).map(f=>fs.readFileSync(dir+f,"utf8")).join("\n");
for(const f of ["F1","F5","F9","F10","F12"]) if(!all.includes(f)) throw new Error("finding "+f+" is unaccounted for");
console.log("PASS all in-scope findings accounted for");'

npm test
test -z "$(git diff --stat ab98e04..HEAD -- src/engine/index.js)"
    </automated>
  </verify>
  <done>
`MORNING-PLAYTEST-BRIEF.md` exists, has six sections, contains no code block, no command and no jargon,
gives him a link plus the force-a-full-refresh sentence, walks him through the six areas cheapest first
with what to do and what he should see, lists only genuinely open items for his word (F9's approved
wording is NOT among them), records what stays open on purpose, and closes with what was already fixed
earlier today including the parallel executor's two fixes. `npm test` green, engine diff empty.
  </done>
  <commit>docs(playtest): morning brief — what changed, what to look at, what needs Wyatt's word</commit>
</task>

</tasks>

<verification>
After the last commit:

```
npm test                                        # green, 17+ gates
node scripts/determinism_baseline.js --verify    # 31/31
node scripts/ui_contract_check.js                # register + co-reachability + delivery all clean
node scripts/narration_audit_check.js            # every card resolves, every site placed
node scripts/narration_copy_check.js             # shipped == approved, or reconciled with reasons
git diff --stat ab98e04..HEAD -- src/engine/index.js   # prints nothing
git log --oneline ab98e04..HEAD                  # 8 commits from this plan, atomic, one finding each
```

Every `KNOWN_DIVERGENT` entry added by this plan names its finding, its date and what it supersedes.
Every re-pinned fixture carries its reason in the commit body. Wyatt's disposition files are untouched.
</verification>

<success_criteria>
- [ ] Task 1 confirmed the hardening plan's Tasks 1-9 are committed before anything else ran
- [ ] F12: `counterHeadroom()` caps against unpledged coins; the 405-point invariant grid passes
- [ ] F12 follow-up: every coin-debit path audited with a verdict; the shot-clock hypothesis answered; a recommendation made and not acted on
- [ ] F1/F2/UI-06: three label sites read plain `you`; one name per lobby seat; blank names fall back; escaping proven preserved; a named, staleness-checked gate exception with a working negative control
- [ ] F5: the icon insertion point is declared in data; `dockFlavor()` byte-identical; the icon is the only difference in every changed line
- [ ] F5/F10: all four dock branches carry the icon before the ingredient name; `bought`/`coins`/`empty` name place and goods per D-46; the table fixture re-pinned with its reason
- [ ] F9: the buy option greys with Wyatt's approved reason, byte-exact em dash and coin shorthand; the new copy site is marked, extracted and placed; D-40 guard present
- [ ] F6: the box is never empty; the hold is preserved and pinned; bubbles untouched; NARR-06's supersession recorded, not silently applied
- [ ] The morning brief is readable by a non-coder, lists only genuinely open items, and describes the real branch
- [ ] F7 and F11 were not touched by this plan
- [ ] `npm test` green and the engine diff empty at every commit
</success_criteria>

<output>
Eight commits on `claude/confident-bassi-7263ea`, plus:
- `.planning/quick/20260729-playtest-bug-fixes/COIN-AUDIT.md`
- `.planning/quick/20260729-playtest-bug-fixes/MORNING-PLAYTEST-BRIEF.md`

Report at the end: the commit list, any `KNOWN_DIVERGENT` entries added with their reasons, any fixture
re-pinned, and the full contents of the brief's "tell me yes or no" list.
</output>
