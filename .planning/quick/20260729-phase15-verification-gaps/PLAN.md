---
task: phase15-verification-gaps
type: quick
created: 2026-07-29
baseline_commit: 9ddd214
files_modified:
  - src/ui/util.js
  - src/ui/flow.js
  - src/ui/lobby.js
  - src/ui/panel.js
  - src/orchestrator.js
  - index.html
  - scripts/extract_narration_lines.js
  - scripts/narration_test.js
  - scripts/ui_contract_check.js
  - art-review/narration-inventory.json
  - package.json
autonomous: false
requirements: [NARR-01, NARR-05, NARR-06]
decisions: [D-16, D-17, D-25, D-26, D-29, D-50, D-52, D-53, D-54]

must_haves:
  truths:
    - "D-17: every trade/parley narration line renders its ingredient as custom art, never a raw system emoji"
    - "D-29: no player-facing string in src/ or index.html reads the pre-conversion 2nd-person pronouns"
    - "The narration coverage self-check exits 0 and art-review/narration-inventory.json matches the shipped tree"
    - "D-54: all 4 divergent approved second-party lines match 15-ADDRESSED2-APPROVED.json"
    - "D-52/D-25: orchestrator.js's two both-heads battle lines ship Wyatt's approved wording, icons included"
    - "GOVERNING: src/engine/index.js has an empty diff; 31/31 determinism fixtures verify"
  artifacts:
    - src/ui/util.js
    - src/orchestrator.js
    - index.html
    - scripts/extract_narration_lines.js
    - art-review/narration-inventory.json
  key_links:
    - "fmtItem() -> ilabelImg()/ING_IMG: the same asset the islands and captain's box already draw"
    - "extract_narration_lines.js -> npm test: the D-21/D-31/D-32/D-33 coverage guard becomes CI-enforced"
    - "ui_contract_check.js -> the D-29 register: a one-time sweep becomes a standing invariant"
---

<objective>
Close the five gaps `15-VERIFICATION.md` found in Phase 15. The phase is code-complete and all 14
`npm test` gates pass, but two binding decisions from Wyatt (D-17, D-29) were recorded in the phase
contract and then never planned or executed, the coverage self-check is red, and four approved
copy lines plus two icons were dropped.

