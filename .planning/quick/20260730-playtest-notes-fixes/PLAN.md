---
phase: quick-20260730-playtest-notes-fixes
plan: 01
type: execute
wave: 1
depends_on: []
autonomous: false
requirements: [NARR-06, G1, G2, G3, G4, G5, G6, G8, G9]
files_modified:
  - src/ui/util.js
  - src/ui/flow.js
  - src/ui/panel.js
  - src/ui/index.js
  - src/orchestrator.js
  - index.html
  - art-review/narration-core.js
  - art-review/narration-table-baseline.json
  - art-review/narration-inventory.json
  - scripts/narration_test.js
  - scripts/narration_flow_test.js
  - docs/DETERMINISM-RERECORD-NEXT.md
  - .planning/REQUIREMENTS.md
  - .planning/STATE.md
  - .planning/todos/pending/human-trade-counter-offer.md
  - .planning/todos/pending/flee-not-offered-when-broke.md

must_haves:
  truths:
    - "A dock line addressed to the reader says what happened to THEM, never where they are (G1)."
    - "A ship blown ONTO the Tortuga berth by a storm reads as a lucky break, not as having been parked there (G2)."
    - "Battle spoils show the coin icon, never the word `coins` (G3)."
    - "The intro reads as Wyatt wrote it, and the recipe prompt is one short line (G4)."
    - "Recipe selection happens immediately after the Ahoy intro, before the turn-order intro (G5)."
    - "No human decision can drive a captain's purse below zero, at any of the seven remaining at-risk debit sites (G6)."
    - "An outgoing narration line fades when — and only when — a new line replaces it; a trailing line still never fades (G8)."
    - "The next determinism re-record has a written, committed spec for making the engine's event contract data-only (G9)."
  artifacts:
    - "docs/DETERMINISM-RERECORD-NEXT.md"
    - ".planning/todos/pending/human-trade-counter-offer.md"
    - ".planning/todos/pending/flee-not-offered-when-broke.md"
  key_links:
    - "src/ui/util.js EVENT_NARRATION.dock gA -> scripts/narration_test.js pinned literals -> art-review/narration-table-baseline.json"
    - "src/ui/util.js EVENT_NARRATION.moored home branch -> art-review/narration-core.js VARIANTS.moored -> table baseline card count"
    - "the shared coin re-validation helper in src/ui/flow.js -> src/ui/index.js barrel -> src/orchestrator.js sites 13/14"
    - "src/ui/panel.js panel() ghost overlay -> index.html .apMsg.fadeOut CSS -> resizePanel height measurement"
---

<objective>
Nine changes from Wyatt's 2026-07-30 playtest notes and his answers to seven questions. Two urgent
correctness fixes (a mis-told storm rescue, and seven coin-debit paths that can drive a purse
negative), three copy/wording corrections, one flow reorder, one narration-timing refinement, one
requirements reword, and one queued engine-purity spec for the next determinism re-record.

Purpose: close the punch list from this morning's notes so the recorded two-player playthrough that
follows this work is testing the game Wyatt actually asked for.

Output: nine atomic, independently-committable commits, each green on `npm test`.
</objective>

<finding_ids>
Yesterday's playtest findings are `F1`–`F12` (`.planning/phases/15-narration-audit-fixes/15-PLAYTEST-NOTES.md`).
Today's continue the same one-letter convention and are referenced in source comments as `// G<n>
(Wyatt-approved 2026-07-30)`:

| ID | Finding |
|----|---------|
| G1 | Dock addressed lines drop the place — they say what happened to YOU, not where you are |
| G2 | Lucky-break bug: a ship blown onto the Tortuga dock reads as "still docked" |
| G3 | Battle spoils render the word `coins` instead of the coin icon |
| G4 | Three copy edits: intro banner, recipe prompt |
| G5 | Recipe selection moves earlier — straight after the Ahoy intro |
| G6 | Coin re-validation at every at-risk debit site (COIN-AUDIT.md option (b), narrowed) |
| G7 | NARR-06 reworded: hold length of non-prompt narration, not fade |
| G8 | A gentle fade of the outgoing line, triggered by the incoming line |
| G9 | Queued engine-purity spec for the next determinism re-record |

Out of scope, recorded not built: `OOS-1` (human-trade counter-offer → backlog), `OOS-2`
(flee-not-offered when broke → ruled NOT a bug).
</finding_ids>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/phases/15-narration-audit-fixes/15-PLAYTEST-NOTES.md
@.planning/quick/20260729-playtest-bug-fixes/COIN-AUDIT.md
@.planning/phases/15-narration-audit-fixes/15-CONTEXT.md
@docs/DETERMINISM-RERECORD.md
</context>

<hard_constraints>
These apply to EVERY task. A task that cannot be done without breaking one of these must STOP and
report, never work around it.

1. **`src/engine/index.js` must keep an empty diff for this whole plan.** 31 determinism fixtures
   depend on it. G3 and G9 are both shaped specifically around this: G3 fixes the display layer
   only, G9 writes a document rather than code. `git diff --stat src/engine/index.js` must print
   nothing at every commit.
2. **`npm test` green before every commit** (23 assertion groups + 16 gate scripts, exits 0).
   Baseline confirmed green at `9dd36c0` before planning.
3. **No build step, no CDN, no new dependencies.** `src/ui/` never imports `src/net/`
   (`scripts/module_graph_check.js` enforces this).
4. **Vanilla JS at the codebase's existing density.** Comment convention is `// D-NN` /
   `// <finding-id>` with a one-line rationale; cite `2026-07-30` and Wyatt's own words for anything
   he decided today.
5. **Never invent player-facing copy.** Where a fix needs a string, person-shift or reuse an
   existing approved one. If a site genuinely has no existing string to fall back on, STOP and
   report rather than writing one.
6. **When a gate goes red because a fix is correct, re-pin that fixture in the SAME commit with its
   reason stated in the fixture's own provenance field.** Never widen a pattern, never loosen an
   equality to a window, and never edit Wyatt's disposition files
   (`15-DISPOSITIONS-*.json`, `15-*-APPROVED.*`).
</hard_constraints>

<tasks>

<task type="auto">
  <name>T1: G4 — the intro banner and the recipe prompt, in Wyatt's words</name>
  <files>src/ui/flow.js, src/orchestrator.js, art-review/narration-inventory.json</files>
  <read_first>src/ui/flow.js:1007-1028 (showAhoyIntro), src/orchestrator.js:670-717 (recipeDraftNet)</read_first>
  <action>
Two string replacements, both verbatim from Wyatt's notes this morning.

(a) `src/ui/flow.js` `showAhoyIntro()`, the `msg` const currently at :1024. New text, exactly:
`⚓ Ahoy! Choose a recipe, gather each ingredient, then sail home first to win!`
The leading `⚓` is KEPT (D-16 — an icon goes only when its removal is stated in words, and he
stated no removal). This site carries a `// @copy misc.introbarrier.ahoy` marker at :1026; leave the
marker in place, it binds to the call not the literal.