Purpose: the game currently does not match what Wyatt approved. Under D-25 (`keep` = "ship exactly
what this card displays") that is a contract breach, not a cosmetic miss.

Output: 8 atomic commits + one blocking review gate. Every gap closed, every fix gated by an
automated check that runs in `npm test`, so the same class of regression cannot recur silently.
</objective>

<governing_constraints>
These hold for EVERY task. A task that violates one is wrong even if its own check passes.

1. **`src/engine/index.js` keeps an EMPTY diff.** Nothing may change what the engine records into
   the event stream — including adding a field to an existing event. That invalidates all 31
   determinism fixtures and forces a gated re-record (`docs/DETERMINISM-RERECORD.md`). All five
   gaps are presentation-tier; none needs an engine change. Assert per task:
   `git diff --stat 9ddd214..HEAD -- src/engine/index.js` → empty output.
2. **`npm test` stays green** (12 gates + the 31-seed determinism verify), exit 0.
3. **Layer purity.** `src/ui/` never imports `src/net/`; the engine stays DOM/Firebase-free.
   `scripts/module_graph_check.js` and `scripts/ui_contract_check.js` gate this.
4. **Vanilla JS, no framework, no build step.** Match surrounding code density. Annotate every
   decision inline in the established form: `// D-NN (Wyatt-approved 2026-07-29): ...`.
5. **D-16 is absolute.** Wyatt's notes are words only — the audit page's notes box could not carry
   inline icon markup. The absence of an icon from a note is NEVER an instruction to remove it.
   When applying reworded copy, re-attach the existing icon markup to the new wording. Shipping the
   plain-text note as the literal string is a defect.
</governing_constraints>

<resolved_ambiguities>
Two items the brief asked to be resolved rather than guessed. Both are settled; do not re-litigate.

## 1. The D-54 ad-hoc site discrepancy — RESOLVED

The verification report names `flow.js:971`; `15-ADDRESSED2-APPROVED.json` names
`adhoc:src/ui/flow.js:901` and `:902`. **They are the same sites under different line numbers.**
The approved-JSON card ids are frozen at audit-generation time; `src/ui/flow.js` has since shifted
by 70 lines. Confirmed against source three independent ways:

| Approved-JSON id | Current source line | Evidence |
|---|---|---|
| `adhoc:src/ui/flow.js:901` | **`src/ui/flow.js:971`** | `AD_HOC_META["src/ui/flow.js:971"]` = `label: "Side bet — backed with coin (D-08)"`; `narration-inventory.json`'s entry for line 971 carries `rawVariants` containing the exact `calls ye to win and bets ${amt}🌕!` literal |
| `adhoc:src/ui/flow.js:902` | **`src/ui/flow.js:972`** | `AD_HOC_META["src/ui/flow.js:972"]` = `label: "Side bet — free call (D-08)"`; inventory `rawVariants` carries `calls ye to win from the crow's nest.` |

**So the report's line number is the correct current one, and exactly ONE ad-hoc line diverges:**
`:971`. Its sibling `:972` already matches the approved text byte-for-byte and needs no change.

**Consequence for Task 1:** regenerating the inventory rewrites ad-hoc card ids to current line
numbers, so the frozen ids in `15-DISPOSITIONS-FINAL.json` / `15-ADDRESSED2-APPROVED.json` will not
numerically match afterwards. That is expected. **Never re-match an approved row to source by line
number — match by `AD_HOC_META` label and by the `rawNeutral`/`rawVariants` literal.**

## 2. `src/ui/recipe.js`'s cookbook prose — RECOMMEND LEAVING, flag for Wyatt

`src/ui/recipe.js:34,69,146` — *"Buttery, melt-in-your-mouth shortbread biscuits…"*, *"run your
thumb around the inside rim to help it rise evenly"*, *"A quick-set, melt-in-your-mouth chocolate
fudge…"*.

**Recommendation: do NOT convert.** These are recipe descriptions and cooking-method instructions.
They read as cookbook prose — the voice of a recipe card the player is holding, not the game's
narrator speaking to a captain. *"melt-in-yer-mouth shortbread"* reads as a typo, not as pirate
voice, and *"run yer thumb around the rim"* turns a baking instruction into dialogue. D-29 RESOLVED
widened scope to "all player-facing text" on the reasoning that *"the whole game speaks one
register"* — but the recipe card is arguably a diegetic object with its own register, which is a
copy judgment only Wyatt can make.

They are therefore EXCLUDED from Task 5 and from the standing gate (Task 8), and raised for his
ruling at the Task 9 checkpoint. If he says convert, it is a 3-line follow-up.

Two more items of the same class, also excluded and also raised at Task 9:
- **`index.html:743`** — the credits/acknowledgements paragraph (*"This game was made by Wyatt Roy,
  a designer and overly enthusiastic noodle…"*, containing *"how the wind should affect your
  movements"*). This is Wyatt's own authorial prose about real people, not the game addressing a
  player. **Recommend leaving.**
- **`index.html:650` and `:761`** — the anonymised-playtest-data notice and the feedback-form
  placeholder. These ARE converted in Task 6 (they are game chrome the player reads, and D-29
  RESOLVED is explicit about "convert everything"), but they are listed for confirmation because a
  privacy disclosure in pirate voice is a call worth showing him.
</resolved_ambiguities>

<context>
@.planning/phases/15-narration-audit-fixes/15-VERIFICATION.md
@.planning/phases/15-narration-audit-fixes/15-CONTEXT.md
@.planning/phases/15-narration-audit-fixes/15-ADDRESSED2-APPROVED.json
@.planning/phases/15-narration-audit-fixes/15-DISPOSITIONS-FINAL.json
@src/ui/util.js
@src/ui/flow.js
@src/orchestrator.js
@scripts/extract_narration_lines.js
@art-review/narration-audit.html
</context>

<ordering_rationale>
Cheapest and most certain first; the largest and riskiest (Gap 2) late.

**One hard ordering constraint, and it is not obvious:** Tasks 2-6 add `// D-NN (Wyatt-approved…)`
annotation comments to `src/ui/flow.js`, `src/ui/util.js` and `src/orchestrator.js`. Every added
line shifts the `flash()`/`onFlash()` call sites below it, and `AD_HOC_META` in
`scripts/extract_narration_lines.js` is keyed by **hardcoded line number** — which is precisely the
mechanism that produced Gap 3 in the first place (Phase 15's own final commit shifted
`src/ui/util.js` by 4 lines and turned the guard red).

Therefore:
- **Task 1** unbreaks the extractor now, so the guard is live and provably working before any copy
  change rides on it. It deliberately does NOT wire it into `npm test` yet.
- **Task 8** re-syncs `AD_HOC_META` after all line-shifting edits are done, regenerates the
  inventory, and only then wires the extractor into `npm test`.

Wiring it in earlier would make every intervening task's `npm test` run red for a reason that has
nothing to do with that task — the exact trap `scripts/ui_contract_check.js`'s own header warns
about ("weaken the check until it stops catching anything real").
</ordering_rationale>

<tasks>

<task type="tracer" id="1">
  <name>Task 1 (Gap 3): unbreak the narration coverage self-check and regenerate the inventory</name>
  <files>scripts/extract_narration_lines.js, art-review/narration-inventory.json</files>
  <precondition>`node scripts/extract_narration_lines.js` currently exits 1 with `FAIL: no AD_HOC_META entry for src/ui/util.js:918 (enclosing fn "narrateCurrent")`.</precondition>
  <action>
Two keys in `AD_HOC_META` (`scripts/extract_narration_lines.js:228-253`) are stale by 4 lines,
drifted by commit 9ddd214. **Both must move together — this is the trap.**

Current table state vs. the actual current call sites in `src/ui/util.js`'s `narrateCurrent()`:

| Table key | Its label | Real current line of that site |
|---|---|---|
| `"src/ui/util.js:910"` | `"Bot turn-start banner (D-07)"` | **914** (the `if(e.t==="turn")` onFlash) |
| `"src/ui/util.js:914"` | `"Bot event narration — table pass-through, not new copy"` | **918** (the `const L=…onFlash(L.txt)` line) |

Rename `:910` → `:914` and `:914` → `:918`, each keeping its own existing label/group/tag verbatim.

**Why simply adding a `:918` entry is wrong:** `applyMeta()` only fails on a MISSING key, never on
an unused one. The stale `:914` key now silently matches the turn-banner site and would attach the
"table pass-through, not new copy" label to it — mislabelling the one genuine ad-hoc line in
`util.js` as a pass-through — while `:910` sits orphaned and unnoticed. The extractor would go
green while the inventory it writes is wrong.

Then regenerate: `node scripts/extract_narration_lines.js` writes
`art-review/narration-inventory.json`.

Do **not** add the extractor to `npm test` in this task — see the Ordering Rationale section. Do not
restructure `AD_HOC_META`'s keying scheme here either; that recommendation is recorded in Task 8.
  </action>
  <verify>
    <automated>
# 1. the guard runs green and the inventory is byte-stable across two consecutive runs
node scripts/extract_narration_lines.js
cp art-review/narration-inventory.json /tmp/inv1.json
node scripts/extract_narration_lines.js
diff -q /tmp/inv1.json art-review/narration-inventory.json

# 2. BOTH util.js keys moved, and each kept its own label (catches the add-918-only mistake)
node -e '
const j=require("./art-review/narration-inventory.json");
const u=j.adhoc.filter(x=>x.file==="src/ui/util.js");
if(u.length!==2) throw new Error("expected 2 util.js ad-hoc sites, got "+u.length);
const byLine=Object.fromEntries(u.map(x=>[x.line,x.label]));
if(!/turn-start banner/.test(byLine[914]||"")) throw new Error("914 must be the turn-start banner, got: "+byLine[914]);
if(!/pass-through/.test(byLine[918]||"")) throw new Error("918 must be the table pass-through, got: "+byLine[918]);
console.log("PASS: AD_HOC_META util.js keys correct — 914=banner, 918=pass-through");
'

# 3. governing constraints
git diff --stat 9ddd214..HEAD -- src/engine/index.js   # must print nothing
npm test
    </automated>
  </verify>
  <done>
`node scripts/extract_narration_lines.js` exits 0. `art-review/narration-inventory.json` is
regenerated and byte-identical across two consecutive runs. The inventory's two `src/ui/util.js`
ad-hoc entries are at lines 914 and 918 with their correct respective labels. `npm test` green;
`src/engine/index.js` diff empty.
  </done>
  <commit>fix(gap-3): re-sync AD_HOC_META to narrateCurrent's shifted onFlash sites, regenerate inventory</commit>
</task>

<task type="auto" id="2">
  <name>Task 2 (Gap 5): restore the ⚪️ icons and the word "firing" Wyatt typed into his D-52 rewrite</name>
  <files>src/orchestrator.js</files>
  <action>
D-52's structural merge landed correctly (six branches → four), but two of the four surviving lines
dropped copy Wyatt explicitly typed. Source of truth: `15-DISPOSITIONS-FINAL.json`, rows
`misc:battleLine:src/orchestrator.js:482` and `:484` (both `tag: "rewrite"`, `reviewed: true`).

`src/orchestrator.js:489` — currently:
`<span class="score">Both fire HEADS — but ${dwName}'s downwind and the shot hits!</span>`
His approved `notes`: `Both fire ⚪️ HEADS — but Crustbeard's firing downwind and the shot hits!`
→ insert `⚪️ ` before `HEADS`, and `firing ` before `downwind`. (`Crustbeard` is the sample name the
audit page substituted for the `${dwName}` slot — keep the template expression.)

`src/orchestrator.js:490` — currently:
`<span class="cancel">Both fire HEADS — but in the crosswind, the cannonballs collide with no hit.</span>`
His approved `notes` (`:484`): `Both fire ⚪️ HEADS — but in the crosswind, the cannonballs collide with no hit.`
→ insert `⚪️ ` before `HEADS`. Nothing else changes.

Copy the `⚪️` character sequence verbatim from the disposition JSON — it carries a U+FE0F variation
selector. That is correct and matches the established sibling: line 497 already ships `⚫️ TAILS`,
and `emojify()` (`src/shared/index.js:108`) strips the selector before its `EMOJI_IMG` lookup
(`m.replace(/️$/,"")`), where `"⚪"` → `FLIP_HEADS_IMG`. The battle footer reaches `emojify()` via
`renderBattle` → `panel()` (`src/ui/panel.js:188`), so these render as custom coin art, per D-16.

Leave lines 496 (`${hitName} lands a hit!`) and 497 (`Both miss — ⚫️ TAILS all round.`) alone —
both already match his approved `:486`/`:488` notes exactly.

**Do NOT expand scope here.** Rows `:482` and `:486` also carry `addressedNotes` (*"but yer firing
downwind and the shot hits!"* / *"Ye land a hit!"*) which are unapplied. `rmsg` is a single string
embedded in the battle scoreboard by `renderBattle` (`src/orchestrator.js:503` → `panel()`), a
surface with **no per-seat variant mechanism** — unlike `flash()`, it takes no `variants` argument.
Delivering those would mean new plumbing, which the verification report did not scope as a gap. It
is raised for Wyatt at Task 9 instead.
  </action>
  <verify>
    <automated>
# both approved literals present, in template form
grep -Fq "Both fire ⚪️ HEADS — but \${dwName}'s firing downwind and the shot hits!" src/orchestrator.js
grep -Fq "Both fire ⚪️ HEADS — but in the crosswind, the cannonballs collide with no hit." src/orchestrator.js

# no both-heads line is left without the coin icon (region-scoped to the round-result block)
sed -n '478,499p' src/orchestrator.js | grep -n "Both fire" | grep -v "⚪️" && \
  { echo "FAIL: a 'Both fire' line is missing its ⚪️"; exit 1; } || echo "PASS: every 'Both fire' line carries ⚪️"

# the icon resolves to custom art rather than shipping as a raw glyph
node -e 'import("./src/shared/index.js").then(m=>{const out=m.emojify("Both fire ⚪️ HEADS");if(!/flip-heads|FLIP_HEADS|heads/i.test(out))throw new Error("⚪️ did not emojify to the heads art: "+out);console.log("PASS: ⚪️ -> custom art via EMOJI_IMG");});'

git diff --stat 9ddd214..HEAD -- src/engine/index.js   # must print nothing
npm test
    </automated>
  </verify>
  <done>
Both `Both fire` lines carry `⚪️` and line 489 reads `'s firing downwind`. `emojify()` resolves the
glyph to `FLIP_HEADS_IMG`. `npm test` green; engine diff empty.
  </done>
  <commit>fix(gap-5): restore the ⚪️ icons and "firing" from Wyatt's approved D-52 battle rewrites</commit>
</task>

<task type="auto" id="3" tdd="true">
  <name>Task 3 (Gap 4): apply the 4 divergent approved second-party lines (D-54)</name>
  <files>src/ui/flow.js, src/ui/util.js, scripts/narration_test.js</files>
  <read_first>.planning/phases/15-narration-audit-fixes/15-ADDRESSED2-APPROVED.json</read_first>
  <action>
`15-ADDRESSED2-APPROVED.json` was committed (7db54cf) as "the source of truth for the fix" but only
1 of its 11 rows was applied. 7 coincidentally match what shipped. **4 genuinely diverge.** Apply
all four. Site mapping is settled in the Resolved Ambiguities section — do not re-derive it from line
numbers.

Token translation per D-50: `{coin}` → `🌕`; `{ingredient}`/`{wheat}`/`{sugar}` → `ilabelImg(key)`
(here the event already carries the rendered form). Per D-53, `--` → `—` (em dash) but a `–` between
digits is a battle score and stays. Per D-50, trim stray leading/trailing whitespace. Per D-16,
re-attach the existing icon markup — never ship the plain-text note as the literal string.

### 3a. `adhoc:src/ui/flow.js:901` → `src/ui/flow.js:971`, the `calledIdx` variant

Currently: `` {seat:calledIdx,html:`💰 ${pn(s.idx)} calls ye to win and bets ${amt}🌕!`} ``
Approved: `Dough Hook calls ye to win and bets 2{coin} on it!`
→ append ` on it` before the `!`: `` `💰 ${pn(s.idx)} calls ye to win and bets ${amt}🌕 on it!` ``

Keep the leading `💰` (D-16: his note could not carry it). Leave the sibling `:972` free-call line
untouched — it already matches its approved row byte-for-byte.

### 3b-3d. The three `table:battle` rows in `src/ui/util.js`'s `battle` builder (~:497-508)

His three approved lines are all the **loser's own view**, and all three restructure the sentence:

| Row | Approved text |
|---|---|
| `table:battle` | `Crustbeard wins 2–1 — ye bribe yer way out of givin' away a crate with 5{coin}.` |
| `table:battle~cleaned` | `Crustbeard wins 2–1 — ye give up all ye have: 2{coin}.` |
| `table:battle~crate` | `Crustbeard wins 2–1 and takes yer {ingredient}` |

Shipped today composes `` `${mainClause} ${spoilClause}` ``, which for a loser-addressed viewer
yields *"⚔️ Davy Scones — ye lose 2–1. Ye bribe yer way out of giving away a crate with 5 coins."*
Three differences from what he approved, all deliberate on his part:
1. The **winner** is named, not the loser — `{winner} wins {aP}–{dP}`, not `{loser} — ye lose`.
2. The clauses join with ` — ` (or ` and`), not `. ` — one sentence, not two.
3. Wording: `givin'` (elided), `takes yer {ingredient}` (possessive), and the crate line carries
   **no trailing period**. Apply all three verbatim per D-25.

**Implement as a loser-addressed composite branch, leaving the other two viewers alone.** When
`viewerIsLoser` is true, emit the approved single-sentence form; otherwise keep today's
`mainClause`/`spoilClause` composition unchanged for the winner-addressed and neutral renderings.
Re-attach the leading `⚔️` (D-16). `{ingredient}` is `e.spoil`, which every real emit site already
sets to `ilabelImg(pick)` (`src/engine/index.js:572-573`, `src/orchestrator.js:546`) — so
`takes yer ${e.spoil}` produces the custom art, and the D-51 `null`-spoil case cannot arise from a
real event.

Keep the existing `spoilN`/`isBribe` guard exactly as it is: a non-numeric or absent spoil must
still fall through to the cleaned-out framing rather than rendering `NaN`.

### Then pin all four in `scripts/narration_test.js`

That file is already in `npm test`. Add assertions rendering `describeFor(fabricatedEvent, loserSeat)`
for the three spoil shapes (bribe / cleaned-out / crate) and byte-comparing against the approved
strings with the harness's sample names substituted, plus one asserting the side-bet variant ends
`bets 2🌕 on it!`. Existing invariants must keep passing: the block at `scripts/narration_test.js:437`
asserts each two-party event's seat-A and seat-B renderings differ from the viewer-neutral one
(`bakeoff` is the one recorded exception) — the new loser form still differs from neutral, so that
holds.
  </action>
  <behavior>
    - Loser's view, bribe (spoil `"5 coins"`, no `spoilIng`): `⚔️ {winner} wins 2–1 — ye bribe yer way out of givin' away a crate with 5🌕.`
    - Loser's view, cleaned out (spoil `"2 coins"`, no `spoilIng`): `⚔️ {winner} wins 2–1 — ye give up all ye have: 2🌕.`
    - Loser's view, crate (`spoilIng` set, `spoil` = `ilabelImg(ing)`): `⚔️ {winner} wins 2–1 and takes yer 🍫 Cacao Pods` — no trailing period
    - Winner's view: unchanged from today (`⚔️ {winner} — ye win 2–1. Ye take …`)
    - Neutral viewer: unchanged from today
    - Non-numeric/absent spoil: still falls through to the cleaned-out framing, never `NaN`
    - Side bet, called captain's view: `…calls ye to win and bets {amt}🌕 on it!`
  </behavior>
  <verify>
    <automated>
# the four approved literals are present in source
grep -Fq 'bets ${amt}🌕 on it!' src/ui/flow.js
grep -Fq "givin' away a crate with" src/ui/util.js
grep -Fq 'takes yer ${e.spoil}' src/ui/util.js

# the superseded loser-addressed wording is gone (region-scoped to the battle builder)
sed -n '470,515p' src/ui/util.js | grep -F 'giving away a crate' && \
  { echo "FAIL: the pre-D-54 'giving' spelling survives in the loser branch"; exit 1; } || true

# the pinned renderings (these assertions live in narration_test.js, run here via npm test)
node scripts/narration_test.js

git diff --stat 9ddd214..HEAD -- src/engine/index.js   # must print nothing
npm test
    </automated>
  </verify>
  <done>
All four divergent rows match `15-ADDRESSED2-APPROVED.json`. The winner-addressed and neutral battle
renderings are byte-unchanged. Four new assertions in `scripts/narration_test.js` pin the result and
run inside `npm test`. Engine diff empty.
  </done>
  <commit>fix(gap-4): apply Wyatt's 4 divergent approved second-party lines (D-54)</commit>
</task>

<task type="auto" id="4" tdd="true">
  <name>Task 4 (Gap 1, blocker): D-17 — render ingredients in fmtItem() with the custom art</name>
  <files>src/ui/util.js, scripts/narration_test.js</files>
  <action>
`fmtItem()` (`src/ui/util.js:211`) is byte-for-byte unchanged since before Phase 15 and still emits
`ING_EMOJI[x]`. None of the 7 in-play ingredient emoji (🌾🥛🍬🥚🍫🌶️🌼) are keys in `EMOJI_IMG`
(`src/shared/index.js`), so `emojify()` cannot rescue them — they reach the screen as raw system
emoji sitting next to custom coin art, which is exactly the inconsistency Wyatt reported.

D-17's fix, specified down to the markup: render ingredients through the same custom art
`ilabelImg()` uses, keeping the existing coin handling. `ilabelImg` and `ING_IMG` are **already
imported and used 8× each** in `src/ui/util.js` — no import change needed.

    export function fmtItem(x){return /coin/.test(x)?x.replace(" coins","🌕").replace("coins","🌕"):(ING_IMG[x]?ilabelImg(x):(ING_EMOJI[x]||"")+" "+iname(x));}

**Three traps, all load-bearing:**

1. **The coin branch must stay FIRST and unchanged.** `x` is not always an ingredient key. From
   `src/ui/flow.js:490`, `offerLabel` composes a *display* string — `"Toasty Wheat + 2 coins"` — and
   the engine emits `price+" coins"`. Both contain `coin`, so the existing branch already handles
   them, and reordering would break them.
2. **The `ING_IMG[x] ?` guard is not defensive padding — it is required.** The else-branch input is
   also not always a key: `offerLabel` with an ingredient and zero coins yields the display name
   (`"Toasty Wheat"`), and `"nothing"` is emitted at `src/ui/flow.js:546`/`:555`/`:569`. Without the
   guard those would emit `<img src="undefined">`. With it they fall through to today's exact
   output, byte-for-byte.
3. **Do NOT bulk-replace emoji in source.** D-17 is explicit: the ~145 raw emoji in narration source
   are deliberate shorthand, `emojify()` already converts them at two chokepoints, and that
   shorthand is load-bearing. The defect is *only* `fmtItem`'s ingredient branch.

**Recorded, no action needed:** `fmtItem` is also called in the `trade` builder's `caps:` array
(`src/ui/util.js:444`). `caps` is read only by `captions()` (`:666`), which has **no caller anywhere
in `src/` or `index.html`** — verified by grep. That path is inert today, so the `<img>` markup there
renders nowhere. Do not restructure it; just do not be surprised by it.

Then pin the behaviour in `scripts/narration_test.js` (already in `npm test`), covering both the fix
and all three traps, plus D-17's own stated verification that the inline `src` equals the
island/captain's-box `src` for the same ingredient.
  </action>
  <behavior>
    - `fmtItem("wheat")` === `ilabelImg("wheat")` — an `<img class="narrIcon" src="assets/ingredients/wheat.png">` followed by the display name
    - `fmtItem("wheat")` contains no `🌾`
    - `fmtItem("2 coins")` === `"2🌕"` (unchanged)
    - `fmtItem("Toasty Wheat + 2 coins")` === `"Toasty Wheat + 2🌕"` (unchanged — composite display label)
    - `fmtItem("nothing")` === its pre-change output (unchanged — no `<img src="undefined">`)
    - A rendered `trade` event's text contains two `narrIcon` images and zero raw ingredient emoji
    - The emitted `src` for an ingredient equals `ING_IMG[key]` — the same file the islands and the captain's box draw
  </behavior>
  <verify>
    <automated>
# the guarded fix is in place and the coin branch still leads
grep -Fq 'ING_IMG[x]?ilabelImg(x)' src/ui/util.js
grep -Fq '/coin/.test(x)?' src/ui/util.js

# behaviour pins (these assertions live in narration_test.js)
node scripts/narration_test.js

# no rendered trade/parley narration emits a raw in-play ingredient emoji
node -e '
Promise.all([import("./src/ui/util.js"),import("./src/shared/index.js")]).then(([u,s])=>{
  const out=u.fmtItem("wheat");
  if(out!==s.ilabelImg("wheat")) throw new Error("fmtItem != ilabelImg for wheat: "+out);
  if(/[🌾🥛🍬🥚🍫🌶🌼]/.test(out)) throw new Error("raw ingredient emoji survived: "+out);
  if(!out.includes(s.ING_IMG.wheat)) throw new Error("src is not ING_IMG.wheat: "+out);
  if(u.fmtItem("2 coins")!=="2🌕") throw new Error("coin branch regressed");
  if(u.fmtItem("Toasty Wheat + 2 coins")!=="Toasty Wheat + 2🌕") throw new Error("composite label regressed");
  if(/undefined/.test(u.fmtItem("nothing"))) throw new Error("unguarded ING_IMG lookup on a non-key");
  console.log("PASS: D-17 — custom art for ingredients, coin + non-key paths intact");
});'

git diff --stat 9ddd214..HEAD -- src/engine/index.js   # must print nothing
npm test
    </automated>
    <human-check>Visual confirmation is folded into the already-scheduled two-tab playtest (P8 in 15-VERIFICATION.md, which now flips from expected-FAIL to expected-PASS): complete a trade and read the narration line — the ingredient must render as the same custom art the island shows, beside the custom coin art.</human-check>
  </verify>
  <done>
`fmtItem()` emits `ilabelImg(x)` for real ingredient keys and is byte-unchanged for coin strings,
composite display labels, and `"nothing"`. Trade/parley narration renders zero raw ingredient emoji.
New assertions in `scripts/narration_test.js`. Engine diff empty; `npm test` green.
  </done>
  <commit>fix(gap-1): D-17 — fmtItem() renders ingredients with the custom art, not system emoji</commit>
</task>

<!-- planner-discipline-allow: you, your, you're, You, Your -->
<!-- The D-29 substitution table cannot be specified without naming the pre-conversion pronouns.
     Tasks 5-7's gates exclude comment lines by construction, and each task carries an explicit
     instruction that annotation comments must not contain these words as standalone tokens. -->

<task type="auto" id="5">
  <name>Task 5 (Gap 2a, blocker): D-29 — convert the 15 remaining second-person strings in src/</name>
  <files>src/orchestrator.js, src/ui/flow.js, src/ui/util.js, src/ui/lobby.js, src/ui/panel.js</files>
  <read_first>art-review/narration-audit.html:636-644</read_first>
  <action>
D-29 was applied only halfway. 14 live player-facing strings still read the pre-conversion pronouns,
plus one dead fallback (below) — 15 lines total, enumerated by this task's own gate command below.

**Why this is also a D-25 contract breach, not just a scope miss.** The audit page applies its own
`pirateVoice()` **LIVE at render**, at the `msgBox` chokepoint every card passes through. So a card
Wyatt tagged `keep` with empty notes *displayed* the converted text — and under D-25 (`keep` = "ship
exactly what this card displays") that converted text is what he approved. 15-06 applied only rows
carrying explicit replacement copy and treated `keep` + empty notes as "no source change". At least 6
of the 14 sites are confirmed `keep`-tagged, reviewed cards. The game does not match what he signed
off on.

### Reuse the audit page's own conversion — decision, stated

The conversion is `PIRATE_RE` / `PIRATE_MAP` / `pirateVoice()` at
`art-review/narration-audit.html:636-644`:

    const PIRATE_RE = /\b(yourself|you're|yours|your|you)\b/gi;
    const PIRATE_MAP = { yourself:"yerself", "you're":"yer", yours:"yers", your:"yer", you:"ye" };

**Decision: neither extract it to a shared module nor mirror it into `src/`. Use it as the
*specification* and as the *verifier*, and ship plain literals.**

Rationale — this is a one-time source transformation, not runtime behaviour. Exporting a
`pirateVoice()` from `src/shared/index.js` that nothing calls at runtime would ship dead code into
the shipped bundle, which is precisely what D-33/D-34/D-40 spent three decisions stamping out. So:
edit the 15 literals in place, then **prove** each shipped literal equals
`pirateVoice(<the same literal at baseline 9ddd214>)` by running the page's exact regex over the
pre-change git blob. That is a stronger check than a hand review — it proves shipped == approved
rather than merely "looks converted" — and it leaves no new runtime surface, no layer violation, and
nothing for a future audit to trip over.

### The substitution table (D-29 RESOLVED), word-boundary matched, case-preserving

| From | To |
|---|---|
| `you` / `You` | `ye` / `Ye` |
| `your` / `Your` | `yer` / `Yer` |
| `you're` / `You're` | `yer` / `Yer` |
| `yours` / `yourself` (if any appear) | `yers` / `yerself` |

Longest-alternative-first ordering is mandatory — `you're` and `your` must match before bare `you`,
the same technique `EMOJIFY_RE` already uses for multi-codepoint emoji.

### MANDATORY hazards

- **Never a bare substring replace.** `layout` contains the bare pronoun and would become `layet`.
  `layoutWide`, `youIdx`, `stillDockedYou`, `bonusYou`, `outcomeYou` are all in the tree. `\b`
  rejects every one of them. The gate re-proves `layout` intact afterwards.
- **Scope is string literals only** — never identifiers, never comments, never CSS/variable names,
  never the audit page's own UI chrome. `src/ui/util.js:449-453` uses `you` as a **local variable
  name** in the `sidebet` builder; leave it alone.
- **Your own annotation comments must not contain these words as standalone tokens.** Write
  "the 2nd-person pronouns" or "D-29's register" instead. A trailing `// …your…` comment on a
  converted line would re-trip the gate, since the gate only filters *leading*-comment lines.
- **`src/engine/index.js` is untouchable** — its two occurrences (`:244`, `:263`) are comments and
  the file must keep an empty diff.

### Two allowlisted comment lines that must NOT change

`src/orchestrator.js:602` (a `/* */` block continuation mentioning `ONLINE_SETUP.md`) and
`src/ui/flow.js:155` (a trailing `// entering the trade winds ends your move`). Both are comments;
D-29 excludes comments. The gate excludes them by content anchor.

### `src/ui/flow.js:125` — the dead `fishCast` fallback: CONVERT, and here is why

D-33 confirmed it is unreachable (both callers pass a label; the bot path never reaches the `ask()`).
The verification report says "convert or leave, but record which". **Convert it.** Leaving it would
force a permanent per-site exception into the standing gate in Task 7, and a future register sweep
would flag it again as a miss. Converting costs nothing, changes no rendered text, and keeps the gate
a clean zero. It stays marked as unreachable on the audit page — this does not resurrect it as
editable copy.

### One layout-width note, so nobody "fixes" it

`index.html:377` is a CSS comment reserving panel width for the widest label, quoting
`src/ui/panel.js:157`'s shot-clock sub-caption. After conversion that label is one character
*shorter*, so there is no overflow risk. The comment is a comment: leave it exactly as it is.
  </action>
  <verify>
    <automated>
# --- GATE (verified against the current tree: 15 hits now, must be 0 after) ---
# Excludes: src/engine (untouchable, comments only), src/ui/recipe.js (deferred to Wyatt, Task 9),
# leading-comment lines, the `you` local variable in the sidebet builder, and the 2 anchored
# comment lines at src/orchestrator.js:602 and src/ui/flow.js:155.
RESIDUAL=$(grep -rnE "\b(You|you|Your|your|Yours|yours|Yourself|yourself)('re)?\b" src --include="*.js" \
 | grep -vE "^src/engine/" \
 | grep -v "src/ui/recipe.js" \
 | grep -vE ":[0-9]+: *(//|\*|/\*)" \
 | grep -vE "(const|let|var) you=|\(you\?|you\?\`|txt:you" \
 | grep -v "entering the trade winds" \
 | grep -v "ONLINE_SETUP.md")
echo "$RESIDUAL"
test -z "$RESIDUAL" || { echo "FAIL: unconverted player-facing strings remain"; exit 1; }
echo "PASS: D-29 residual count in src/ is 0"

# --- the layout landmine did NOT detonate ---
test "$(grep -rn 'layet' src index.html | wc -l | tr -d ' ')" = "0" || { echo "FAIL: layout corruption"; exit 1; }
test "$(grep -c 'layoutWide' index.html)" = "4" || { echo "FAIL: index.html layoutWide count changed"; exit 1; }
test "$(grep -c 'layoutWide' src/ui/board.js)" = "1" || { echo "FAIL: board.js layoutWide count changed"; exit 1; }
echo "PASS: layout / layoutWide intact"

# --- shipped == pirateVoice(approved): each converted literal matches the audit page's own regex ---
node -e '
const {execSync}=require("child_process");
const RE=/\b(yourself|you'"'"'re|yours|your|you)\b/gi;
const MAP={yourself:"yerself","you'"'"'re":"yer",yours:"yers",your:"yer",you:"ye"};
const pv=t=>t.replace(RE,m=>{const r=MAP[m.toLowerCase()];if(!r)return m;
  const up=m[0]!==m[0].toLowerCase()&&m[0]===m[0].toUpperCase();
  return up?r[0].toUpperCase()+r.slice(1):r;});
const SITES={"src/orchestrator.js":[471,545,554,654,968,1143],"src/ui/flow.js":[125,266,497,595,638,813],
             "src/ui/util.js":[91],"src/ui/lobby.js":[108],"src/ui/panel.js":[157]};
let bad=0;
for(const [f,lines] of Object.entries(SITES)){
  const base=execSync(`git show 9ddd214:${f}`,{encoding:"utf8",maxBuffer:1e8}).split("\n");
  const head=require("fs").readFileSync(f,"utf8").split("\n");
  for(const ln of lines){
    const want=pv(base[ln-1]);
    if(!head.some(h=>h.trim()===want.trim())){
      console.error(`MISMATCH ${f}:${ln}\n  expected: ${want.trim()}`); bad++;
    }
  }
}
if(bad) throw new Error(bad+" site(s) do not equal pirateVoice(baseline) — shipped text differs from what Wyatt approved");
console.log("PASS: all 15 converted literals equal pirateVoice(baseline 9ddd214)");
'

git diff --stat 9ddd214..HEAD -- src/engine/index.js   # must print nothing
npm test
    </automated>
  </verify>
  <done>
The residual gate returns 0 for `src/**.js`. Every one of the 15 converted literals is byte-equal to
`pirateVoice()` applied to its own baseline text, so shipped text matches what Wyatt approved on the
audit page. `layout`/`layoutWide` counts unchanged and no `layet` anywhere. `src/ui/util.js`'s `you`
local variable untouched. Engine diff empty; `npm test` green.
  </done>
  <commit>fix(gap-2): D-29 — convert the 15 remaining second-person strings in src/ to ye/yer</commit>
</task>

<task type="auto" id="6">
  <name>Task 6 (Gap 2b): D-29 — convert index.html's player-facing copy</name>
  <files>index.html</files>
  <action>
D-29 RESOLVED widened scope to **ALL** player-facing text: *"Action prompts, button labels, the
yellow action panel, modal copy, banners, intro/outro text — the whole game speaks one register."*
`index.html` carries the splash screen, the name-entry labels, the room-code screen, and the
how-to-play modal — the first text any player reads.

Same substitution table, same word-boundary rule, same hazards, same annotation-comment rule as
Task 5. Verified against the current tree: **17 lines to convert.**

### CONVERT (17 lines)

`633` splash byline · `634` and `665` the captain-name labels · `650` the anonymised-playtest-data
notice · `674` the pass-and-play seat placeholder · `695` the room-code caption · `713`, `716`, `717`,
`718`, `720`, `724`, `726`, `728`, `730`, `733` the how-to-play modal · `761` the feedback-form
placeholder.

**Also at line 633, apply D-53:** the byline contains a literal `--` (*"…to start a bakery -- but
…pantry is empty!"*). D-53 is explicit that `--` in player-facing copy becomes an **em dash `—`**
(the house style, 441 occurrences), never an en dash. Convert it in the same edit. Do not touch any
`–` sitting between digits.

### DO NOT CONVERT (excluded, and each for a stated reason)

- **`377` and `425`** — CSS comments. D-29 never touches comments. `377` additionally quotes the
  shot-clock label for a width reservation; see Task 5's note.
- **`743`** — the credits/acknowledgements paragraph. Wyatt's own authorial prose about real people
  (Luca, Amelia, Nick Lesko, Luis Zanforlin, his parents, Xavaar, Juju), not the game addressing a
  player. Converting it would put pirate voice in his personal thank-yous. **Recommendation: leave.**
  Raised for his ruling at Task 9 — do not decide it here.

Lines `650` and `761` ARE converted (D-29 RESOLVED is explicit), but both are flagged at Task 9 for
confirmation, since a data-collection disclosure and a form placeholder in pirate voice are worth
showing him rather than assuming.
  </action>
  <verify>
    <automated>
# --- GATE (verified against the current tree: 17 hits now, must be 0 after) ---
# -H is REQUIRED: without a filename prefix the comment-line filter cannot anchor and silently
# lets the two CSS comments through.
RESIDUAL=$(grep -HnE "\b(You|you|Your|your|Yours|yours|Yourself|yourself)('re)?\b" index.html \
 | grep -vE ":[0-9]+: *(/\*|\*|//)" \
 | grep -v "overly enthusiastic noodle")
echo "$RESIDUAL"
test -z "$RESIDUAL" || { echo "FAIL: unconverted player-facing copy remains in index.html"; exit 1; }
echo "PASS: D-29 residual count in index.html is 0"

# --- the 2 CSS comments and the credits paragraph are STILL THERE (proves the gate excluded, not deleted) ---
test "$(grep -c 'overly enthusiastic noodle' index.html)" = "1" || { echo "FAIL: credits paragraph altered"; exit 1; }
grep -q 'reserve room for the widest label' index.html || { echo "FAIL: CSS width comment altered"; exit 1; }

# --- D-53: no double hyphen left in player-facing copy ---
test "$(grep -cE ' -- ' index.html)" = "0" || { echo "FAIL: a '--' prose break survives"; exit 1; }
echo "PASS: D-53 em dash applied"

# --- layout landmine ---
test "$(grep -c 'layoutWide' index.html)" = "4" || { echo "FAIL: layoutWide count changed"; exit 1; }
test "$(grep -rn 'layet' index.html | wc -l | tr -d ' ')" = "0" || { echo "FAIL: layout corruption"; exit 1; }

npm test
    </automated>
    <human-check>Open the splash screen, the name-entry screen, the room-code screen and the how-to-play modal and read them end to end. The register must be consistent with the in-game narration, and no sentence should read as a typo.</human-check>
  </verify>
  <done>
The `index.html` residual gate returns 0. The two CSS comments and the credits paragraph are
byte-unchanged. Line 633's `--` is an em dash. `layoutWide` count still 4, no `layet`. `npm test`
green.
  </done>
  <commit>fix(gap-2): D-29 — convert index.html's player-facing copy to ye/yer, em dash per D-53</commit>
</task>

<task type="auto" id="7">
  <name>Task 7: make the D-29 register a standing invariant, not a one-time sweep</name>
  <files>scripts/ui_contract_check.js</files>
  <action>
Gap 2 exists because D-29 was a one-time manual sweep with nothing enforcing it afterwards. Half of
it silently did not happen and no gate noticed. Turn the residual check from Tasks 5 and 6 into a
permanent assertion so this class of regression cannot recur.

**Host: `scripts/ui_contract_check.js`** — already in `npm test`, already the "UI-layer rules" gate,
and its established structure is exactly right for this: shebang, a header naming what is gated and
why, one PASS/FAIL line per assertion, **every** assertion run before exit so one run reports every
problem, named failures with `file:line`, and self-exclusion of `scripts/`.

Add one assertion that runs the two residual pipelines from Tasks 5 and 6 (in JS, not shelled out)
and fails naming every offending `file:line`. Its exclusion list must be **explicit and commented**,
never a silent widening:

| Excluded | Reason |
|---|---|
| `src/engine/index.js` | comments only; the file must keep an empty diff (determinism corpus) |
| `src/ui/recipe.js` | cookbook prose, deferred to Wyatt (Task 9). Remove this exclusion the moment he rules. |
| leading-comment lines | D-29 excludes comments |
| the `you` local variable in `src/ui/util.js`'s `sidebet` builder | an identifier, not copy |
| `src/orchestrator.js`'s `ONLINE_SETUP.md` block comment | a comment |
| `src/ui/flow.js`'s "entering the trade winds" trailing comment | a comment |
| `index.html`'s 2 CSS comments and the credits paragraph | comments / authorial prose |

**Honour the file's `--drill` convention.** Its header records that each assertion was red-proof
drilled — demonstrably failed against a synthetic violation — before being wired in. Add a synthetic
fixture for this assertion under `drill()` and confirm it fails on it. An assertion that has never
been seen to fail is not a gate.

Also add the `layout` intactness probe (no `layet`; `layoutWide` counts stable) to the same
assertion, so the hazard that makes this conversion dangerous is permanently watched.
  </action>
  <verify>
    <automated>
node scripts/ui_contract_check.js            # all assertions PASS, exit 0
node scripts/ui_contract_check.js --drill    # the new assertion demonstrably FAILS on its synthetic fixture
npm test
    </automated>
  </verify>
  <done>
`scripts/ui_contract_check.js` carries a new register assertion with a commented, explicit exclusion
list, it is red-proof drilled via `--drill`, and `npm test` is green. Reintroducing an unconverted
player-facing pronoun now fails CI.
  </done>
  <commit>test: gate the D-29 pirate register in ui_contract_check.js so the sweep cannot silently regress</commit>
</task>

<task type="auto" id="8">
  <name>Task 8 (Gap 3b): re-sync AD_HOC_META after the copy edits and wire the extractor into npm test</name>
  <files>scripts/extract_narration_lines.js, art-review/narration-inventory.json, package.json</files>
  <precondition>Tasks 1-7 are committed. This task must run LAST — Tasks 2-6 add annotation comments to src/ui/flow.js, src/ui/util.js and src/orchestrator.js, and every added line shifts the flash()/onFlash() sites below it.</precondition>
  <action>
`AD_HOC_META` is keyed by hardcoded line number, so the annotation comments added by Tasks 2-6 will
have drifted it again. Re-sync it, regenerate the inventory, then wire the extractor into `npm test`.

1. Run `node scripts/extract_narration_lines.js`. For every `no AD_HOC_META entry for <file>:<line>`
   failure, move the affected key to its new line — **matching by the entry's own `label` and
   enclosing `fn`, never by proximity.** Task 1's trap applies verbatim: `applyMeta()` fails only on
   a MISSING key, so a stale key can silently attach the wrong label to a shifted site while an
   orphan sits unnoticed. After the resync, assert the table has exactly as many keys as there are
   discovered sites and that no key is orphaned.
2. Regenerate the inventory and confirm it is byte-identical across two consecutive runs.
3. Append `node scripts/extract_narration_lines.js` to the `test` script in `package.json`, after
   `narration_flow_test.js`. This is the answer to the verification report's "nothing caught it
   because `npm test` does not run it": the D-21/D-31/D-32/D-33 coverage guard becomes CI-enforced.

**Recorded recommendation — do NOT implement here.** The line-number keying is inherently
drift-prone; it has now broken twice. The extractor already contains the better pattern in its own
D-32 section, which curates by **exact anchor text** and verifies each anchor's presence at its
expected file, so "a future edit that moves or reword one of these lines without updating this table
fails loudly instead of silently going stale" (its own header, near line 632). Migrating
`AD_HOC_META` to that same anchor-text convention is the durable fix. It is a refactor of a
50-entry table with its own failure modes and does not belong in a gap-closure pass — file it as a
follow-up. Wiring the extractor into `npm test` now means the drift is at least *loud*, and the
failure message already names the file, line and enclosing function, so it is actionable noise
rather than mystery noise.
  </action>
  <verify>
    <automated>
# the guard is green, the inventory is byte-stable, and no AD_HOC_META key is orphaned
node scripts/extract_narration_lines.js
cp art-review/narration-inventory.json /tmp/inv_final.json
node scripts/extract_narration_lines.js
diff -q /tmp/inv_final.json art-review/narration-inventory.json

node -e '
const fs=require("fs");
const src=fs.readFileSync("scripts/extract_narration_lines.js","utf8");
const tbl=src.slice(src.indexOf("const AD_HOC_META"),src.indexOf("function applyMeta"));
const keys=[...tbl.matchAll(/"((?:src\/[^"]+):\d+)"\s*:/g)].map(m=>m[1]);
const inv=require("./art-review/narration-inventory.json");
const sites=inv.adhoc.map(x=>`${x.file}:${x.line}`);
const orphans=keys.filter(k=>!sites.includes(k));
if(orphans.length) throw new Error("orphaned AD_HOC_META key(s), stale after a line shift: "+orphans.join(", "));
if(keys.length!==sites.length) throw new Error(`key count ${keys.length} != site count ${sites.length}`);
const unlabeled=inv.adhoc.filter(x=>/see AD_HOC_META/.test(x.label));
if(unlabeled.length) throw new Error("site(s) fell back to the placeholder label: "+unlabeled.map(x=>x.file+":"+x.line).join(", "));
console.log(`PASS: ${keys.length} AD_HOC_META keys, 0 orphans, 0 placeholder labels`);
'

# the guard now runs inside npm test
node -e 'const t=require("./package.json").scripts.test;if(!/extract_narration_lines\.js/.test(t))throw new Error("extractor not wired into npm test");console.log("PASS: extractor is in the npm test chain");'

git diff --stat 9ddd214..HEAD -- src/engine/index.js   # must print nothing
npm test
    </automated>
  </verify>
  <done>
`AD_HOC_META` matches the post-edit tree with zero orphaned keys and zero placeholder labels. The
inventory is regenerated and byte-stable. `node scripts/extract_narration_lines.js` runs as part of
`npm test`, and `npm test` is green. The anchor-text migration is recorded as a follow-up, not done.
  </done>
  <commit>test(gap-3): re-sync AD_HOC_META and wire the narration coverage guard into npm test</commit>
</task>

<task type="checkpoint:human-verify" id="9" gate="blocking-human">
  <what-built>
All five verification gaps closed across 8 commits, each gated automatically:

| Gap | Fix | Gated by |
|---|---|---|
| 3 (blocker) | `AD_HOC_META` re-synced; coverage guard green; inventory regenerated; guard now in `npm test` | Tasks 1, 8 — automated |
| 5 (partial) | `⚪️` ×2 and "firing" restored at `src/orchestrator.js:489-490` | Task 2 — automated |
| 4 (partial) | the 4 divergent approved second-party lines applied | Task 3 — automated, pinned in `narration_test.js` |
| 1 (blocker) | D-17 — `fmtItem()` renders ingredients as custom art | Task 4 — automated + visual confirmation in the playtest |
| 2 (blocker) | D-29 — 15 strings in `src/` + 17 lines in `index.html` converted | Tasks 5, 6 — automated, now a standing gate (Task 7) |
  </what-built>
  <how-to-verify>
**Four copy rulings for Wyatt. Each is a recommendation, not a decision already taken.**

1. **`src/ui/recipe.js:34,69,146` — recipe descriptions and cooking method text.**
   *"Buttery, melt-in-your-mouth shortbread biscuits infused with warm cinnamon and rich cocoa."* ·
   *"run your thumb around the inside rim to help it rise evenly"* · *"A quick-set,
   melt-in-your-mouth chocolate fudge…"*
   **Recommendation: LEAVE.** These read as cookbook prose — the recipe card the captain is holding,
   not the game's narrator. *"melt-in-yer-mouth"* reads as a typo. If he says convert, it is a
   3-line follow-up plus removing one exclusion from Task 7's gate.

2. **`index.html:743` — the credits / acknowledgements paragraph.** His own authorial prose about
   real people. **Recommendation: LEAVE.**

3. **`index.html:650` (anonymised-playtest-data notice) and `:761` (feedback-form placeholder) —
   CONVERTED** per D-29 RESOLVED's "convert everything". Confirm he is happy with a data-collection
   disclosure and a form placeholder in pirate voice.

4. **`misc:battleLine:src/orchestrator.js:482` / `:486` `addressedNotes` are unapplied** — *"Both
   fire ⚪️ HEADS — but yer firing downwind and the shot hits!"* and *"Ye land a hit!"*. The battle
   scoreboard footer (`renderBattle` → `panel()`) is a single string with **no per-seat variant
   mechanism**, unlike `flash()`. Delivering these needs new plumbing; the verification report did
   not scope it as a gap. **Recommendation: defer** — decide whether it is worth a Phase 16 item.

**Then the two-tab playtest** (already scheduled; this task does not duplicate it). Two items on its
list change status because of this work:
- **P8 flips from expected-FAIL to expected-PASS.** Complete a trade and read the narration: the
  ingredient must render as the same custom art the island shows, beside the custom coin art.
- **P12 is now answerable.** Confirm the converted set is complete and rule on items 1-3 above.

Unchanged and still playtest-only, because no harness can reach them: **P1-P4** (guest fade, its
cancellation, and the host double-schedule risk) and **P5** (the four greyed options, one of them
from the guest seat).
  </how-to-verify>
  <resume-signal>Type "approved", or give a ruling on any of the four copy items.</resume-signal>
</task>

</tasks>

<verification>
Run at the end, after all 8 commits:

```
npm test                                              # 12 gates + extractor + 31-seed determinism, exit 0
node scripts/determinism_baseline.js --verify          # 31/31 seeds PASS
git diff --stat 9ddd214..HEAD -- src/engine/index.js   # EMPTY OUTPUT — the governing constraint
node scripts/module_graph_check.js                     # src/ui/ still never imports src/net/
node scripts/ui_contract_check.js                      # incl. the new standing register assertion
node scripts/extract_narration_lines.js                # coverage guard green, inventory byte-stable
```

Then re-run the two residual gates from Tasks 5 and 6 — both must return zero — and confirm
`grep -rn 'layet' src index.html` is empty with `layoutWide` at 4 (index.html) + 1 (board.js).
</verification>

<success_criteria>
- [ ] `node scripts/extract_narration_lines.js` exits 0 and runs inside `npm test`
- [ ] `art-review/narration-inventory.json` regenerates byte-identically twice, no orphaned `AD_HOC_META` keys, no placeholder labels
- [ ] `src/orchestrator.js:489-490` carry `⚪️` and line 489 reads `'s firing downwind`
- [ ] All 4 divergent rows match `15-ADDRESSED2-APPROVED.json`, pinned in `scripts/narration_test.js`
- [ ] `fmtItem()` emits `ilabelImg(x)` for real ingredient keys; coin strings, composite display labels and `"nothing"` byte-unchanged
- [ ] Trade/parley narration renders zero raw in-play ingredient emoji
- [ ] D-29 residual gate returns 0 for both `src/**.js` and `index.html`
- [ ] Every converted `src/` literal equals `pirateVoice(baseline 9ddd214)` — shipped == approved
- [ ] `layout`/`layoutWide` intact; no `layet` anywhere; `src/ui/util.js`'s `you` local variable untouched
- [ ] The register is a standing assertion in `ui_contract_check.js`, red-proof drilled via `--drill`
- [ ] `src/engine/index.js` diff empty across the whole task; 31/31 determinism seeds verify
- [ ] `npm test` green after every individual commit, not only at the end
- [ ] Wyatt has ruled on the four copy items at Task 9
</success_criteria>

<out_of_scope>
Explicitly NOT this task. Do not pull any of these in.

- Everything under `15-VERIFICATION.md`'s **DEFERRED TO PLAYTEST** section beyond the two items whose
  status this work changes (P8, P12) — the playtest is separately scheduled.
- The 6 items in `15-VERIFICATION.md`'s **Deferred Items** table: guest `sailCell` class and the
  host/guest render-parity test (Phase 16, D-55/D-56); narration un-blocking / the 27 awaited
  `flash()` sites (Phase 18, D-58 RESOLVED); the empty end-of-voyage narration box (Phase 16,
  UI-07); `BOT_STORM_STEP_MS` vs `STORM_STEP_MS` parity (Phase 18, D-23's "flagged, NOT
  auto-included"); removing the dead `asym`/raider battle branch (backlog, D-12a).
- Migrating `AD_HOC_META` to anchor-text keying — recorded as a follow-up in Task 8, deliberately not
  done here.
- `src/ui/flow.js:596`'s `"🎣 Fish (+1-2🌕)"` ASCII hyphen. Verification classified it ℹ️ Info: it is
  a *range* separator, outside D-38's minus rule. Leave it.
- Any change to `src/engine/index.js`, any new event, any new event field.
- Any new framework, dependency, or build step.
</out_of_scope>