(b) `src/orchestrator.js` `recipeDraftNet()`, the `msgFor` arrow currently at :684. New text,
exactly: `` `${pn(p.idx)}, choose yer recipe:` ``. This site is NOT an extracted copy site (verified:
`choose yer recipe` does not appear in `art-review/narration-inventory.json`, because the message
reaches `localAsk`/`remoteDraftPrompt` through a variable), so it needs no `@copy` marker and drifts
no baseline.

Apply D-53 (a `--` in his copy becomes an em dash `—`; neither of these two strings contains one, so
this is a no-op check, not an edit) and D-29 (`ye`/`yer`, already satisfied by both). Add a one-line
`// G4 (Wyatt-approved 2026-07-30)` comment at each site naming what changed and why — for (a),
that the sentence now tells the player the FIRST thing they will be asked to do.

Do not touch the button labels (`⚓ Arrgh!`, `🦜 Start`) — he named neither.
  </action>
  <verify>
    <automated>npm test 2>&amp;1 | tail -5 &amp;&amp; grep -c 'Choose a recipe, gather each ingredient' src/ui/flow.js &amp;&amp; grep -c 'choose yer recipe:' src/orchestrator.js &amp;&amp; test -z "$(git diff --stat src/engine/index.js)" &amp;&amp; echo ENGINE-CLEAN</automated>
  </verify>
  <done>
Both strings read exactly as quoted above. `npm test` exits 0 (23/23 assertion groups PASS).
`art-review/narration-inventory.json` is regenerated by the test run and committed alongside — it
records the Ahoy line's `rawMsg` and WILL change. `src/engine/index.js` diff is empty.
  </done>
</task>

<task type="auto">
  <name>T2: G7 + OOS-1 + OOS-2 — reword NARR-06, backlog the counter-offer, record the flee ruling</name>
  <files>.planning/REQUIREMENTS.md, .planning/todos/pending/human-trade-counter-offer.md, .planning/todos/pending/flee-not-offered-when-broke.md</files>
  <read_first>.planning/REQUIREMENTS.md:36-41 and :126-131, .planning/todos/pending/eov-narration-box-not-cleared.md (for the todo front-matter shape)</read_first>
  <action>
Documents only. No source changes.

(a) **G7 — reword NARR-06 and ONLY NARR-06** in `.planning/REQUIREMENTS.md:40`. Wyatt: *"When I
said '10% less time on screen' what I actually meant was to decrease the hold length of non-prompt
(blue box) narration text — how long those narrations stay up before the next one comes in."* So the
criterion is about HOLD LENGTH BETWEEN CONSECUTIVE LINES, not about fading. Write it in his terms:
non-prompt (blue-box) narration holds ~10% less time before the next line comes in. Keep the `[x]`
completed checkbox and the `| NARR-06 | Phase 15 | Complete |` row at :130 — the reword describes
what was actually built (`MSG_HOLD_MULTIPLIER = 0.72` in `src/ui/util.js:845`), it does not reopen
the requirement. Add a trailing parenthetical noting the reword date and that it is Wyatt's own
clarification: `(reworded 2026-07-30 at Wyatt's clarification — the criterion was always hold
length, never fade)`.

This is the ONLY line in `.planning/REQUIREMENTS.md` that may be edited by this plan. Every other
requirement, and the whole traceability table apart from nothing, stays byte-identical.

(b) **OOS-1 — backlog the human-trade counter-offer.** New file
`.planning/todos/pending/human-trade-counter-offer.md`, matching the front-matter shape of the two
existing pending todos (`id`, `title`, `status: pending`, `type: feature`, `severity: low`,
`area: gameplay`, `created: 2026-07-30`, `source: Phase 15 playtest notes (Wyatt, 2026-07-30)`,
`resolves_phase: null`, `regression: false`). Body records: a human receiving a trade offer gets
only Accept/Decline (`src/ui/flow.js:576-580`), while a bot that declines always counters
(`src/ui/flow.js:606-613`) — the asymmetry runs against the human. Wyatt's one-line rationale,
verbatim: *"let's put counter-offer feature onto the backlog."* State plainly that it is NOT being
built in this pass.

(c) **OOS-2 — record the flee ruling so a later pass does not "fix" it.** New file
`.planning/todos/pending/flee-not-offered-when-broke.md`, same front-matter shape but
`type: ruling`, `status: closed-not-a-bug`. Wyatt, verbatim: *"we don't need to keep reminding a
broke player that they're too broke to flee every time they flip double-tails."* Name the site the
ruling protects — `src/orchestrator.js:538`, where `def.coins>=1` silently suppresses the flee
prompt — so a future D-41-style dead-copy sweep reads this before "completing" it.
  </action>
  <verify>
    <automated>npm test 2>&amp;1 | tail -3 &amp;&amp; test -f .planning/todos/pending/human-trade-counter-offer.md &amp;&amp; test -f .planning/todos/pending/flee-not-offered-when-broke.md &amp;&amp; git diff --numstat .planning/REQUIREMENTS.md</automated>
  </verify>
  <done>
`git diff --numstat .planning/REQUIREMENTS.md` shows exactly one line changed. Both todo files exist
with valid front matter. `npm test` exits 0.
  </done>
</task>

<task type="auto">
  <name>T3: G2 — a storm that shoves ye onto the Tortuga berth is a lucky break, not "still docked"</name>
  <files>src/ui/util.js, art-review/narration-core.js, art-review/narration-table-baseline.json</files>
  <read_first>src/ui/util.js:340-390 (EVENT_NARRATION.moored), src/ui/util.js:261-292 (movedSinceTurnStart), .planning/phases/15-narration-audit-fixes/15-CONTEXT.md D-20 (:289) and D-28 (:525), art-review/narration-core.js:328-358 (mooredDockEvent + VARIANTS.moored)</read_first>
  <action>
**The bug, confirmed by Wyatt this morning:** *"Right got blown onto a (tortuga) dock in a storm, but
the narration said 'right is still docked' – instead of 'lucky break!'"*

**The cause, read in source:** the `moored` builder's branch table maps `home → stillDocked`
unconditionally (`src/ui/util.js:373`, and its addressed sibling at :385). The `dock` branch already
distinguishes moved-from-not via `movedSinceTurnStart(e)===true` (:370, :382); `home` does not. A
ship the storm pressed against the Tortuga berth takes the `home` reason and therefore reads as
though it had been parked there all along.

**The fix:** give `home` the SAME two-way split `dock` already has, reusing `dock`'s two existing
strings verbatim. Build each moved/unmoved pair ONCE and reference it from both keys, so the two
branches are structurally incapable of drifting apart:

- neutral: a single `dockShove` const holding today's `Lucky break! The gust shoves ${pn(e.p)}
  towards a dock, and the crew steadies her fast ⚓`, then
  `dock: movedSinceTurnStart(e)===true ? dockShove : stillDocked` and `home:` the same expression.
- addressed (`LA`): the same shape over a `dockShoveYou` const holding today's `Lucky break! The
  gust shoves ye towards a dock, ${pn(e.p)}, and yer crew steadies her fast ⚓`.

Hoist the `movedSinceTurnStart(e)` call to a single const above both tables — it walks the event
stream, and calling it four times per render is wasteful and makes the two tables look independent
when they must not be.

**No new player-facing copy is created.** Both strings already ship, both are Wyatt's own approved
rewrites (D-20/D-25/D-37), and D-37 explicitly keeps "shoves" here as a rescue rather than a move.

**D-28 is respected and must be stated in the comment:** `justDocked` / `home`-when-unmoved /
`dock`-when-unmoved still share ONE `stillDocked` string reached by three doors. This change splits
ONLY the moved case; the shared-string group is otherwise intact. Say that in the comment in those
terms so the next reader does not mistake it for a merge candidate.

**Then make the new branch visible in Wyatt's audit tool (D-21 — the page must render EVERY
branch).** In `art-review/narration-core.js`: generalise `mooredDockEvent(moved)` (:330) to take the
reason as well — e.g. `mooredMovedEvent(reason, moved)` — keeping the existing two `dockMoved`/
`dockStill` entries calling it with `"dock"`, and add ONE new entry to `VARIANTS.moored` (:352):
`{ tag: "homeMoved", label: "Reason: home berth (Tortuga) — storm shoved you onto it THIS turn",
buildEvent: () => mooredMovedEvent("home", true) }`, placed directly after the existing `home` entry
so the page groups the two home reasons together. Leave the existing `home` entry (:356) exactly as
it is — it fabricates no movement evidence, so it still renders `stillDocked`, which is correct.

**Re-pin `art-review/narration-table-baseline.json` in this same commit.** Its card count moves 50 →
51 (assertion 7 asserts count equality, so this is expected and must be re-pinned, not worked
around). Append a new paragraph to the existing `_provenance` string in the same voice as the F5/F10
re-pin already there: name G2, name the ONE card added (`table:moored~homeMoved`), state that no
existing card's text moved, and state that the added card renders two ALREADY-SHIPPED strings — this
is a new door onto approved copy, not new copy.

If `scripts/narration_audit_check.js` objects to `table:moored~homeMoved` as an unknown id (assertion
8's frozen-id resolution, or a `PAGE_ADDED`-style exception list), add the id to that list with its
reason. Do NOT widen any pattern or relax any equality to make it pass.
  </action>
  <verify>
    <automated>node scripts/bot_storm_narration_test.js &amp;&amp; node scripts/storm_moored_reason_test.js &amp;&amp; node scripts/narration_test.js &amp;&amp; npm test 2>&amp;1 | tail -8 &amp;&amp; test -z "$(git diff --stat src/engine/index.js)" &amp;&amp; echo ENGINE-CLEAN</automated>
  </verify>
  <done>
`moored` with `reason:"home"` and movement evidence in the event stream renders the lucky-break line;
with no movement evidence (and on a detached/fabricated event, where `movedSinceTurnStart` returns
`null`) it still renders `stillDocked`. `scripts/bot_storm_narration_test.js`'s "no position evidence
→ still docked" assertions stay green untouched. Table baseline pins 51 cards, provenance names G2.
`npm test` exits 0. Engine diff empty.
  </done>
</task>

<task type="auto">
  <name>T4: G1 — the addressed dock line says what happened to YOU, not where you are</name>
  <files>src/ui/util.js, scripts/narration_test.js, art-review/narration-table-baseline.json</files>
  <read_first>src/ui/util.js:443-488 (EVENT_NARRATION.dock, the F10 comment block and the g/gA tables), scripts/narration_test.js:745-820</read_first>
  <action>
**Wyatt, this morning, approving exactly this shape:** *"you already know that you docked at the
Flour Patch — we don't need to tell you that again."* and *"agree with your Q4 changes."*

Yesterday's F10 fix over-corrected: to give `bought`'s dangling "it" an antecedent it restored the
place clause too. The antecedent was the real defect; the place was never the fix. Replace the four
`gA` entries (`src/ui/util.js:475-478`) with:

- `ing`: `ye haul aboard ${goods}!` — **unchanged**, already correct
- `empty`: `ye find no ${ilabelImg(e.ing)}, so ye grab 3🌕`
- `bought`: `ye flip ⚫ TAILS, but buy ${goods} anyway for 3🌕`
- `coins`: `ye flip ⚫ TAILS and take 3🌕`

`bought` RETAINS the goods and names them directly in place of the pronoun — that IS F10's fix,
carried forward rather than reverted. `empty` returns to its shorter pre-F10 form at his explicit
ask. `coins` needs neither place nor goods.

**Do not touch the neutral `g` object (`:469-472`).** Spectators watching someone else's turn have no
other source for the place or the goods, so the third-person forms keep both. Preserve every icon
(D-16): `goods` still comes from the single shared `dockFlavorIcon()` value (F5's one-place-decides
rule) and `empty` still renders through `ilabelImg()`.

**Rewrite the comment block above the tables** (`:443-466`) so it states the rule rather than the
history that produced it. Encode, in these words: *the addressed line says what happened to YOU, not
where you are — the actor already read the place name on the Dock button and on the flip prompt.*
Keep D-46's record that `ing` alone drops the place among the NEUTRAL forms, keep D-48 (the flavour
text stays on every branch), and record that F10's dangling-pronoun defect is now fixed by naming the
goods rather than by restoring the place. Cite `// G1 (Wyatt-approved 2026-07-30)`.

**Re-pin the two fixtures this correctly reddens, in this same commit:**

(a) `scripts/narration_test.js` — the three exact-literal checks at :771-779 and the `ADDRESSED_SHAPE`
table at :794-799. Update each to the new form and update each check's description so it still names
what it is protecting: that the addressed line carries no place clause, and that `bought` still names
its goods so no pronoun is left without an antecedent. The `ing` literal at :781-783 and the whole
`DAIRY_NEUTRAL_BEFORE` / `NEUTRAL_SHAPE` neutral half stay byte-identical — if any neutral assertion
moves, the change has leaked into `g` and must be reverted.

(b) `art-review/narration-table-baseline.json` — four cards move (`table:dock`, `table:dock~empty`,
`table:dock~bought`, `table:dock~coins`), ADDRESSED VARIANTS ONLY, card count unchanged. Append a
G1 paragraph to `_provenance` stating that, and stating that it narrows what yesterday's F10 re-pin
widened, at Wyatt's word.
  </action>
  <verify>
    <automated>node scripts/narration_test.js &amp;&amp; npm test 2>&amp;1 | tail -8 &amp;&amp; node -e "const c=require('./art-review/narration-table-baseline.json').cards;for(const k of ['table:dock','table:dock~empty','table:dock~bought','table:dock~coins'])if(c[k].neutral.indexOf('docks at')<0)throw new Error(k+': the NEUTRAL line lost its place clause — the edit leaked into g');console.log('neutral dock half intact — all four still name their place');" &amp;&amp; test -z "$(git diff --stat src/engine/index.js)" &amp;&amp; echo ENGINE-CLEAN</automated>
  </verify>
  <done>
All four addressed dock branches render without a place clause; `bought` names its goods; the four
neutral branches are byte-identical to their pre-change selves. `narration_test.js` passes with
re-pinned literals whose descriptions name the new invariant. `npm test` exits 0. Engine diff empty.
  </done>
</task>

<task type="auto">
  <name>T5: G3 — battle spoils show the coin icon; the engine keeps an empty diff</name>
  <files>src/ui/util.js, art-review/narration-table-baseline.json, .planning/STATE.md</files>
  <read_first>src/ui/util.js:513-584 (EVENT_NARRATION.battle), src/ui/util.js:232-247 (fmtItem and its D-17 header), src/engine/index.js:560-575 (READ ONLY — do not edit), src/orchestrator.js:560-590 (asyncBattle's spoil generation)</read_first>
  <action>
**Wyatt:** *"'Gives up all they have: 2 coins' should be 'gives up all they have: 2🌕'"*, and on
being told it came from the engine: *"why does this need to touch the engine, but all our other
narration doesn't? that seems badly designed, or worth rechecking."* He is right — that anomaly is
real and is what T6 queues for the next re-record. This task fixes the DISPLAY, with no engine
change.

Introduce ONE `spoilText` const near the top of the `battle` builder and use it at every site that
currently interpolates `e.spoil` — the five `spoilClause` branches (:559-563), the three loser
composites (:576-578), and the winner caption (:582). Three cases, in this order:

1. **Crate win — render from the DATA field, ignore `e.spoil` entirely.** When `e.spoilIng` is set,
   `spoilText` is `ilabelImg(e.spoilIng)`. `spoilIng` already exists beside `spoil` as a proper data
   field, and `art-review/narration-core.js:267-278` already asserts the paired invariant
   `spoil === ilabelImg(spoilIng)` at every real emit site — so this renders byte-identically today
   while removing the crate half's dependence on pre-rendered engine text.
2. **Coin win — use the existing `fmtItem` convention, not a new regex.** `fmtItem`
   (`src/ui/util.js:247`) already does `.replace(" coins","🌕")` and is the single place that decides
   how a coin amount is spelled. Gate it on the spoil actually being a coin-word string
   (`/ coins/.test(e.spoil)`), then `fmtItem(e.spoil)`. This turns `"5 coins"` into `"5🌕"` and the
   engine-only `"2 coins (all they had)"` into `"2🌕 (all they had)"`.
3. **Anything else — pass through untouched.** This is load-bearing, not defensive padding: the
   raider spoil is `take+"c (raider)"` (`src/engine/index.js:568`), which contains no `"coin"`
   substring, so a blanket `fmtItem()` would fall through its `/coin/` test into the ingredient
   branch and render garbage. `asym` is hardcoded `false` in `roundCfg` and is set nowhere in the
   codebase, so that branch is config-dead — but a config-dead branch must not be silently broken.
   T6 queues its deletion.

**Keep `spoilN`/`isBribe` (:542-543) parsing the RAW `e.spoil`**, not `spoilText`. The bribe test is
"did the coin take reach the full 5" — a numeric question about the event, unrelated to how the
amount is spelled. Say so in a one-line comment so the next reader does not "tidy" the two together.

Every sentence, clause order and word stays exactly as it is. The only thing that changes is how the
spoil amount is spelled.

**Re-pin `art-review/narration-table-baseline.json`:** `table:dock`-style exact cards
`table:battle` (`5 coins` → `5🌕`) and `table:battle~cleaned` (`2 coins` → `2🌕`) move.
`table:battle~crate` must NOT move — if it does, case 1 is not rendering identically and the change
is wrong. Card count unchanged at 51 (T3 added one). Append a G3 paragraph to `_provenance` naming
those two cards and stating that the crate card is deliberately unmoved.

Leave each card's `label` field alone (`table:battle~cleaned`'s reads *"Coin spoil — cleaned out
(under 5 coins)"`*, and its sibling in `art-review/narration-core.js:383-389` likewise). Those are
audit-page card TITLES describing the branch to Wyatt — they are not shipped copy, they never reach a
player, and rewriting them would be a cosmetic change to his review tool dressed up as a fix.

**Record the design debt in `.planning/STATE.md`'s `### Blockers/Concerns` section** (around :137).
One bullet: the proper fix is the engine emitting `spoilCoins`/`spoilIng` as DATA with the UI
rendering it, which requires the gated re-record documented in `docs/DETERMINISM-RERECORD.md`; it is
specified in full in `docs/DETERMINISM-RERECORD-NEXT.md` (written by T6) and must ride along the next
time a re-record happens anyway, rather than being lost. Name this task's display-layer fix as the
INTERIM measure that becomes redundant at that point.
  </action>
  <verify>
    <automated>node scripts/narration_test.js &amp;&amp; node -e "const c=require('./art-review/narration-table-baseline.json').cards;const rendered=k=>[c[k].neutral].concat(c[k].variants.map(v=>v.text)).join('|');for(const k of ['table:battle','table:battle~cleaned'])if(/ coins/.test(rendered(k)))throw new Error(k+': a coin spoil still spells out the word for a coin amount');console.log('coin spoils render as icons — label fields deliberately excluded, they are card titles not shipped copy');" &amp;&amp; npm test 2>&amp;1 | tail -8 &amp;&amp; test -z "$(git diff --stat src/engine/index.js)" &amp;&amp; echo ENGINE-CLEAN</automated>
  </verify>
  <done>
No battle narration or caption spells the word for a coin amount. `table:battle~crate` is
byte-identical to its pre-change pin. The raider spoil string passes through unmodified.
`npm test` exits 0. `git diff --stat src/engine/index.js` prints nothing.
  </done>
</task>

<task type="auto">
  <name>T6: G9 — the queued engine-purity spec for the next determinism re-record</name>
  <files>docs/DETERMINISM-RERECORD-NEXT.md, .planning/STATE.md</files>
  <read_first>docs/DETERMINISM-RERECORD.md (all 436 lines — match its conventions, headings and voice), src/engine/index.js:1-15 and :440-460 and :555-580 (READ ONLY — do not edit)</read_first>
  <action>
**Wyatt:** *"please add the engine changes in for the next time we do a re-record, to make all
engine-based calls consistent and logical."* This is a DOCUMENT. `src/engine/index.js` is still not
edited by this plan — the entire point is that this work WAITS for a gated re-record.

`docs/DETERMINISM-RERECORD.md` is a closed Phase-14 historical record with no pending-changes
section, so this is a companion file rather than an extension: `docs/DETERMINISM-RERECORD-NEXT.md`.
Open it by stating that relationship in one sentence and cross-link both directions (add a single
pointer line at the top of `DETERMINISM-RERECORD.md` under its title). Match that file's conventions:
numbered `##` sections, exact `file:line` citations, plainly-stated costs, no hedging.

Content, all of it verified against source at `9dd36c0`:

**The principle.** Engine events carry DATA; the UI renders it. Across all 28 `this.ev({...})` sites
in `src/engine/index.js` the field inventory is `t`, `p`, `got`, `winner`, `a`, `heads`, `b`, `kind`,
`gave`, `d`, `windStreak`, `other`, `ing`, `dir` — every one of them data except `gave`, plus `spoil`
on the battle event. Two anomalies out of the whole contract. They are the exception, not the norm,
which is exactly why they read as badly designed.

**Violation 1 — `spoil` (`src/engine/index.js:566-574`)** carries rendered display text in every
branch: `"5 coins"` (:571), `take+" coins (all they had)"` (:574), `"2c (raider)"` (:568), and
`ilabelImg(i)` (:572, :573) which is literal HTML `<img>` markup. Replace with data: a numeric
`spoilCoins` for the coin cases. **`spoilIng` already exists** as a proper data field for the crate
cases, so the crate half needs NO new field at all — only the removal of `spoil`.

**Violation 2 — `gave` (`src/engine/index.js:455`)** is `price+" coins"` on the buy-kind trade event.
Replace with a numeric price field.

**Violation 3, the structural one — the `ilabelImg` import (`src/engine/index.js:8`)** goes with
them. A module whose stated contract is DOM-free should not be ABLE to build HTML. Removing the
import is what turns that contract from a convention into a structural fact, and
`scripts/engine_contract_check.js` should gain an assertion that no HTML-building helper is imported
into the engine tier.

**Ride-along — delete the dead `asym`/raider branch (`:568`, the `"2c (raider)"` string).** Verified
unreachable: `asym:false` is hardcoded in `roundCfg` (`:821`) and set nowhere in the codebase
(`grep -rn asym src/ index.html scripts/` returns only the two read sites and the default). It is
already recorded in `15-CONTEXT.md`'s Deferred Ideas, and it carries a player-facing string that can
never render — exactly the dead-copy class D-33/D-34/D-40 exist to eliminate. A re-record is the
cheap moment to remove it.

**The UI-side counterpart, so whoever does the re-record does both halves together.**
`src/ui/util.js`'s `battle` builder currently renders `${e.spoil}`; it must render from `spoilIng` /
`spoilCoins` instead. State explicitly that **T5's interim display-layer fix in this same quick task
becomes redundant at that point and must be REMOVED, not left beside the new path as a second way of
spelling the same thing.** Name the `art-review/narration-table-baseline.json` cards that will need
re-pinning again (`table:battle`, `table:battle~cleaned`, `table:battle~crate`) and the
`art-review/narration-core.js` `VARIANTS.battle` fabricated fields (:383-389) and the D-51 paired-field
invariant (:267-278) that will both need updating to the new field names.

**The cost, plainly, sourced from `docs/DETERMINISM-RERECORD.md`.** Any change to what
`src/engine/index.js` emits into the event stream — including adding or renaming a field on an
existing event — invalidates all 31 fixtures in `scripts/fixtures/determinism/` and requires another
gated re-record: a full per-seed attributed divergence report, a blocking human decision, then a
single `--capture` run. There is no cheap version of this. Close with the sentence that makes the
batching Wyatt's stated intent rather than an optimisation: **this is one pass that does all of the
above together, not four separate engine changes** — the corpus is re-recorded exactly once, so
every queued item must land before that single capture.

Finally, add a `### Blockers/Concerns` bullet to `.planning/STATE.md` pointing at the new file by
path, so it cannot be lost between milestones. Fold it into the same STATE.md edit T5 makes, or
append after it — either is fine, but do not leave two competing bullets describing the same debt.
  </action>
  <verify>
    <automated>test -f docs/DETERMINISM-RERECORD-NEXT.md &amp;&amp; grep -q 'spoilCoins' docs/DETERMINISM-RERECORD-NEXT.md &amp;&amp; grep -q 'ilabelImg' docs/DETERMINISM-RERECORD-NEXT.md &amp;&amp; grep -q 'DETERMINISM-RERECORD-NEXT' .planning/STATE.md &amp;&amp; grep -q 'DETERMINISM-RERECORD-NEXT' docs/DETERMINISM-RERECORD.md &amp;&amp; npm test 2>&amp;1 | tail -3 &amp;&amp; test -z "$(git diff --stat src/engine/index.js)" &amp;&amp; echo ENGINE-CLEAN</automated>
  </verify>
  <done>
`docs/DETERMINISM-RERECORD-NEXT.md` exists, cites every location above by `file:line`, states the
re-record cost and the batch-together instruction, and specifies the UI counterpart including T5's
removal. Both docs cross-reference each other. `.planning/STATE.md` blockers point at it.
`src/engine/index.js` is unchanged. `npm test` exits 0.
  </done>
</task>

<task type="auto">
  <name>T7: G5 — recipe selection moves ahead of the turn-order intro (investigate, then act or STOP)</name>
  <files>src/orchestrator.js</files>
  <read_first>src/orchestrator.js:718-733 (runLiveNet), src/orchestrator.js:670-717 (recipeDraftNet), src/ui/flow.js:988-1042 (netIntroBarrier, showAhoyIntro, showTurnOrderIntro)</read_first>
  <action>
**Wyatt:** *"Put the recipe selection step NEXT"* — immediately after the Ahoy intro, BEFORE the
turn-order intro. Today `runLiveNet()` runs: `showAhoyIntro()` (:719) → shuffle + staggered starting
coins + `buildPlayerRows()` + `netSetTurnOrder()` (:722-729) → `showTurnOrderIntro(order)` (:730) →
`recipeDraftNet()` (:731).

**Investigate FIRST. The dependency that matters is not turn order itself — it is the seeded RNG
stream and the decision log, because a host-reload replay must reconstruct the identical game.**
Confirm all four of the following by reading source; every one of them was verified during planning
and should CONFIRM, not surprise:

1. `appState.game.shuffle(order)` (:723) consumes `game.r()`.
2. `recipeDraftNet` consumes `game.r()` for bot picks (:674) and calls `logDecision` for human picks
   (:694, :710).
3. `showTurnOrderIntro` → `netIntroBarrier` (`src/ui/flow.js:988-1006`) consumes **no** `game.r()`
   and calls **no** `logDecision`, and returns immediately when `appState.replaying`.
4. `recipeDraftNet` reads nothing from `appState.turnOrder`, and iterates `pending` in seat-index
   order, not turn order.

**If all four hold — reorder, and ONLY the two calls.** Move `recipeDraftNet()` to run directly
after `netSetTurnOrder(...)` and before `showTurnOrderIntro(order)`. Leave the shuffle, the staggered
coin assignment, `appState.turnOrder`, `buildPlayerRows()` and `netSetTurnOrder()` exactly where they
are (:722-729): they are silent — nothing is on screen for them — so they do not sit "between" the
Ahoy intro and the recipe draft from a player's point of view, and moving them WOULD perturb the RNG
stream. Swapping only the two awaited UI steps leaves the `r()` consumption order identical
(shuffle → bot recipe picks) and the `logDecision` order identical.

Add a comment at the reorder naming G5, quoting Wyatt, and stating the invariant that made the swap
safe: the two calls being swapped are pure UI barriers on one side and the RNG/decision-log consumer
on the other, and the silent setup between them was deliberately NOT moved.

**If any of the four does NOT hold — STOP. Do not force it.** Report, in the return message, exactly
which of the four failed and what the dependency actually is. A wrong reorder here silently
desynchronises a host-reload replay, which is the single most expensive class of bug in this
codebase.
  </action>
  <verify>
    <automated>node scripts/dlog_replay_test.js &amp;&amp; node scripts/determinism_baseline.js --verify 2>&amp;1 | tail -3 &amp;&amp; node scripts/module_graph_check.js &amp;&amp; npm test 2>&amp;1 | tail -5 &amp;&amp; awk '/await showAhoyIntro/{a=NR} /await recipeDraftNet/{r=NR} /await showTurnOrderIntro/{t=NR} END{if(a<r&&r<t)print "ORDER OK: ahoy("a") -> recipe("r") -> turnorder("t")"; else {print "ORDER WRONG: ahoy("a") recipe("r") turnorder("t")"; exit 1}}' src/orchestrator.js</automated>
  </verify>
  <done>
Either: the two calls are swapped, `dlog_replay_test.js` and `determinism_baseline.js --verify`
(31/31) are green, `npm test` exits 0, and the awk order check prints `ORDER OK`. Or: no source
change was made and the return message names which of the four checks failed and why.
  </done>
</task>

<task type="auto" tdd="true">
  <name>T8: G8 — a gentle fade of the outgoing line, triggered by the line that replaces it</name>
  <files>src/ui/panel.js, index.html</files>
  <read_first>src/ui/panel.js:197-226 (panel + resizePanel), src/ui/panel.js:302-342 (showNarration and the F6 comment block, including the RECORDED REJECTION of a cross-fade), src/ui/panel.js:433-456 (flash), index.html:259-268 (.apMsg CSS)</read_first>
  <behavior>
    - A new non-empty narration replacing an existing one: the outgoing text fades to transparent over 180ms while the incoming text renders; the box never shows two overlapping lines of stacked text.
    - The last line of a sequence, with nothing following it: never fades. Stays fully visible indefinitely. (F6, unchanged.)
    - A caller explicitly passing empty content: still clears and hides the panel immediately, with no fade. (The preserved explicit-clear path.)
    - Panel height animates exactly once per message, to the INCOMING message's height — the outgoing ghost contributes nothing to the measurement.
    - The ghost never intercepts a click on a prompt button underneath it.
  </behavior>
  <action>
**Wyatt:** *"I would like a gentle fade before the next line comes in, triggered BY the next line
coming in – the logic could be, if new line coming in, then fade current line before displaying it;
else keep the current line up."*

Yesterday's F6 made the trailing line persist. **Keep that exactly.** What changes is only the
REPLACEMENT: today it is an instant swap, and it should fade.

**The constraint that shapes the implementation, from `src/ui/panel.js:323-327`** — a cross-fade was
considered and REJECTED last night for two named reasons: a 500ms fade delays every line, and two
live lines in the box snap the panel height. Both objections are real and both must be answered
rather than overridden.

**Implementation — a ghost overlay in `panel()`, 180ms:**

Before `$("apGridInner").innerHTML = html` (`src/ui/panel.js:199`), if there is an existing `.apMsg`
AND the incoming `html` is non-empty, clone that element, absolutely position the clone over the
inner box, add the fade class, append it, and remove it on `animationend` (with a `setTimeout`
belt at ~250ms in case the animation event is dropped in a backgrounded tab — the same reasoning
`typewriterReveal` records for choosing `setTimeout` over `requestAnimationFrame`). The live content
is then replaced synchronously exactly as today.

The two objections, answered:
- **Height:** the ghost is `position:absolute` and therefore out of flow, so `resizePanel`'s
  `inner.offsetHeight` measurement (`:221`) still sees only the incoming message. The box animates
  once, to the new height, exactly as it does today.
- **Delay:** nothing is awaited. `panel()` stays fully synchronous, which is REQUIRED — `flash()`
  reads `.apMsg._revealDone` (`:439-440`) immediately after `_nh.onBroadcast()` has called
  `showNarration → panel()`, so a deferred swap would hand `flash` the wrong element or none.

**This is therefore a short OVERLAP cross-fade, not a strict fade-then-show.** Say that plainly in
the comment rather than describing it as what he literally typed: a strict sequence would delay
every single line by the fade duration, which is the exact objection recorded in this file last
night. Flag it on the human-verify list — it is his judgement call, not a gate's.

**Chosen duration: 180ms** (`.18s`). Reason to record in the comment: long enough to read as a soft
handoff rather than a cut, short enough to be over before the incoming line's typewriter has
revealed more than a few characters, and well under the 500ms that was rejected as draggy. If Wyatt
wants it slower or faster, this is the one number to change.

**Reuse the existing `.apMsg.fadeOut` rule** (`index.html:267`, currently `.5s`) rather than adding a
rival class: retune it to `.18s`, add `position:absolute; inset:0; pointer-events:none;` for the
ghost role, and rewrite the comment above it (`:265-266`) — it currently describes the pre-F6 world
and would be stale twice over. `pointer-events:none` is load-bearing: `panel()` also renders action
prompts with buttons, and a ghost that swallowed the first click on a prompt would be a far worse bug
than the one being fixed.

**Do not touch:** `MSG_HOLD_MULTIPLIER` (0.72), `msgHoldMs`, `chatBubbleHoldMs`, or the
`await sleep(...)` hold in `flash()` (`:447`). F6 preserved all of them deliberately and G7's reword
confirms the hold is the thing NARR-06 was always about. Do not touch `showChatBubble`'s own
`fadeOut` usage (`:382`) — bubbles run on their own curve (D-15).

**Update the F6 comment block** (`:308-339`) to record that the rejected-cross-fade paragraph is now
superseded by G8, with the two objections and how each is answered — do not delete the paragraph, a
future reader needs to know the 500ms version was tried and why this one is different.

**Tests.** `panel()` touches the DOM, so it has no headless gate. Add whatever assertions are
achievable in the existing DOM-free style to `scripts/narration_flow_test.js` only if a genuine pure
function falls out of the change; if none does, add none, and say so in the commit message rather
than writing a test that asserts nothing. The real verification for this task is Wyatt's eye.
  </action>
  <verify>
    <automated>npm test 2>&amp;1 | tail -5 &amp;&amp; grep -c 'pointer-events *: *none' index.html &amp;&amp; grep -c '\.18s' index.html &amp;&amp; node -e "const s=require('fs').readFileSync('src/ui/panel.js','utf8');const b=s.slice(s.indexOf('export function panel('),s.indexOf('export function resizePanel'));if(/await |async /.test(b))throw new Error('panel() must stay synchronous — flash() reads .apMsg immediately after it returns');console.log('panel() still synchronous');" &amp;&amp; test -z "$(git diff --stat src/engine/index.js)" &amp;&amp; echo ENGINE-CLEAN</automated>
    <human-check>
In a two-tab game, watch three or four narration lines replace each other. The outgoing line should
soften out rather than cut. Then stop on a trailing line (end of a bot turn) and confirm it stays up
indefinitely and never fades. Judge whether 180ms is right.
    </human-check>
  </verify>
  <done>
A replaced line fades over 180ms; a trailing line never fades; an explicit empty clear still hides
the panel with no fade; `panel()` is still synchronous; the ghost is `pointer-events:none` and out of
flow. `npm test` exits 0. Engine diff empty.
  </done>
</task>

<task type="auto" tdd="true">
  <name>T9: G6 — one shared coin re-validation, called at every at-risk debit site</name>
  <files>src/ui/flow.js, src/ui/index.js, src/orchestrator.js, scripts/narration_flow_test.js</files>
  <read_first>.planning/quick/20260729-playtest-bug-fixes/COIN-AUDIT.md (all of it — it is the specification for this task), src/ui/flow.js:262 (counterHeadroom, the pattern this follows), scripts/narration_flow_test.js:181-191 (how counterHeadroom is tested DOM-free)</read_first>
  <behavior>
    - The helper, given an intended debit and a current purse, clears the debit when the purse covers it and reports a shortfall when it does not. It never returns a negative purse and never mutates anything.
    - Debit 0 against purse 0 clears (a free choice is always affordable).
    - Debit equal to purse clears exactly (spending the last coin is legal).
    - Debit one more than purse reports a shortfall of 1.
    - A negative or non-finite intended debit is treated as unaffordable rather than silently crediting the purse.
    - After the change, no scripted sequence of (option built at purse N) → (shot-clock penalty) → (settlement) can leave any player's coins below zero.
  </behavior>
  <action>
**Wyatt, approving COIN-AUDIT.md's recommendation:** *"yes, build this check and apply it to all
situations."*

**The root cause, in one sentence from the audit:** affordability is checked when the option list is
BUILT, the purse is debited AFTER the click, and the 20-second shot-clock penalty
(`src/ui/util.js:1078`, takes `Math.min(1,p.coins)` from the deciding seat) fires inside exactly that
window. `appState.turnExpired` does not protect against it — that flag is set at 30 seconds; the coin
penalty fires at 20 and sets no flag at all.

**Step 1 — write the helper.** One small exported function in `src/ui/flow.js`, immediately beside
`counterHeadroom` (`:262`) and in the same shape: pure arithmetic, no DOM, no `appState`, so
`scripts/narration_flow_test.js` can import and test it exactly the way it already tests
`counterHeadroom` (`:181-191`). It takes the intended debit and the current purse and reports either
"clear" or the shortfall. Give it a header comment naming G6, quoting the root-cause sentence above,
and stating why the engine needs no such thing (`Game.play()` is fully synchronous — there is no
`await` between any engine gate and its matching debit, which is why the audit found zero AT RISK
rows in `src/engine/index.js` and why nothing here threatens the 31 fixtures).

Export it from `src/ui/index.js` as well — `src/orchestrator.js` imports from that barrel
(`:93-110`), not from `flow.js` directly, and `scripts/module_graph_check.js` enforces the tiering.

**Step 2 — write the failing tests FIRST**, in `scripts/narration_flow_test.js` beside the existing
F12 block, covering every case in `<behavior>` above. Run them, watch them fail, then implement.

**Step 3 — before touching any call site, inventory the fallbacks.** For each site below, name in
writing the EXISTING guarded path with EXISTING copy that a failed re-validation falls through to.
**Where a site has no existing fallback, STOP and report it — do not write new player-facing copy.**
Planning already traced a candidate for each; confirm each against source rather than trusting the
list:

| # | Site | Fallback candidate |
|---|------|--------------------|
| 2 | `src/ui/flow.js:619` — trade counter settlement | the "Walk away" outcome, i.e. the existing bot-refusal path at `:637-646` (`@copy adhoc.trade.refusalbot`) |
| 3 | `src/ui/flow.js:652` — accepted-offer settlement | the existing decline path at `:639-647` (`@copy adhoc.trade.refusalhuman`) |
| 5 | `src/ui/flow.js:311` — storm anchor "pay" | the existing `flip` branch; `brokeAnchorLine` (`:307`) already explains a missing pay option |
| 7 | `src/ui/flow.js:728` — sail from the action menu | the existing "no destination" outcome — the ship simply does not move; that path renders nothing, so nothing is invented |
| 8 | `src/ui/flow.js:817` — sail at turn start | same shape as #7 |
| 11 | `src/ui/flow.js:1140` — side-bet stake settlement | treat as the free call (`amt` 0); `settleSideBets` already renders a "no bounty" outcome |
| 14 | `src/orchestrator.js:545` — defender flee | `flee = false`, i.e. keep fighting; that path renders nothing |

**Site 4 (`src/ui/flow.js:497`, dock buy) is ALREADY FIXED** by yesterday's D-40 guard — the branch
condition is `if(buy&&p.coins>=3)`, which re-reads `p.coins` after the await rather than trusting the
pre-await `canBuy` flag. **Verify that by reading the line, then leave it alone. Do not double-guard
it.**

**Step 4 — site 13, the missing belt** (`src/orchestrator.js:402`, `asyncBattle`'s powder debit).
Copy the engine's own guard (`src/engine/index.js:524`: `if(att.coins<c.powder)return null`). **Place
it at the TOP of `asyncBattle`, before the opening `flash()` at `:401`** — this is the specific
answer to the audit's "NEEDS A SECOND PAIR OF EYES" concern that *"a `return null` mid-`asyncBattle`
may not be safe for the network path (a battle snapshot may already be in flight)."* Guarding before
the opening broadcast means no snapshot can be in flight. Then confirm every caller handles a falsy
return: `humanAct` (`src/ui/flow.js:~703`, which carries its own D-40 net) and the bot path. If any
caller would misbehave on a falsy return, STOP and report rather than changing the return contract.

**Step 5 — apply the helper at the seven sites**, each with a `// G6` comment naming the site number
from `COIN-AUDIT.md` so the audit stays navigable, and each falling through to the fallback confirmed
in step 3. Do not "fix" any site the audit marked SAFE — sites 6, 9, 10, 12, 15, 16, 17 and every
engine row are arithmetically closed or synchronous, and guarding them adds noise without removing
risk.

**Step 6 — a regression test for the interleave itself, not just the helper.** In
`scripts/narration_flow_test.js`, add at least one scripted case that reproduces the audit's shortest
repro arithmetically: a purse of N, an option priced at N, a 1-coin penalty applied, then the
settlement — asserting the result is ≥ 0. This is the assertion that would have caught F12 and
catches the class; the pure helper tests alone would not.

**`src/engine/index.js` is not edited.** Every AT RISK path is UI-tier; the audit states plainly that
nothing in it threatens the 31 fixtures.
  </action>
  <verify>
    <automated>node scripts/narration_flow_test.js &amp;&amp; node scripts/module_graph_check.js &amp;&amp; node scripts/ui_contract_check.js &amp;&amp; node scripts/no_undef_check.js &amp;&amp; node scripts/determinism_baseline.js --verify 2>&amp;1 | tail -3 &amp;&amp; npm test 2>&amp;1 | tail -5 &amp;&amp; test -z "$(git diff --stat src/engine/index.js)" &amp;&amp; echo ENGINE-CLEAN</automated>
  </verify>
  <done>
The helper exists in `src/ui/flow.js` beside `counterHeadroom`, is exported through `src/ui/index.js`,
and is covered by DOM-free tests for every case in `<behavior>`. All seven at-risk sites call it and
fall through to a named pre-existing path. Site 4 is untouched and verified already-guarded. Site 13
carries the engine's guard, placed before the opening broadcast. At least one test reproduces the
penalty-interleave arithmetically and asserts a non-negative purse. No new player-facing string was
written anywhere. `npm test` exits 0. Engine diff empty.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| player input → UI prompt handlers | Every change here is behind an existing `ask()`/`pickCell()` prompt; no new input surface is created |
| host → guest (Firebase RTDB) | T7 reorders two awaited UI barriers and T5/T3/T4 change rendered narration text that is broadcast; no new field, node or writer is added |
| DOM ← narration HTML | T8 clones an existing rendered node into a ghost overlay; no new string reaches `innerHTML` that did not already |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-Q30-01 | Tampering | coin debit sites (`src/ui/flow.js`, `src/orchestrator.js`) | high | mitigate | This is the whole of T9 — a negative purse silently changes every later affordability gate. Closed by the shared re-validation at all seven at-risk sites plus site 13's guard. |
| T-Q30-02 | Tampering | host↔guest lockstep (T7's reorder) | high | mitigate | The reorder is restricted to two awaited UI barriers that consume no `game.r()` and log no decision; `dlog_replay_test.js` and `determinism_baseline.js --verify` gate it, and T7 carries an explicit STOP rule if any of its four checks fails. |
| T-Q30-03 | Information disclosure | ghost overlay (T8) | low | accept | The ghost is a clone of a node that was already on screen to this viewer; it reveals nothing new and is removed on `animationend`. |
| T-Q30-04 | Denial of service | ghost overlay leak (T8) | low | mitigate | `animationend` can be dropped in a backgrounded tab, so the removal carries a `setTimeout` belt — the same reasoning `typewriterReveal` already records for preferring `setTimeout` to `requestAnimationFrame`. |
| T-Q30-05 | Elevation of privilege | ghost intercepting prompt clicks (T8) | medium | mitigate | `pointer-events:none` on the ghost, asserted by the `index.html` grep in T8's verify. |
| T-Q30-SC | Tampering | supply chain | low | accept | No package-manager install occurs anywhere in this plan. No build step, no CDN, no new dependency (hard constraint 3). `package.json` must show an empty diff. |
</threat_model>

<source_coverage_audit>
Every item in the brief is planned. Nothing is deferred, simplified, or reduced.

| Source item | Where |
|---|---|
| G1 — dock addressed lines drop the place (approved verbatim) | T4 |
| G2 — lucky-break bug on the Tortuga berth | T3 |
| G3 — battle spoils render the coin icon, no engine change | T5 |
| G3 — the design debt recorded in STATE.md blockers | T5 |
| G4 — intro banner rewrite | T1 |
| G4 — recipe prompt rewrite | T1 |
| G4 — D-16 icons preserved, D-53 em dash, D-29 ye/yer | T1 |
| G5 — recipe selection moves ahead of the turn-order intro | T7 |
| G5 — STOP-and-report if a real dependency exists | T7 (explicit) |
| G6 — one shared re-validation helper | T9 step 1 |
| G6 — applied at the eight at-risk sites | T9 steps 3+5 (seven; site 4 verified already fixed) |
| G6 — site 13's engine guard copied into `asyncBattle` | T9 step 4 |
| G6 — existing fallbacks only, never new copy | T9 step 3 (STOP rule) |
| G6 — regression tests | T9 steps 2+6 |
| G7 — NARR-06 reworded, and only NARR-06 | T2 (a) |
| G8 — fade the outgoing line, triggered by the incoming one | T8 |
| G8 — short (~150-200ms), height stable, no fade-to-empty | T8 (180ms, ghost out of flow, F6 trailing behaviour kept) |
| G9 — queued engine-purity spec for the next re-record | T6 |
| OOS-1 — counter-offer to the backlog, not built | T2 (b) |
| OOS-2 — flee-not-offered ruled not a bug, recorded | T2 (c) |

**Constraints honoured:** `src/engine/index.js` empty diff (asserted in seven of nine tasks'
`<verify>`); `npm test` green before every commit; no build step / CDN / dependency; `src/ui/` never
imports `src/net/`; comment convention with `2026-07-30` attribution; re-pin-with-reason for every
fixture a correct fix reddens (T3, T4, T5), never widening a pattern and never editing Wyatt's
disposition files.
</source_coverage_audit>

<verification>
Run after the final commit:

1. `npm test` — 16 gate scripts, 23/23 assertion groups PASS, exit 0.
2. `git diff --stat 9dd36c0..HEAD -- src/engine/index.js` — **must print nothing.** This is the
   single most important check in the plan.
3. `git diff --stat 9dd36c0..HEAD -- package.json package-lock.json` — must print nothing.
4. `node scripts/determinism_baseline.js --verify` — 31/31 PASS, `SOURCE: unchanged`.
5. `git log --oneline 9dd36c0..HEAD` — nine commits, one per task, each independently revertible.
6. `git diff --numstat 9dd36c0..HEAD -- .planning/REQUIREMENTS.md` — exactly one line changed.
</verification>

<human_verify>
Deliberately short. Everything not listed here is settled by a gate.

**Blocking — Wyatt must judge these before the recorded playthrough is worth doing:**

1. **T8, the fade at 180ms.** The one number in this plan that is a taste call, and the one thing no
   gate can answer. Watch three or four lines replace each other, then stop on a trailing line and
   confirm it stays up. Faster, slower, or right?

**Opportunistic — fold into the recorded two-player playthrough, no separate session:**

2. **T1 + T7 together, on one screen.** The Ahoy banner, then immediately the recipe cards, then the
   turn-order announcement. Both rewritten strings and the new order are visible in the first fifteen
   seconds of any game.
3. **T3, the lucky break.** Only observable when a storm shoves a ship onto the Tortuga berth — not
   forceable without a temporary `cfg.storm` edit, so watch for it rather than hunting it. If it
   comes up, it should read as a rescue, not as "still docked".
4. **T4 and T5 in the log.** Dock lines addressed to you should name no island; battle spoils should
   show the coin icon. Both are pinned by gates, so this is confirmation rather than testing.
</human_verify>

<success_criteria>
- Nine atomic commits, each green on `npm test`, each independently revertible.
- `src/engine/index.js` byte-identical to `9dd36c0`.
- Every fixture a correct fix reddened is re-pinned in the same commit with its reason in its own
  provenance field; no pattern widened, no equality loosened, no disposition file touched.
- No player-facing string invented anywhere; every fallback path reuses copy that already ships.
- Wyatt's blocking item (the 180ms fade) is the only thing waiting on a human before the recorded
  playthrough.
</success_criteria>

<output>
Commit each task separately. Suggested subjects, in order:

1. `fix(g4): the intro names the first thing ye do, and the recipe prompt is one line`
2. `docs(g7): NARR-06 was always about hold length; counter-offer to the backlog; the flee ruling recorded`
3. `fix(g2): a gust that shoves ye onto the Tortuga berth is a lucky break, not "still docked"`
4. `fix(g1): the addressed dock line says what happened to ye, not where ye are`
5. `fix(g3): battle spoils show the coin, and the engine keeps an empty diff`
6. `docs(g9): the engine's event contract, queued for the next gated re-record`
7. `refactor(g5): recipe selection comes straight after the Ahoy intro`
8. `feat(g8): the outgoing narration line fades when — and only when — one replaces it`
9. `fix(g6): one shared coin re-validation, called at every debit site that can interleave`

Write `.planning/quick/20260730-playtest-notes-fixes/SUMMARY.md` when done, recording: which of T7's
four dependency checks held, whether any T9 site had to STOP for want of an existing fallback, the
final chosen fade duration, and every fixture re-pinned with its reason.
</output>