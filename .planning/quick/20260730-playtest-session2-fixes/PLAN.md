---
phase: quick-20260730-playtest-session2-fixes
plan: 01
type: execute
wave: 1
depends_on: []
autonomous: false
requirements: [G10, G11, G12, G13, G14, G15, G16, G17, G18, G19, G20, G21, G22, G23, G24, G25, G26]
files_modified:
  - src/ui/flow.js
  - src/ui/panel.js
  - src/ui/board.js
  - src/ui/util.js
  - src/orchestrator.js
  - index.html
  - package.json
  - scripts/ui_contract_check.js
  - scripts/narration_flow_test.js
  - scripts/host_guest_parity_check.js
  - art-review/narration-inventory.json
  - art-review/narration-approved-baseline.json
  - docs/DETERMINISM-RERECORD-NEXT.md
  - .planning/STATE.md
  - .planning/how-to-play-pastry-pirates.md
  - .planning/phases/15-narration-audit-fixes/15-PLAYTEST-NOTES.md
  - .planning/todos/pending/flee-not-offered-when-broke.md
  - .planning/todos/pending/ships-stack-after-rim-sweep.md
  - .planning/todos/pending/flip-outcomes-all-caps-in-play-only.md
  - .planning/todos/pending/narration-two-schedulers-unenforced.md

must_haves:
  truths:
    - "The tails dock prompt reads in Wyatt's own words, announces the flip outcome in ALL CAPS, and states no amount the buttons already carry (G12)."
    - "The coin picker asks `How many?` on every branch (G11)."
    - "The privacy notice speaks plain English, and the register gate records WHY rather than being widened (G16)."
    - "An outgoing narration line finishes fading BEFORE the next line begins to appear; a trailing line still never fades (G17)."
    - "At 0 coins the storm prompt offers no anchor it cannot honour, and the anchor option is greyed with Wyatt's own reason rather than vanishing (G10)."
    - "The storm flip button says `lose half yer treasure`, never two coin glyphs in a row (G13)."
    - "A trade-wind sweep is watched square-by-square around the rim — by the player sailing, by the host, AND by a guest — driven by ONE shared stepper (G14)."
    - "Inside windLeg the board is painted before any line describing it is narrated, and a gate enforces it rather than the file holding both orders (G15)."
    - "A boxed-in bot escapes via the rim in the game people actually play, not only in headless runs (G18)."
    - "Every client in a room sees the SAME rain, and it falls at the midpoint of the two screens measured live (G19)."
    - "A guest's sail squares are the same colour, the same brightness, bounce the same way and respond to the cursor the same way as the host's — because ONE function builds both (G25)."
    - "Host and guest rendering of the same moment cannot silently diverge again: a gate compares the two paths and fails naming the class present on one side and missing on the other (G26)."
    - "src/engine/index.js is byte-identical at every commit in this plan; the 31-seed corpus is never re-recorded here."
  artifacts:
    - "scripts/host_guest_parity_check.js"
    - ".planning/todos/pending/ships-stack-after-rim-sweep.md"
    - ".planning/todos/pending/flip-outcomes-all-caps-in-play-only.md"
    - ".planning/todos/pending/narration-two-schedulers-unenforced.md"
    - "docs/DETERMINISM-RERECORD-NEXT.md (extended; G14's guest half REMOVED from it)"
  key_links:
    - "src/engine/index.js rimCellInfo (ordered, arc-tagged ring) + rimHead -> rimSweepPath() -> animateRimSweepIfAny() -> paintShipAt() in src/ui/board.js -> called identically by the host sites AND by watchEvents() on the guest"
    - "sailHighlightRect() in src/ui/flow.js -> localPickCell AND remotePickHighlights -> index.html .sailCell/.sailCell:hover/sailBounce/prefers-reduced-motion"
    - "scripts/host_guest_parity_check.js -> localAsk vs watchPrompt class vocabulary -> the single sail-highlight builder -> (T12) the single rim-sweep stepper"
    - "panel()'s ghost clone -> index.html .apMsg.fadeOut .18s -> typewriterReveal()'s new start delay -> flash()'s await of _revealDone"
    - "buildStormLayers -> stormLayerSpecs(seed) <- appState.game.seed (identical in every browser in a room; NEVER game.r())"
    - "windLeg ev() -> liveRender() -> narrateLastEvent() -> scripts/narration_flow_test.js's paint-before-narrate invariant (replaces two literal pins that currently pin the WRONG order)"
---

<objective>
Seventeen items from Wyatt's recorded two-tab playtest of 2026-07-30 (room NAMF). Thirteen code
changes — four one-line copy corrections, a greyed storm-anchor option, a bot rim-escape parity fix,
the last unfixed host/guest visual drift plus the gate that stops a fifth one, a render-before-
narrate invariant with its own gate, a strict narration fade, seeded and retuned storm rain, and a
square-by-square trade-wind sweep for host AND guest — plus four rulings recorded as documents so a
later pass cannot "fix" them back.

Purpose: everything here is Wyatt's decision, quoted. Nothing needs re-litigating. This closes the
session-2 punch list so the next recorded playthrough tests the game he actually asked for.

Output: thirteen atomic, independently-committable commits, each green on `npm test`, each leaving
`src/engine/index.js` byte-identical.
</objective>

<finding_ids>
Yesterday's playtest findings are `F1`–`F12`; this morning's are `G1`–`G9`
(`.planning/quick/20260730-playtest-notes-fixes/PLAN.md`). Session 2 continues the convention.
`G10`/`G11`/`G12` are already lettered in
`.planning/phases/15-narration-audit-fixes/15-PLAYTEST-NOTES.md` §SESSION 2; `G13`–`G26` are
assigned here. Source comments cite `// G<n> (Wyatt-approved 2026-07-30)`.

| ID | Task | Finding |
|----|------|---------|
| G12 | T1 | Tails dock prompt — his exact words; flip outcome ALL CAPS; amounts live on the buttons |
| G11 | T2 | Coin picker → `How many?`, both branches |
| G13 | T3 | Storm flip button → `lose half yer treasure`; two coin glyphs read as confusing |
| G16 | T4 | Privacy notice → plain "you"; the register gate learns the out-of-character-chrome rule |
| G10 | T5 | Storm anchor: the option vanishes silently AND the prompt still offers it |
| G18 | T6 | A boxed-in bot escapes via the rim in `botTurn`, not only in the engine's `takeTurn` |
| G25 | T7 | D-55 pulled forward: one function builds BOTH sail-highlight rects |
| G26 | T8 | The host/guest parity gate D-56 recommended and nobody wrote |
| G15 | T9 | Render before narrate, and a gate so the file cannot hold both orders |
| G17 | T10 | The fade becomes a STRICT sequence — fade out, THEN show |
| G19 | T11 | Storm rain: seeded from the game, retuned to the measured midpoint |
| G14 | T12 | Trade winds move square-by-square — solo, host AND guest, one shared stepper |
| G20 | T13 | The queued re-record batch, extended (and G14's guest half REMOVED from it) |
| G21 | T13 | RULING: ships may stack on one square after a rim sweep — accepted, do not fix |
| G22 | T13 | RULING: flee not offered to a broke defender — not a bug, and no greyed button either |
| G23 | T13 | RULING: flip outcomes ALL CAPS in play only; prose and stats stay lowercase |
| G24 | T13 | RULING: inline icon spacing — explicitly declined |
</finding_ids>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/phases/15-narration-audit-fixes/15-PLAYTEST-NOTES.md
@.planning/phases/15-narration-audit-fixes/15-CONTEXT.md
@.planning/quick/20260730-playtest-notes-fixes/PLAN.md
@.planning/how-to-play-pastry-pirates.md
@docs/DETERMINISM-RERECORD-NEXT.md
</context>

<hard_constraints>
These apply to EVERY task. A task that cannot be done without breaking one must STOP and report,
never work around it.

1. **`src/engine/index.js` must keep an empty diff for this whole plan.** 31 determinism fixtures
   depend on it. G14 and G18 are deliberately scoped UI-tier for exactly this reason; G20 is a
   document. `git diff --stat src/engine/index.js` must print nothing at every commit.
2. **`npm test` green before every commit.** Baseline confirmed green at `31cd24c` before planning:
   16 gate scripts, 23/23 assertion groups, exit 0.
3. **No build step, no CDN, no new dependencies.** `src/ui/` never imports `src/net/`
   (`scripts/module_graph_check.js` enforces this). **`npm test` grows from 16 gates to 17 exactly
   once, in T8, and nowhere else** — every other new assertion goes into an EXISTING gate script.
4. **Vanilla JS at the codebase's existing density.** Comment convention is
   `// G<n> (Wyatt-approved 2026-07-30)` with a one-line rationale citing his own words.
5. **Never invent player-facing copy.** Every string in this plan is Wyatt's. Where a fix seems to
   need a new one, prefer DELETING a clause to writing one; if neither works, STOP and report.
6. **When a gate goes red because a fix is correct, re-pin that fixture in the SAME commit** with
   the reason in its own `_provenance`. Never widen a pattern, never loosen an equality to a window,
   never touch `15-DISPOSITIONS-*.json` / `15-*-APPROVED.*`.
7. **`art-review/narration-inventory.json` is regenerated by `npm test`** (gate
   `extract_narration_lines.js`) and must be committed alongside any copy change that moves it.
8. **A new gate ships RED rather than loose.** If a gate's subject fix cannot land, the gate still
   goes in, red, with the reason stated. Standing rule on this project; not negotiable.
</hard_constraints>

<tasks>

<task type="auto">
  <name>T1: G12 — the tails dock prompt, in Wyatt's exact words</name>
  <files>src/ui/flow.js, art-review/narration-inventory.json</files>
  <read_first>src/ui/flow.js:499-529 (the `@copy prompt.dock.tailschoice` block and its F5/F9/D-40 comment stack), src/shared/index.js:140-172 (DOCK_FLAVOR + dockFlavorIcon — the declared {prefix,name} split F5 established)</read_first>
  <action>
One string replacement. `src/ui/flow.js:519`, the first argument to `ask(...)`:

    FROM: Tails! Take 3🌕 — or buy ${dockFlavorIcon(ing)} for 3🌕?
    TO:   ⚫️ TAILS! Take treasure instead? Or buy ${dockFlavorIcon(ing)}?

Wyatt's own words. He wrote the example as
`⚫️ TAILS! Take treasure instead? Or buy a bundle of 🌼 Velvety Vanilla Beans?` — and
`dockFlavorIcon(ing)` is exactly what produces `a bundle of 🌼 Velvety Vanilla Beans` (F5's
one-place-decides rule, icon before the NOUN). Do NOT hand-roll the flavour phrase.

Three things are load-bearing; give each a line in the comment:
  - **The amounts are REMOVED on purpose.** The buttons already carry them (`Buy … (−3🌕)` /
    `Take 3🌕`). This is D-31 applied deliberately, in his own words: *"I don't want to duplicate
    wording in the prompt and on the button."*
  - **`TAILS` is ALL CAPS because the game is announcing a flip outcome as it happens** (G23). The
    sweep found this prompt was the ONLY in-play offender; explanatory prose (the how-to-play
    modal) and statistics (award bylines, `heads-luck`) stay lowercase at his word — *"just the
    in-play line is fine, leave the prose and stats"*. Point the comment at the ruling file T13
    writes.
  - **`⚫️` is emoji shorthand, not an `<img>`** — `emojify()` turns it into the coin artwork at the
    `panel()` chokepoint (D-50). It carries the U+FE0F variation selector exactly as he typed it;
    do not strip it.

**Do not touch the buttons** (`Buy ${ilabelImg(ing)} (−3🌕)` / `Take 3🌕`), the `disabled:!canBuy`
flag, the `canBuy?null:` reason, or the D-40 purchase guard. F9/D-41 and `ui_contract_check.js`
assertion 6 (co-reachability) both depend on that shape.
  </action>
  <verify>
    <automated>node -e 'const s=require("fs").readFileSync("src/ui/flow.js","utf8");if(!s.includes("⚫️ TAILS! Take treasure instead? Or buy ${dockFlavorIcon(ing)}?"))throw new Error("approved prompt not present byte-exact");if(/Tails! Take 3/.test(s))throw new Error("old prompt survives");if(!/disabled:!canBuy/.test(s)||!/if\(buy&&p\.coins>=3\)/.test(s))throw new Error("F9/D-40 shape disturbed");console.log("G12 prompt exact, buttons untouched")' &amp;&amp; npm test 2>&amp;1 | tail -6 &amp;&amp; test -z "$(git diff --stat src/engine/index.js)" &amp;&amp; echo ENGINE-CLEAN</automated>
  </verify>
  <done>
The prompt reads exactly as quoted, with no amount in it. Both buttons are byte-identical to their
pre-change selves. `art-review/narration-inventory.json` regenerated and committed. `npm test`
exits 0. Engine diff empty.
  </done>
</task>

<task type="auto">
  <name>T2: G11 — the coin picker asks `How many?`</name>
  <files>src/ui/flow.js, art-review/narration-approved-baseline.json, art-review/narration-inventory.json</files>
  <read_first>src/ui/flow.js:579-597 (step 3 of humanTrade — coinChoices, coinOpts, offerSoFar, the `@copy prompt.trade.addcoins` ask), scripts/narration_audit_check.js:498-620 (assertion 8's drift baseline, EXPECTED_DRIFT=104, and its "DRIFT PIN, not evidence of approval" provenance rule)</read_first>
  <action>
`src/ui/flow.js:594`:

    FROM: Add any 🌕 to yer offer of ${offerSoFar}?
    TO:   How many?

Wyatt: *"this is a weird statement, for players who only offer coins! It should just say 'How many?'
-- and i think it would work with all branches."* **Both branches**, so the interpolation goes
entirely.

`offerSoFar` (`:592`) becomes unread — **DELETE the const.** A variable nothing reads is dead code,
which D-33/D-34/D-40 exist to prevent, and it strands the only remaining use of the `"nothing yet"`
literal, which is the exact phrase he called weird.

Record in the comment, in his terms: the crate branch also renders a `No extra coins` option, so
that screen reads `How many?` above a row ending in that option — **he has been told this and
accepted it** — and what he gives up is the reminder of which crate he is offering. Say so plainly
so a later pass does not "restore context" and undo his decision.

**Re-pin `art-review/narration-approved-baseline.json` in this same commit.**
`prompt:prompt.trade.addcoins` is one of the 104 drift-pinned cards (verified during planning), so
assertion 8 goes correctly red. Update that ONE card's text and append a G11 paragraph to the
existing `_provenance`, keeping the string `DRIFT PIN` in it — assertion 8 itself requires that
(`narration_audit_check.js:614`). The card COUNT must stay exactly 104 (`EXPECTED_DRIFT`); if it
moves, something other than a text edit happened — STOP.

`prompt:prompt.dock.tailschoice` is NOT in that baseline (only its two BUTTON cards are), so T1 did
not touch this file — confirm that rather than assuming it.
  </action>
  <verify>
    <automated>node -e 'const s=require("fs").readFileSync("src/ui/flow.js","utf8");if(!/await ask\(`How many\?`,coinOpts\)/.test(s))throw new Error("the How many? prompt is not present");if(/offerSoFar/.test(s))throw new Error("offerSoFar survives — dead code");if(/nothing yet/.test(s))throw new Error("the \"nothing yet\" literal survives");const b=require("./art-review/narration-approved-baseline.json");const n=Object.keys(b.cards||b).length;if(n!==104)throw new Error("drift baseline card count moved to "+n+" — expected exactly 104");if(!/drift pin/i.test(JSON.stringify(b._provenance||"")))throw new Error("provenance no longer states DRIFT PIN");console.log("G11 exact, offerSoFar gone, drift baseline still 104")' &amp;&amp; npm test 2>&amp;1 | tail -6 &amp;&amp; test -z "$(git diff --stat src/engine/index.js)" &amp;&amp; echo ENGINE-CLEAN</automated>
  </verify>
  <done>
Both branches of step 3 render `How many?`. `offerSoFar` and `"nothing yet"` are gone from the file.
The drift baseline pins 104 cards and its provenance names G11 while still saying DRIFT PIN.
`npm test` exits 0. Engine diff empty.
  </done>
</task>

<task type="auto">
  <name>T3: G13 — the storm flip button says `lose half yer treasure` (+ G24 recorded)</name>
  <files>src/ui/flow.js, art-review/narration-inventory.json</files>
  <read_first>src/ui/flow.js:316-325 (broke/trueShipwreck and the three-branch flipLabel with its D-59 comment)</read_first>
  <action>
`src/ui/flow.js:324`, the ORDINARY branch of `flipLabel` only:

    FROM: Flip (⚪ HEADS: dodge safely. ⚫ TAILS: lose half yer 🌕 (−${…}🌕))
    TO:   Flip (⚪ HEADS: dodge safely. ⚫ TAILS: lose half yer treasure (−${…}🌕))

where `${…}` is the untouched `Math.max(1,Math.floor(p.coins/2))`. Wyatt: *"the two coin emojis next
to each other are confusing"*. Only the word changes — the D-59 parenthetical keeps its live
expression and its `🌕`, so the button can still never disagree with the outcome.

**The other two branches are correct and must not be touched**: `trueShipwreck` says
`⚫ TAILS: lose turn`, `broke` says `⚫ TAILS: lose a crate`. Neither has two coin glyphs.

**G24, recorded here as one comment line:** Wyatt explicitly declined the inline-icon-spacing change
offered alongside this fix — *"i don't care at all about breathing room around inline items right
now -- i just wanted the emoji wording fix."* Put that at this site so the next reader does not
bundle a margin change into a wording fix. **Do NOT change any inline icon margin**, here or in
`index.html`'s `.narrIcon` rule — `index.html` must have an empty diff in this commit.
  </action>
  <verify>
    <automated>node -e 'const s=require("fs").readFileSync("src/ui/flow.js","utf8");if(!s.includes("TAILS: lose half yer treasure (−${Math.max(1,Math.floor(p.coins/2))}\u{1F315})"))throw new Error("retuned ordinary flipLabel not present byte-exact");if(/lose half yer \u{1F315}/u.test(s))throw new Error("old two-coin-glyph wording survives");if(!s.includes("TAILS: lose turn")||!s.includes("TAILS: lose a crate"))throw new Error("a sibling flipLabel branch was disturbed");console.log("G13 wording fixed, siblings intact")' &amp;&amp; test -z "$(git diff --stat index.html)" &amp;&amp; echo G24-INDEX-UNTOUCHED &amp;&amp; npm test 2>&amp;1 | tail -6 &amp;&amp; test -z "$(git diff --stat src/engine/index.js)" &amp;&amp; echo ENGINE-CLEAN</automated>
  </verify>
  <done>
The ordinary branch reads `lose half yer treasure (−N🌕)`; the `trueShipwreck` and `broke` branches
are byte-identical. `index.html` has an empty diff (G24). `npm test` exits 0. Engine diff empty.
  </done>
</task>

<task type="auto">
  <name>T4: G16 — the privacy notice speaks plain English, and the register gate learns the rule</name>
  <files>index.html, scripts/ui_contract_check.js</files>
  <read_first>index.html:664 (the playtesting/privacy notice), scripts/ui_contract_check.js:198-323 (assertion 5 — REGISTER_SKIP_FILES, REGISTER_LINE_ANCHORS, REGISTER_LABEL_EXCEPTIONS, checkLabelExceptionsFresh, scanRegisterFile), scripts/ui_contract_check.js:760-880 (drills 5a-5h — three of them name the label list by identifier)</read_first>
  <action>
**(a) The copy.** `index.html:664` — *"…nothing beyond the name **ye** type above is collected."* →
`you`. Wyatt: *"the whole thing is written in normal english not pirate, so the 'ye' feels weird and
out of place."* Change that ONE word; nothing else on the line moves.

**(b) The gate.** This WILL turn assertion 5 red, and the fix is to teach it the rule, never to
widen it. Generalise the existing per-file, content-anchored exception list from "the LABEL class"
to **out-of-character chrome**, which is the rule his ruling actually states:

> D-29's pirate register applies to text the GAME SPEAKS. Text that is not the game speaking — a
> label identifying which row is yours, a legal/privacy notice, the credits, the recipe card the
> captain is holding — is out-of-character chrome and stays plain English.

In `scripts/ui_contract_check.js`:
  - Rename `REGISTER_LABEL_EXCEPTIONS` → `REGISTER_CHROME_EXCEPTIONS`,
    `checkLabelExceptionsFresh` → `checkChromeExceptionsFresh`, and the failure code
    `D-29-LABEL-STALE` → `D-29-CHROME-STALE`. Update the three drill assertions naming them
    (5f/5g/5h) so `--drill` stays green — that is the acceptance test for the rename.
  - Give each entry a `kind` field (`"label"` | `"notice"`) and rewrite the block header to state
    the general rule with the sub-kinds under it. Keep every existing property: per-file scoping,
    content anchors, and a freshness check that FAILS on an anchor matching nothing.
  - **Add** the privacy notice: `kind:"notice"`, `rel:"index.html"`, anchored on
    `nothing beyond the name you type above is collected`, reason on file = his words above plus
    "the surrounding paragraph is plain English throughout — one pirate pronoun inside it is a
    register mismatch, not pirate voice."
  - **Move** the credits paragraph out of `REGISTER_LINE_ANCHORS` (the `overly enthusiastic noodle`
    entry, which today excuses that line ANYWHERE in the tree) into the chrome list as
    `kind:"notice"`, `rel:"index.html"`. Same exclusion, now scoped to one file and freshness-
    checked — a strictly TIGHTER gate — and it files his personal thank-yous under the same named
    rule instead of a bag of unrelated anchors.
  - **Update the `src/ui/recipe.js` skip note.** It reads
    `>>> REMOVE THIS EXCLUSION THE MOMENT HE RULES`. **He has now ruled** — recipe descriptions are
    out-of-character chrome and stay plain English. Replace the pending-decision note with the
    ruling and its date. The file-level skip stays; only its justification changes from "deferred"
    to "decided".

**Do not add any other entry, and do not touch `REGISTER_IDENT_FRAGMENTS` or the engine entry in
`REGISTER_SKIP_FILES`.** If assertion 5 is still red after exactly these changes, something else
regressed — STOP and report rather than adding a second exception.
  </action>
  <verify>
    <automated>node -e 'const h=require("fs").readFileSync("index.html","utf8");if(!h.includes("nothing beyond the name you type above is collected"))throw new Error("privacy notice not converted");if(/name ye type above/.test(h))throw new Error("the pirate form survives");const g=require("fs").readFileSync("scripts/ui_contract_check.js","utf8");if(/REGISTER_LABEL_EXCEPTIONS|checkLabelExceptionsFresh|D-29-LABEL-STALE/.test(g))throw new Error("the rename is incomplete");if(!/REGISTER_CHROME_EXCEPTIONS/.test(g)||!/kind:\s*"notice"/.test(g))throw new Error("the chrome list or its kind field is missing");console.log("G16 copy + generalised chrome rule in place")' &amp;&amp; node scripts/ui_contract_check.js &amp;&amp; node scripts/ui_contract_check.js --drill &amp;&amp; npm test 2>&amp;1 | tail -6 &amp;&amp; test -z "$(git diff --stat src/engine/index.js)" &amp;&amp; echo ENGINE-CLEAN</automated>
  </verify>
  <done>
The notice reads plain English. Assertion 5 passes for the stated REASON, not by widening: the
exception is per-file, content-anchored, freshness-checked and carries `kind:"notice"` with Wyatt's
words. The credits anchor moved out of the tree-wide list. `recipe.js`'s note records the ruling.
`--drill` is green. `npm test` exits 0. Engine diff empty.
  </done>
</task>

<task type="auto">
  <name>T5: G10 — the storm prompt offers no anchor it cannot honour</name>
  <files>src/ui/flow.js, art-review/narration-inventory.json</files>
  <read_first>src/ui/flow.js:310-341 (the anchor-or-flip block: opts, broke/trueShipwreck, flipLabel, promptMsg, the brokeAnchorLine flash, the G6 coinShortfall guard), src/ui/flow.js:244-250 (brokeAnchorLine), scripts/ui_contract_check.js:375-525 (assertion 6 — a `disabled:` option's reason must be reachable in the state it explains)</read_first>
  <action>
Wyatt, at 0 coins during a storm push into land: *"oooh -- this should also have a greyed-out button
because you can't anchor!"* **Two faults, both must be fixed.** Sixth instance of the D-41 family
after Attack, Trade, coins-only, hail-Counter and dock-buy.

**Hoist first.** `const broke=p.coins===0,trueShipwreck=broke&&!p.ing.length;` (`:318`) currently
sits BELOW the option push. Move that line ABOVE the `opts` array so both halves can read it. Pure
reorder; no behaviour change.

**(a) Grey the option instead of dropping it.** `:313` today is
`if(p.coins>=1)opts.push({label:"Anchor safely (−1🌕)",value:"pay"});`. It becomes an unconditional
push carrying `disabled:broke`, and `ask()` gains its 4th argument — the reason, **Wyatt's words
verbatim**:

    Yer too broke to anchor

i.e. `ask(promptMsg,opts,null,broke?`Yer too broke to anchor`:null)`. The label, the U+2212 minus
and the `(−1🌕)` parenthetical (D-38) are untouched. Supplying the reason ONLY when broke is what
assertion 6 requires — a reason must be reachable in the state it explains and must not appear in
states it does not.

**(b) Stop the prompt offering the branch.** `:326-328` today:

    trueShipwreck → `${pn(p.idx)}: the storm blows ye toward an island! Yer broke — if ye run aground, ye'll lose yer turn!`
    otherwise     → `${pn(p.idx)}: the storm's blowin' ye into land! Anchor safely, or take yer chances dodging the rocks.`

Add a third case for **broke but holding crates**, built by DELETING the offer clause from the
existing string — not by writing a new one:

    `${pn(p.idx)}: the storm's blowin' ye into land!`

So: `trueShipwreck ? <unchanged> : broke ? <the truncated form> : <unchanged full form>`. The
deletion is the same operation D-46/G1 already performed on the dock lines, and D-31 justifies it
twice over: what remains of the decision is stated by the flip BUTTON, which names both
consequences. **If the truncated prompt reads badly to you, STOP and report — do not write a
replacement sentence.**

**Do NOT remove the `brokeAnchorLine` flash at `:332`.** It is NARR-02 case 2, gate-asserted since
15-02 and confirmed live this session. The narration explains a beat earlier on the commentary
surface; the greyed button explains on the decision surface. D-40's finding was that the
explanation lived only on the wrong surface — having it on both is the fix, not duplication.

Leave the G6 `coinShortfall(1,p.coins)` guard at `:341` exactly as it is.
  </action>
  <verify>
    <automated>node -e 'const s=require("fs").readFileSync("src/ui/flow.js","utf8");const i=s.indexOf("export async function windLeg"),j=s.indexOf("export async function botWindLeg"),b=s.slice(i,j);if(/if\(p\.coins>=1\)opts\.push/.test(b))throw new Error("the anchor option is still conditionally pushed");if(!/disabled:broke/.test(b))throw new Error("the anchor option is not greyed");if(!b.includes("Yer too broke to anchor"))throw new Error("Wyatts reason is missing");if(!/broke\?`Yer too broke to anchor`:null|broke \? `Yer too broke to anchor` : null/.test(b))throw new Error("the reason is not supplied conditionally — assertion 6 requires it only in the state it explains");if(!b.includes("the storm’s blowin’ ye into land!`")&&!b.includes("the storm's blowin' ye into land!`"))throw new Error("the truncated broke prompt is missing");if(!b.includes("brokeAnchorLine"))throw new Error("NARR-02 broke-anchor narration was removed");if(!/coinShortfall\(1,p\.coins\)/.test(b))throw new Error("the G6 guard was disturbed");console.log("G10 both halves in place")' &amp;&amp; node scripts/ui_contract_check.js &amp;&amp; node scripts/narration_flow_test.js &amp;&amp; npm test 2>&amp;1 | tail -6 &amp;&amp; test -z "$(git diff --stat src/engine/index.js)" &amp;&amp; echo ENGINE-CLEAN</automated>
  </verify>
  <done>
At 0 coins the anchor option renders greyed with `Yer too broke to anchor` beneath, and the prompt
no longer says "Anchor safely, or…". At 1+ coins the option is enabled, no reason is shown, and the
prompt is byte-identical to today. `trueShipwreck` is unchanged. Assertion 6 passes. `npm test`
exits 0. Engine diff empty.
  </done>
</task>

<task type="auto">
  <name>T6: G18 — a boxed-in bot escapes via the rim in the game people actually play</name>
  <files>src/ui/flow.js</files>
  <read_first>src/ui/flow.js:941-950 (botTurn's sail block), src/engine/index.js:735-743 (takeTurn's sail block — READ ONLY, the authority being mirrored), src/engine/index.js:347-372 (boxedIn + rimEscape), src/ui/util.js:1045-1060 (botBeat -> narrateCurrent, which narrates the single appState.evIdx pointer)</read_first>
  <action>
**Wyatt:** *"A boxed-in bot SHOULD escape via the rim."*

The engine's `takeTurn` (`src/engine/index.js:738-742`) already gives a walled-in bot a rim escape;
the live UI path `botTurn` (`src/ui/flow.js:944-946`) does not. So bots freeze in the game people
play and escape only in headless runs. **Fix `botTurn`. The engine is NOT touched** — `boxedIn` and
`rimEscape` are existing engine methods being CALLED, which is what makes this UI-tier.

Mirror the engine's ladder exactly, including its order (moved → rim escape → refund):

    if(p.pos moved)            { g.ev({t:"sail",p:p.idx}); await botBeat(); }
    else if(g.boxedIn(p)&&g.rimEscape(p)) { /* rimEscape recorded its own events */ await botBeat(); }
    else                        p.coins++;

Two things to confirm by reading, and to state in the comment:
  - **`rimEscape` records TWO events** — `{t:"windmove"}` at the rim cell, then `tradewind()`'s own
    `{t:"tradewind"}`. `botBeat()` is `liveRender()` + `narrateCurrent()`, and `liveRender()` pins
    `appState.evIdx` to the LAST event, so the line that plays is the tradewind sweep line
    (`src/ui/util.js:424` — *"…is blown into the trade winds and swept around the rim!"*). That is
    the right one and it is exactly what Wyatt wants a watching player to learn from.
  - **If it does not reach the screen**, narrate it explicitly with the shape `botWindLeg` already
    uses (`describeFor(ev,NEUTRAL_VIEWER)` + `flash(L.txt,null,msgHoldMs(L.txt),narrationVariants(ev))`).
    **No new copy** — that line already ships.

**Cross-reference to record in the comment:** `.planning/quick/20260730-bot-intelligence/PLAN.md`
plans to FLAG this same parity gap as a todo
(`.planning/todos/pending/bot-rim-escape-live-parity.md`, not yet written). Wyatt has now ruled it
should be FIXED. Name that plan so its flagging task becomes "verify already fixed" rather than
duplicating; T13 records the same thing in STATE.md.

**Coin accounting:** `p.coins--` has already happened at the top of the branch. A successful rim
escape KEEPS the coin spent (a move was made); only the both-failed path refunds. That is precisely
what the engine does — do not "improve" it.
  </action>
  <verify>
    <automated>node -e 'const fs=require("fs");const s=fs.readFileSync("src/ui/flow.js","utf8");const i=s.indexOf("export async function botTurn"),b=s.slice(i,i+2600);if(!/g\.boxedIn\(p\)&&g\.rimEscape\(p\)/.test(b))throw new Error("botTurn still has no rim escape");if(!/else p\.coins\+\+/.test(b))throw new Error("the refund arm was lost");const e=fs.readFileSync("src/engine/index.js","utf8");if(!/this\.boxedIn\(p\)&&this\.rimEscape\(p\)/.test(e))throw new Error("the engine authority changed — re-derive before trusting this mirror");console.log("G18 botTurn now mirrors takeTurns rim escape")' &amp;&amp; node scripts/bot_storm_narration_test.js &amp;&amp; node scripts/determinism_baseline.js --verify 2>&amp;1 | tail -3 &amp;&amp; npm test 2>&amp;1 | tail -6 &amp;&amp; test -z "$(git diff --stat src/engine/index.js)" &amp;&amp; echo ENGINE-CLEAN</automated>
  </verify>
  <done>
`botTurn`'s sail block has three arms in the engine's own order. A walled-in bot in a live game
sweeps to its arc head and the sweep line reaches the panel. `determinism_baseline.js --verify` is
31/31 (`botTurn` is not on the headless path, so this must not move). `npm test` exits 0. Engine
diff empty.
  </done>
</task>
<task type="auto">
  <name>T7: G25 — D-55 pulled forward: ONE function builds both sail-highlight rects</name>
  <files>src/ui/flow.js, .planning/how-to-play-pastry-pirates.md</files>
  <read_first>src/ui/flow.js:212-234 (localPickCell — the host rect, with its UI-06 comment), src/ui/flow.js:1331-1348 (remotePickHighlights — the guest rect, and the D-55/D-56 comment deferring this to Phase 16), index.html:423-432 (.sailCell, .sailCell:hover, @keyframes sailBounce, the prefers-reduced-motion rule), .planning/how-to-play-pastry-pirates.md:113-140 (the harness notes and "Mistakes to not repeat")</read_first>
  <action>
**Wyatt, asked whether the four host/guest drifts were structurally fixed so they cannot drift
again:** *"yes, add it and pull D-55 forward."* Deferred to Phase 16 twice; it is the last of the
four that was never fixed at all.

**The gap, measured.** The host (`localPickCell:224`) draws
`{…,rx:6, fill:"#ffc23a", class:"sailCell", style:"cursor:pointer;animation-delay:${((c[0]+c[1])%4)*0.12}s"}`.
The guest (`remotePickHighlights:1339`) draws
`{…,rx:5, fill:"#fdb63d", opacity:.4, style:"cursor:pointer"}` and **no class at all**. So a guest's
move options are a different orange, dimmer, don't pulse, don't respond to the cursor and ignore
`prefers-reduced-motion`. Two players in one game look at materially different boards.

**Fix by construction, not by copying attributes.** Copying the host's attribute list into the guest
is the same "match by discipline" that produced four drifts. Extract ONE builder and call it from
both:

    export function sailHighlightRect(c,cellPx,svg){ …the host's exact attribute set… }

placed beside `sailPickMsg` (`:191`) — the existing home for "the one thing both transports share"
— and called by `localPickCell` and `remotePickHighlights`, each of which keeps its own
`addEventListener("click", …)` and its own `hs.push(r)`. After this there is exactly one place in
the codebase that decides what a sail square looks like.

**The resulting attributes must equal today's HOST attributes exactly**, including `rx:6`, the
`fill:"#ffc23a"` and the per-square `animation-delay` stagger. Note in the comment WHY the inline
`fill` stays: `.sailCell` sets `opacity`, `animation`, `transform-box/origin` and `transition` but
**does NOT set `fill`** (verified at `index.html:424-426`), so dropping the inline fill would give
both boards default-black squares. The guest's `opacity:.4` goes — `.sailCell` supplies `.5`, and
the keyframes animate it.

**Then correct `.planning/how-to-play-pastry-pirates.md` in this same commit.** Two places now
describe a world that no longer exists, and a stale harness note is worse than none — it cost three
turns of clicking "Stay put":
  - the harness bullet at `:118-122` ("Guest boards render sail highlights WITHOUT the `.sailCell`
    class… Detect by `cursor:pointer` / fill") → guest and host squares are now identical and
    `.sailCell` is the correct selector on both. Keep the grid-coordinate derivation
    (`Math.round((x − 2) / cellPx)`), which is still right.
  - "Mistakes to not repeat" item 2 ("Selecting `.sailCell` as a guest. Silent…") → rewrite as
    history: it was true until 2026-07-30, and here is what changed. Same treatment the
    Manhattan-distance correction got earlier today — correct the record, do not silently delete it.
  </action>
  <verify>
    <automated>node -e 'const fs=require("fs");const s=fs.readFileSync("src/ui/flow.js","utf8");const rects=(s.match(/el\("rect"/g)||[]).length;const b=(s.match(/class:"sailCell"/g)||[]).length;if(b!==1)throw new Error("expected exactly ONE sailCell rect builder, found "+b);if(!/export function sailHighlightRect\(/.test(s))throw new Error("the shared builder is missing");for(const fn of ["localPickCell","remotePickHighlights"]){const i=s.indexOf("export function "+fn);const body=s.slice(i,i+1400);if(!/sailHighlightRect\(/.test(body))throw new Error(fn+" does not call the shared builder");if(/el\("rect"/.test(body))throw new Error(fn+" still builds its own rect");}if(/fill:"#fdb63d"/.test(s))throw new Error("the guest fill survives");const h=fs.readFileSync("index.html","utf8");if(/\.sailCell\s*\{[^}]*fill\s*:/.test(h))throw new Error("STOP: .sailCell now sets fill — re-derive whether the inline fill should stay");const doc=fs.readFileSync(".planning/how-to-play-pastry-pirates.md","utf8");if(/render sail highlights WITHOUT the `\.sailCell` class/.test(doc))throw new Error("the stale harness note survives");console.log("G25 one builder, both callers, harness note corrected")' &amp;&amp; node scripts/module_graph_check.js &amp;&amp; node scripts/no_undef_check.js &amp;&amp; npm test 2>&amp;1 | tail -6 &amp;&amp; test -z "$(git diff --stat src/engine/index.js)" &amp;&amp; echo ENGINE-CLEAN</automated>
    <human-check>
On a guest seat, take a turn and look at the yellow sail squares beside the host's. Same orange,
same soft bounce, and hovering one should pop it. This is the check the gate in T8 cannot make.
    </human-check>
  </verify>
  <done>
`src/ui/flow.js` contains exactly one `class:"sailCell"` rect builder; both pick paths call it and
neither builds a rect of its own. Guest and host squares are attribute-identical.
`.planning/how-to-play-pastry-pirates.md` describes the world as it now is, with the old behaviour
kept as dated history. `npm test` exits 0. Engine diff empty.
  </done>
</task>

<task type="auto">
  <name>T8: G26 — the host/guest parity gate D-56 recommended and nobody wrote (npm test 16 → 17)</name>
  <files>scripts/host_guest_parity_check.js, package.json, .planning/STATE.md</files>
  <read_first>scripts/ui_contract_check.js:1-100 and :660-700 and :700-760 (house conventions: assertion structure, the results array, and the `--drill` synthetic-fixture harness), src/ui/flow.js:72-101 (localAsk's rendered markup), src/orchestrator.js:963-1020 (watchPrompt's ask branch — the guest's re-render of the same prompt), .planning/STATE.md:~155-165 (the blocker note stating npm test is at 16 gates, not 17)</read_first>
  <action>
**Sequencing: T7 must be committed before this task.** D-56's own words are the reason this exists:
those renderers *"match by discipline, not by structure — nothing enforces it, and nothing would
notice if they diverged tomorrow."* Four drifts later that prediction is the whole problem.

New standalone gate `scripts/host_guest_parity_check.js`, static source scan, no DOM — the same
technique `ui_contract_check.js` and `no_undef_check.js` already use. Follow that file's conventions
exactly: named assertions, a results array, `PASS`/`FAIL` lines, `process.exit(failures?1:0)`, and a
`--drill` mode that proves each assertion CAN fail against synthetic fixtures under `os.tmpdir()`.

**Assertion 1 — prompt class vocabulary parity.** Extract the set of panel class tokens each side
emits for an equivalent prompt: `localAsk` (`src/ui/flow.js`) vs `watchPrompt`'s `p.kind==="ask"`
branch (`src/orchestrator.js`). Vocabulary: `apBack`, `apMsg`, `apBtns`, `apBtn`, `apDisabled`,
`apSub`, and the ` recipes` grid modifier. Require the two SETS to be equal. **Fail loudly, naming
the class present on one side and missing on the other** — that message is the whole value of the
gate. Both sides satisfy this today (verified during planning); the gate exists so the next edit to
one cannot silently skip the other.

**Assertion 2 — one sail-highlight builder.** In `src/ui/flow.js`: exactly one rect builder carries
`class:"sailCell"`; both `localPickCell` and `remotePickHighlights` call the shared function; neither
contains an `el("rect"` of its own. This is T7's fix, made permanent.

**Red-proof it BOTH ways.**
  - *Shipped:* synthetic `--drill` fixtures — one where the guest branch is missing `apDisabled`,
    one where `remotePickHighlights` builds its own class-less rect. Both must FAIL. This is the
    form that ships because it cannot rot.
  - *One-off:* run the check's functions against the pre-T7 tree via
    `git show <T7-parent-sha>:src/ui/flow.js`, confirm assertion 2 goes RED, and **record that
    output verbatim in the SUMMARY.** Do NOT hardcode a SHA into the gate — a pinned SHA rots and
    turns a real assertion into decoration.

**Wire it into `package.json`'s `test` script.** This is the ONE place in this plan where `npm test`
grows, 16 gates → 17.

**Then correct `.planning/STATE.md` precisely.** Its blocker note says *"`npm test` is at **16**
gates, not 17"* while describing the never-built `scripts/narration_copy_check.js`. After this task
`npm test` is at 17 gates **and `narration_copy_check.js` still does not exist**. Reword so nobody
can read the new count as "the copy check got built" — name both facts in the same sentence. Add the
parity gate to the same section as a NEW standing protection, citing D-56 and the four drifts it
covers (D-35 wording, D-55 highlights, F7 delivery already gated by assertion 7, and the class
vocabulary).

**Scope discipline — do NOT unify `flash()` and `showNarration()` in this pass.** They remain two
independent hold/fade schedulers on the same `.apMsg` (the D-57 residue the Phase 15 verifier called
"benign today but unenforced"). It is real, but it is a refactor of live narration timing and T10 is
already changing that code. T13 records it as a known-unenforced item instead.
  </action>
  <verify>
    <automated>node scripts/host_guest_parity_check.js &amp;&amp; node scripts/host_guest_parity_check.js --drill &amp;&amp; node -e 'const p=require("./package.json");const n=(p.scripts.test.match(/node scripts\//g)||[]).length;if(n!==17)throw new Error("expected 17 gate scripts in npm test, found "+n);if(!/host_guest_parity_check/.test(p.scripts.test))throw new Error("the parity gate is not wired into npm test");const st=require("fs").readFileSync(".planning/STATE.md","utf8");if(/is at \*\*16\*\* gates, not 17/.test(st))throw new Error("STATE.md still claims 16 gates");if(!/narration_copy_check/.test(st))throw new Error("STATE.md no longer records that the copy check is still unbuilt")' &amp;&amp; npm test 2>&amp;1 | tail -8 &amp;&amp; test -z "$(git diff --stat src/engine/index.js)" &amp;&amp; echo ENGINE-CLEAN</automated>
  </verify>
  <done>
`scripts/host_guest_parity_check.js` exists, passes against the tree, and `--drill` proves both
assertions can fail. `npm test` runs 17 gates and exits 0. STATE.md states the new count AND that
`narration_copy_check.js` is still unbuilt, in terms that cannot be confused. The `git show`
red-proof output is recorded in the SUMMARY. Engine diff empty.
  </done>
</task>

<task type="auto" tdd="true">
  <name>T9: G15 — the board is painted before the line describing it is narrated, and a gate says so</name>
  <files>src/ui/flow.js, scripts/narration_flow_test.js</files>
  <read_first>src/ui/flow.js:292-380 (all of windLeg), src/ui/flow.js:392-435 (botWindLeg, which does it RIGHT and carries a comment describing this exact bug), scripts/narration_flow_test.js:63-74 (the two assertions that currently pin the WRONG order), scripts/narration_flow_test.js:50-62 (extractFn/lineOf, the source-slicing helpers to reuse)</read_first>
  <behavior>
    - Inside `windLeg`, every `await narrateLastEvent()` is preceded — since the most recent `ev(` before it — by a paint (`liveRender()` or `renderLiveShips()`). No exceptions.
    - The gate expresses that as an INVARIANT over windLeg's body, not as a literal pin on three specific lines, so a fourth branch added later is covered for free.
    - The gate names the offending branch when it fails, not just "windLeg is wrong".
    - `botWindLeg`'s existing paint-then-narrate order is asserted too, so the two paths cannot fork back apart.
  </behavior>
  <action>
**Wyatt:** *"the storm animation didn't move your boat until AFTER the message disappeared… is there
a way to make the movement happen before the message, for all movements during all storms?"*

**The real defect is that the file holds BOTH orders with nothing enforcing which is right.**
`botWindLeg:400-405` not only does it correctly, it carries a comment describing this exact bug —
and that comment asserts the human path "already uses" the right order, which is true of the ONE
line it cites (`windLeg:374-375`, the rim sweep) and false of its siblings.

**Fix every `narrate`-before-`paint` pair inside `windLeg`.** Today: `:299` (`blocked`), `:307`
(`moored` — the one he hit), `:310` (`anchorHold`), `:341` (`dodge`) and `:356` (the
anchor/aground/shipwrecked outcome). Each becomes `ev(…); liveRender(); await narrateLastEvent();`.
The trailing `liveRender()` at `:359` may stay — it is harmless and after `dodgedOnce.v=true`.

Be honest in the comment about WHAT each fix buys, because it differs by branch and a future reader
who checks will otherwise think the comment is wrong:
  - `moored` / `anchorHold` / `blocked` — the ship does not move on that square, so the visible
    change is small; what these buy is the INVARIANT, so no future branch inherits the wrong order.
  - `dodge` / `aground` / `shipwrecked` — coins and crates change, and the panel should show the new
    purse before the line describing it.
  - The genuinely visible lag Wyatt watched is the trade-wind sweep, which is **G14/T12** — say so
    and cross-reference, so nobody reads this task as having fully answered his report.

**Then add the gate**, replacing the two literal pins at `narration_flow_test.js:68-73`. Those pins
assert the CURRENT (wrong) order for `moored` and `anchorHold`, so they go correctly red — re-pin in
this same commit, as an invariant rather than three literals:

    split windLeg's body on `await narrateLastEvent()`; for each occurrence take the text back to
    the previous `ev(` and require it to contain `liveRender()` or `renderLiveShips()`.

Keep named per-branch checks for `blocked`/`moored`/`anchorHold` alongside it so a failure says
WHICH branch. Add the mirror assertion for `botWindLeg`. Update the file's header (`:4-11`), which
still describes Task 1 as "*windLeg's anchorHold branch awaits narrateLastEvent() before
liveRender()*" — that sentence is now the opposite of the rule and must be rewritten to record that
D-13's requirement (the anchorHold line must PLAY AT ALL) is preserved while its incidental ordering
is corrected by G15.

**Then sweep and REPORT, do not change.** There are further `await narrateLastEvent(); liveRender();`
pairs outside `windLeg` — around `:478` and `:532` (humanDock), `:658` and `:696` (humanTrade),
`:794` (attack), `:801` (fish). For each, state in the SUMMARY whether it is genuinely
movement-related or harmless. Changing them is NOT in this task's scope: Wyatt scoped his ask to
"all movements during all storms", and a docking flip moves no ship.
  </action>
  <verify>
    <automated>node -e 'const s=require("fs").readFileSync("src/ui/flow.js","utf8");const b=s.slice(s.indexOf("export async function windLeg"),s.indexOf("export async function botWindLeg"));const parts=b.split("await narrateLastEvent()");let bad=0;for(let i=1;i<parts.length;i++){const seg=parts[i-1];const k=seg.lastIndexOf("ev(");const since=k<0?seg:seg.slice(k);if(!/liveRender\(\)|renderLiveShips\(\)/.test(since))bad++;}if(bad)throw new Error(bad+" narrateLastEvent() call(s) in windLeg still narrate before painting");if(/\}\);await narrateLastEvent\(\);liveRender\(\);/.test(b))throw new Error("an ev-then-narrate-then-paint pair survives in windLeg");console.log("G15 windLeg paints before it narrates, "+(parts.length-1)+" call site(s) checked")' &amp;&amp; node scripts/narration_flow_test.js &amp;&amp; node scripts/bot_storm_narration_test.js &amp;&amp; node scripts/storm_moored_reason_test.js &amp;&amp; npm test 2>&amp;1 | tail -6 &amp;&amp; test -z "$(git diff --stat src/engine/index.js)" &amp;&amp; echo ENGINE-CLEAN</automated>
  </verify>
  <done>
Every `narrateLastEvent()` inside `windLeg` is preceded by a paint. `narration_flow_test.js` asserts
that as an invariant over the whole function plus named per-branch checks, and mirrors it for
`botWindLeg`; its header no longer states the old order as the rule. The out-of-scope pairs are
listed with verdicts in the SUMMARY. `npm test` exits 0. Engine diff empty.
  </done>
</task>
<task type="auto">
  <name>T10: G17 — the fade becomes a STRICT sequence: fade out, THEN show</name>
  <files>src/ui/panel.js, index.html</files>
  <read_first>src/ui/panel.js:195-254 (the G8 header block and panel(), including the ghost clone), src/ui/panel.js:255-271 (resizePanel), src/ui/panel.js:298-344 (typewriterReveal and REVEAL_MS_PER_CHAR), src/ui/panel.js:347-398 (the F6/G8 comment block and showNarration), src/ui/panel.js:489-512 (flash — it awaits `_revealDone` the instant panel() returns), index.html:262-283 (the .apMsg.fadeOut ghost rule, @keyframes apMsgFadeOut, #apGridInner position, the reduced-motion rule)</read_first>
  <action>
**Wyatt, overriding this morning's G8:** *"please fade the current line, THEN show the next"* — and
he waved off the pacing objection explicitly: *"if we need to shorten the 'hold' time to counteract
that fade, we will do that later… you can stop taking so much concern for 'dragging' — that's on me
to decide."*

G8 shipped a 180ms OVERLAP cross-fade: the ghost fades while the incoming line types in underneath.
He wants them SEQUENTIAL.

**The mechanism, which is the whole of the task.** `panel()` must stay fully SYNCHRONOUS — `flash()`
reads `.apMsg._revealDone` the instant it returns (`:496`), so a deferred swap hands it the wrong
element or none. The resolution: keep replacing the DOM synchronously, and delay only the REVEAL.

`typewriterReveal()` already blanks every text node (`n.nodeValue=""`) and sets every `<img>` to
`opacity:0` the moment it is called — so the incoming line is **genuinely invisible until its first
tick**. Give it a third parameter:

    export function typewriterReveal(msgEl,msPerChar,startDelayMs=0)

implemented as `const start=performance.now()+startDelayMs;` with the target clamped
(`Math.min(total,Math.max(0,Math.floor((performance.now()-start)/msPerChar)))`) so a negative
elapsed reveals nothing and the poll loop keeps scheduling. `panel()` then passes
`ghost?GHOST_FADE_MS:0`. Result: the outgoing line fades over 180ms with the box empty beneath it,
then the new line types in. A strict sequence, and `panel()` never awaits anything.

**Chosen durations, stated as Wyatt asked:** the ghost fade stays **180ms** (`.18s`) — the number he
already looked at this morning, unchanged so only ONE variable moves — and the incoming reveal
starts at **+180ms**. Total added latency per replaced line: 180ms, paid deliberately, his call.
Export `const GHOST_FADE_MS=180;` from `panel.js` and make the comment on it and the comment on
index.html's `.18s` each name the other as the value that must move with it. Those are the only two
places the number lives.

**Reduced motion.** `@media (prefers-reduced-motion: reduce)` sets `.apMsg.fadeOut{display:none}`,
so there is no fade to wait for — a CSS media query cannot reach the JS delay, so read it in
`panel()`: `window.matchMedia("(prefers-reduced-motion: reduce)").matches` → delay 0. Without this,
a reduced-motion user gets a blank 180ms gap and no fade, which is the worst of both.

**Preserve, explicitly, every property measured good this morning** (say each in the comment):
`pointer-events:none` on the ghost (it is load-bearing — `panel()` also renders prompts with
buttons); `position:absolute; inset:0` so `resizePanel`'s `inner.offsetHeight` still measures only
the incoming message and the panel height moves 0px across a swap; the `animationend` + 250ms
`setTimeout` belt; `panel()` synchronous.

**F6 stands and is NOT reintroduced as fade-to-empty.** The ghost is created only when the incoming
`html` is non-empty, so a trailing line still never fades — verified live over 200 lines this
session. The explicit-clear path (a caller passing empty content) still empties and hides the panel
instantly, with no ghost.

**Rewrite both comment blocks** — `panel()`'s header (`:197-223`) and the F6/G8 paragraph in
`showNarration`'s block (`:374-383`). They currently argue FOR the overlap and explain why a strict
sequence was not chosen. Record honestly: the objection was real, Wyatt heard it and overruled it,
the cost is 180ms per line, and the rejected 500ms version is still kept as history. Do not delete
the rejection paragraph.

**Do not touch** `MSG_HOLD_MULTIPLIER` (0.72), `msgHoldMs`, `chatBubbleHoldMs`, the `await sleep(…)`
hold in `flash()`, or `showChatBubble`'s own `fadeOut` usage (bubbles run their own curve, D-15). If
the pacing needs adjusting he will say so — his words: *"we will do that later"*.
  </action>
  <verify>
    <automated>node -e 'const fs=require("fs");const p=fs.readFileSync("src/ui/panel.js","utf8");if(!/GHOST_FADE_MS\s*=\s*180/.test(p))throw new Error("GHOST_FADE_MS=180 is missing");if(!/typewriterReveal\(msgEl,msPerChar,startDelayMs\s*=\s*0\)/.test(p))throw new Error("typewriterReveal did not gain a start delay");if(!/prefers-reduced-motion/.test(p))throw new Error("panel() does not zero the delay under reduced motion");const body=p.slice(p.indexOf("export function panel("),p.indexOf("export function resizePanel"));if(/await |async /.test(body))throw new Error("panel() must stay synchronous — flash() reads .apMsg immediately after it returns");if(!/pointer-events/.test(fs.readFileSync("index.html","utf8")))throw new Error("the ghost lost pointer-events:none");const h=fs.readFileSync("index.html","utf8");if(!/\.apMsg\.fadeOut\s*\{[^}]*\.18s/.test(h))throw new Error("the CSS fade is no longer .18s");if(!/\.apMsg\.fadeOut\s*\{[^}]*position:\s*absolute/.test(h))throw new Error("the ghost is no longer out of flow");console.log("G17 strict sequence: 180ms fade, then reveal; panel() synchronous")' &amp;&amp; npm test 2>&amp;1 | tail -6 &amp;&amp; test -z "$(git diff --stat src/engine/index.js)" &amp;&amp; echo ENGINE-CLEAN</automated>
    <human-check>
**Blocking — this is one of only two taste calls in the plan.** In a two-tab game watch four or five
narration lines replace each other. The outgoing line should finish fading before the next begins to
type. Then stop on a trailing line (the end of a bot turn) and confirm it stays up indefinitely and
never fades. Is 180ms right, or should the fade be quicker/slower?
    </human-check>
  </verify>
  <done>
A replaced line fades fully over 180ms and only then does the next begin to type. A trailing line
never fades. An explicit empty clear still hides the panel instantly. `panel()` is still
synchronous, the ghost is still `pointer-events:none` and out of flow, and the panel height still
moves once per message. Reduced motion gets no delay and no fade. `npm test` exits 0. Engine diff
empty.
  </done>
</task>

<task type="auto" tdd="true">
  <name>T11: G19 — every client in a room sees the SAME rain, retuned to the measured midpoint</name>
  <files>src/ui/board.js, scripts/ui_contract_check.js</files>
  <read_first>src/ui/board.js:1-30 (the file header's BYTE-IDENTICAL / Safari BUG-01 warning — read this before editing anything in this file), src/ui/board.js:248-275 (buildStormLayers), src/ui/board.js:445-455 (its lazy call site inside render()), src/engine/index.js:52-55 (Game stores `this.seed` — READ ONLY), src/shared/index.js (mulberry32 is exported), index.html:87-111 (#stormOverlay and .rlayer CSS)</read_first>
  <behavior>
    - `stormLayerSpecs(seed)` is pure: same seed in, byte-identical specs out, every time, in any browser.
    - Two different seeds give visibly different rain — the per-layer jitter is KEPT, so variation moves from between PLAYERS to between GAMES.
    - Four layers, as today. Each spec carries tile scale, fall duration, start phase, X offset and opacity.
    - The mean fall duration is centred on 0.676s and the mean tile width on 240×0.969 — the midpoint of the two screens measured live.
    - Nothing in the storm-rain path calls `Math.random()`, and nothing calls `game.r()`.
  </behavior>
  <action>
**Measured live this session, on two screens in the same room:** Wyatt's rain averaged 0.818s /
200.5px, Claude's 0.534s / 264.7px, drawn from a 0.43–1.07s and 0.66–1.34× range.
`buildStormLayers` (`src/ui/board.js:254`) jitters four layers with **unseeded `Math.random()`**,
builds them once per browser and caches them — so every player gets permanently different weather.

**Two changes, both inside `buildStormLayers`.**

**(a) Seed it from the game (his option 1).** Extract the pure part:

    export function stormLayerSpecs(seed){ …four specs from mulberry32(seed)… }

and have `buildStormLayers(ov,seed)` apply them to the divs exactly as today. Pass
`appState.game.seed` from the call site inside `render()` (`:452`) — one extra argument, nothing
else on that line moves.

**`mulberry32(seed)`, NEVER `appState.game.r()`.** This is the single most important line in the
task: `game.r()` is the seeded GAME stream, and drawing four extra numbers from it would desync
every client and every one of the 31 determinism fixtures. A private RNG seeded from the same number
gives identical rain in every browser in the room while consuming nothing. `mulberry32` is already
exported from `src/shared/index.js`; add it to `board.js`'s existing import list. If `game` or
`game.seed` is absent (the decorative demo board), fall back to a fixed literal seed rather than
`Math.random()` — a demo board that looks the same every load is fine and keeps the "no unseeded
randomness in the rain" property absolute.

**(b) Retune to the measured midpoint (his option 3).** *"let's split the difference between our two
screens' settings right now to use as the new target setting."*
  - base speed `0.75` → **`0.676`** (the midpoint of 0.818 and 0.534)
  - base tile scale **`×0.969`** — introduce `BASE_SCALE=0.969` so `scale=BASE_SCALE*(1+sp*0.4*JIT)`.
    240 × 0.969 = 232.6px, the midpoint of 200.5 and 264.7. Write that arithmetic in the comment.
  - **Keep `LAYERS=4` and `JIT=0.86` exactly.** The jitter is what gives the rain depth; his words
    were to keep it. `--drop` derives from `scale` (`PERIOD*scale`), so the seamless loop follows
    the new base for free — say so, because that coupling is easy to break later.

**The file header forbids restructuring this function** ("moved BYTE-IDENTICAL… do not refactor,
clean up, re-animate, or reorder anything inside them" — the v1.0 Safari storm-crash fix). This
change is a deliberate, scoped exception and the header must record it: what the Safari fix actually
protects is the pre-baked PNG tile and the absence of live gradients/masks and per-frame work — none
of which changes here. Swapping the RNG source and retuning two constants does not reintroduce any
of it. **Add that paragraph to the header in the same commit**, or the next reader is entitled to
revert this.

**Then add the standing protection to `scripts/ui_contract_check.js`** as a new assertion (an
assertion in an EXISTING gate — `npm test` stays at 17): the `buildStormLayers` / `stormLayerSpecs`
region of `src/ui/board.js` contains zero `Math.random(` and zero `.r()`. Scope it to those
functions by content anchor — `Math.random()` is legitimate elsewhere in `src/ui/` (session id, room
code, pop jitter, the demo-board seed), so a file-wide or tree-wide ban would be wrong and would be
widened away the first time it fired. Give it a `--drill` fixture proving it fails, per this file's
own convention.
  </action>
  <verify>
    <automated>node -e 'import("./src/ui/board.js").then(m=>{const a=m.stormLayerSpecs(12345),b=m.stormLayerSpecs(12345),c=m.stormLayerSpecs(999);if(JSON.stringify(a)!==JSON.stringify(b))throw new Error("stormLayerSpecs is not deterministic for one seed");if(JSON.stringify(a)===JSON.stringify(c))throw new Error("two different seeds give identical rain — the jitter was lost");if(a.length!==4)throw new Error("expected 4 layers, got "+a.length);const dur=a.map(s=>parseFloat(s.dur!=null?s.dur:s.duration));const scale=a.map(s=>parseFloat(s.scale));const mean=x=>x.reduce((p,q)=>p+q,0)/x.length;console.log("mean dur",mean(dur).toFixed(3),"mean scale",mean(scale).toFixed(3));const src=require("fs").readFileSync("src/ui/board.js","utf8");const i=src.indexOf("export function stormLayerSpecs"),j=src.indexOf("export function buildStormLayers"),lo=Math.min(i,j),hi=Math.max(i,j);const region=src.slice(lo,src.indexOf("\nexport ",hi+10));if(/Math\.random\(/.test(region))throw new Error("the rain still draws unseeded randomness");if(/\.r\(\)/.test(region))throw new Error("the rain draws from the GAME rng — this desyncs every client and every fixture");if(!/0\.676/.test(region)||!/0\.969/.test(region))throw new Error("the retuned constants are not present");if(!/LAYERS\s*=\s*4/.test(region)||!/JIT\s*=\s*0\.86/.test(region))throw new Error("LAYERS or JIT was changed — both must stay");console.log("G19 seeded, deterministic, retuned, jitter kept");}).catch(e=>{console.error(e.message);process.exit(1)})' &amp;&amp; node scripts/ui_contract_check.js &amp;&amp; node scripts/ui_contract_check.js --drill &amp;&amp; node scripts/determinism_baseline.js --verify 2>&amp;1 | tail -3 &amp;&amp; npm test 2>&amp;1 | tail -6 &amp;&amp; test -z "$(git diff --stat src/engine/index.js)" &amp;&amp; echo ENGINE-CLEAN</automated>
    <human-check>
**Blocking — the second of the two taste calls.** Force a storm and look at the rain (per the
project memory: a temporary `cfg.storm=1` — **revert it** — and a fresh server port, because Safari
caches ES modules per URL). It should read as the midpoint between the two screens compared this
morning: a touch faster than Wyatt's and a touch finer than Claude's. Right, or does it want another
nudge? Also confirm in **Safari** that the storm still runs smoothly — this file carries the v1.0
Safari crash fix.
    </human-check>
  </verify>
  <done>
`stormLayerSpecs(seed)` is pure and deterministic; two clients in a room render identical rain and
two different games do not. Base speed 0.676, base tile scale ×0.969, `LAYERS=4` and `JIT=0.86`
untouched. `board.js`'s header records the scoped Safari exception. `ui_contract_check.js` fails if
the rain ever draws unseeded or game randomness again, and `--drill` proves it. 31/31 determinism.
`npm test` exits 0. Engine diff empty.
  </done>
</task>
<task type="auto" tdd="true">
  <name>T12: G14 — the trade winds sweep square-by-square, for solo, host AND guest, from ONE stepper</name>
  <files>src/ui/board.js, src/ui/flow.js, src/ui/util.js, src/orchestrator.js, scripts/narration_flow_test.js, scripts/host_guest_parity_check.js</files>
  <read_first>src/engine/index.js:56-93 (rim + rimHead + rimCellInfo construction — READ ONLY; note `cells` is the ORDERED ring, arcs are CONTIGUOUS slices of it, and `heads[c.q]=c` makes the LAST cell of each arc its head), src/engine/index.js:244-251 (tradewind) and :361-372 (rimEscape) and :300-304 (windPush's internal sweep), src/ui/flow.js:370-380 (windLeg's rim branch) and :773-775 and :865-867 (the two sail sites), src/ui/board.js:318-344 (renderLiveShips, including the duplicated active-ring scan and its comment explaining why it was duplicated), src/ui/board.js:345-360 (render()'s ship loop — it draws from `events[evIdx].state`, which is why the guest can render at all), src/ui/util.js:199-205 (shipXY and its shared-cell nudge) and :905-930 (STORM_STEP_MS / BOT_STORM_STEP_MS and the header explaining why they are named constants), src/orchestrator.js:951-962 (watchEvents — the guest's whole render path), src/ui/util.js:1303-1307 (fixEv — it preserves `state`)</read_first>
  <behavior>
    - `rimSweepPath(game,from)` is pure and DOM-free: given a rim cell it returns the ordered ring cells from just AFTER it up to and INCLUDING its arc head. Never includes `from`.
    - Every returned cell satisfies `game.onRim(c)`, and the last equals `game.rimHead[from]`.
    - Consecutive returned cells are king-move adjacent (|dx|≤1, |dy|≤1, never both 0) — proof it is a real ring walk and not a jump.
    - `from` already AT its arc head returns `[]`. A non-rim cell returns `[]`. A non-round board returns `[]`.
    - Holds over at least 12 seeds and every rim cell on each — the arc layout is randomised per game.
    - One stepper serves host and guest: `src/orchestrator.js` contains no rim walk of its own and never reads `rimCellInfo` or `rimHead`.
  </behavior>
  <action>
**Wyatt:** *"the tradewinds to move players square-by-square, quickly… then we don't need a new
narration line, and the players are just seeing what happens."* He watched a storm push a bot onto
the rim and the sweep return him invisibly, so the boat appeared not to move.

**The guest can do this too, and the earlier claim that it needed the event stream was wrong.** A
storm push is SIMULATION — intermediate squares depend on collisions, docks, other ships and the
aground ladder, which a guest cannot replay from one event; that is why STORM-02 is parked. **A rim
sweep is pure geometry between two known points on a static ring.** `rimCellInfo` (`:92`) is the
ordered, arc-tagged ring, built once at construction from board layout, and a guest's game object
carries it identically. Different class of problem. Say that in the comment so the conflation is not
repeated.

**Build it in four pieces. Write the pure one FIRST and its tests before the rest.**

**1. `rimSweepPath(game,from)` — pure, exported from `src/ui/flow.js`** beside `counterHeadroom` and
`coinShortfall` (the established home for pure, headlessly-tested helpers). Find `from`'s index in
`game.rimCellInfo` by its `"x,y"` key, find its arc head's index, return
`rimCellInfo.slice(fromIdx+1, headIdx+1)` as `[x,y]` pairs. Return `[]` for a non-round board, an
absent `rimCellInfo`, a cell not on the ring, or a `from` already at the head. Record in the comment
the two structural facts that make the slice correct — arcs are contiguous in `cells`, and each
arc's head is its LAST member, so `headIdx >= fromIdx` always, within one arc, no wraparound.

**2. `paintShipAt(seat,c)` — exported from `src/ui/board.js`.** Moves ONE ship element to an
arbitrary cell without touching game state or the event stream. Basis for `shipXY`'s shared-cell
nudge: `appState.game.events[appState.evIdx].state` with that one seat's `pos` overridden, falling
back to `appState.game.players` if there is no event yet. **This is what makes the stepper shared**:
`renderLiveShips()` reads `players[i].pos`, which on a GUEST never updates, so it cannot be reused —
say that in the comment, it is the reason this function exists. Also move the seat's chat bubble
(as `renderLiveShips` does) and the active-turn ripple if that seat is the one ringed. For the
ripple, **extract the who-is-active scan out of `renderLiveShips` into a module-local helper and
have both call it** — `renderLiveShips`'s own comment says it was duplicated only because the header
forbids touching `render()`; `render()` keeps its copy and is NOT touched, so this removes the
duplication rather than adding a third.

**3. `animateRimSweepIfAny()` — async, exported from `src/ui/flow.js`. ONE trigger rule, both
tiers.** No parameters, so no call site can pass something different from another:
  - Take the LAST event. Return immediately unless `t==="tradewind"`.
  - `to` = that event's `state[seat].pos`; `from` = the PREVIOUS event's `state[seat].pos`.
  - Return immediately unless `game.onRim(from)` and `rimSweepPath(game,from)` is non-empty and ends
    exactly at `to`. **Never invent a path.**
  - Otherwise walk it: `paintShipAt(seat,c); await sleep(RIM_SWEEP_STEP_MS);` per cell, then
    `paintShipAt(seat,to)` in a `finally` so an interruption cannot strand the ship mid-arc.
  - Guard re-entry with a **module-local last-animated event index**. Do NOT stamp a flag onto the
    event object — the host broadcasts events verbatim (`pushEvents`, `JSON.parse(JSON.stringify(...))`),
    so an extra field would leak into the Firebase payload and can trip `net_contract_check.js`.

  Where the derivation holds, and where it does not — write BOTH lists into the comment:
    - **Works:** a human sailing into the rim (`sail` event is emitted AT the entry cell), a human
      storm push onto the rim (`windmove`/`blownOut` likewise), and the engine's `rimEscape`
      (`windmove` at the rim cell, then the sweep) — which is exactly the bot-teaching case T6 just
      turned on.
    - **Falls back to today's instant render:** the engine's internal `windPush` sweep (bot storm),
      which emits nothing between stepping onto the rim and sweeping, and the battle-flee sweep
      (`orchestrator.js:570`), where `def.pos=dest` is not recorded before `tradewind` runs. Both
      render exactly as they do today — no regression, and no invented path. Note that closing this
      residue would need the entry cell in the event stream, i.e. the STORM-02 class, which stays
      parked on its own merits and is **not** added to the re-record batch.

**4. `RIM_SWEEP_STEP_MS` in `src/ui/util.js`**, beside `STORM_STEP_MS`/`BOT_STORM_STEP_MS` (that
header says they are named constants precisely so pacing is tunable without a code hunt). Derive it
from the existing constant rather than inventing a number: `Math.round(BOT_STORM_STEP_MS/4)` ≈ 95ms.
Reason for the comment: an arc can span nearly half the rim (`src/engine/index.js:70-73`), so a
storm-paced 420ms per square would run six seconds; and because the ship element carries a
`transform .35s` CSS glide, a sub-glide cadence reads as one continuous sweep ALONG the ring rather
than a row of hops — which is what "square-by-square, quickly" should look like. One constant, so
host and guest are paced identically by construction.

**Call sites — the same one call, five times, four host and one guest:**
  - `src/ui/flow.js:375`, `:774`, `:866`: `if(g.tradewind(p)){await animateRimSweepIfAny();liveRender();await narrateLastEvent();}` (paint before narrate — G15's rule).
  - `src/ui/flow.js` botTurn's rim escape (T6's new arm): `await animateRimSweepIfAny();` before `botBeat()`.
  - `src/orchestrator.js:570` battle flee: after `tradewind(def)`; it will no-op today per the
    fall-back rule above, and that is correct — the call site is there so it starts working for free
    if that path ever records the entry cell.
  - **`src/orchestrator.js` `watchEvents` (the guest).** Push the event and set `appState.evIdx`
    FIRST — before any await, so a second event arriving mid-sweep cannot reorder the feed — then
    `await animateRimSweepIfAny();` and only then `render()`. The callback becomes async; the tail
    (`spawnPops`, `applyEndMeta`) keeps its order. Note in the comment that the guest's coin/crate
    panels lag by the sweep's duration and that an event arriving mid-sweep harmlessly snaps the
    ship to its true square — degradation, not breakage.

**Tests.** `rimSweepPath`'s whole `<behavior>` block in `scripts/narration_flow_test.js` (import
`Game`/`roundCfg` from `src/engine/index.js`, build real round boards over ≥12 seeds — verified
during planning that both are exported and that `src/ui/board.js` imports cleanly headlessly). Then
**add assertion 3 to `scripts/host_guest_parity_check.js`** (built in T8): exactly one
`rimSweepPath` definition; `src/orchestrator.js` calls `animateRimSweepIfAny` and contains neither
`rimCellInfo` nor `rimHead`. That is the anti-fork guarantee, made structural.

**`src/engine/index.js` is not edited.** Everything above reads engine data and calls existing
engine methods.
  </action>
  <verify>
    <automated>node -e 'Promise.all([import("./src/engine/index.js"),import("./src/ui/flow.js")]).then(([E,F])=>{let cells=0,arcs=0;for(let seed=1;seed<=12;seed++){const g=new E.Game(E.roundCfg(["balanced","balanced","balanced","balanced"]),seed,true);const ring=g.rimCellInfo||[];if(!ring.length)throw new Error("seed "+seed+": no rim ring");for(const rc of ring){const from=[rc.x,rc.y];const head=g.rimHead[rc.x+","+rc.y];const path=F.rimSweepPath(g,from);cells++;if(head[0]===from[0]&&head[1]===from[1]){if(path.length)throw new Error("seed "+seed+": a cell already at its head returned a path");arcs++;continue;}if(!path.length)throw new Error("seed "+seed+": empty path from a non-head rim cell");const last=path[path.length-1];if(last[0]!==head[0]||last[1]!==head[1])throw new Error("seed "+seed+": path ends at "+last+" not the arc head "+head);let prev=from;for(const c of path){if(!g.onRim(c))throw new Error("seed "+seed+": path leaves the rim at "+c);const dx=Math.abs(c[0]-prev[0]),dy=Math.abs(c[1]-prev[1]);if(dx>1||dy>1||(dx===0&&dy===0))throw new Error("seed "+seed+": path jumps "+prev+" -> "+c);if(c[0]===from[0]&&c[1]===from[1])throw new Error("seed "+seed+": path includes its own start");prev=c;}}if(F.rimSweepPath(g,[-1,-1]).length)throw new Error("a non-rim cell returned a path");}console.log("G14 rimSweepPath: "+cells+" rim cells over 12 seeds, "+arcs+" already-at-head, all contiguous and head-terminated");}).catch(e=>{console.error(e.message);process.exit(1)})' &amp;&amp; node -e 'const fs=require("fs");const o=fs.readFileSync("src/orchestrator.js","utf8");if(/rimCellInfo|rimHead/.test(o))throw new Error("the guest tier reimplements the rim walk — one stepper, not two");if(!/animateRimSweepIfAny/.test(o))throw new Error("watchEvents does not call the shared stepper");const f=fs.readFileSync("src/ui/flow.js","utf8");if((f.match(/export function rimSweepPath/g)||[]).length!==1)throw new Error("expected exactly one rimSweepPath definition");const w=o.slice(o.indexOf("export function watchEvents"),o.indexOf("export function watchPrompt"));if(w.indexOf("animateRimSweepIfAny")<w.indexOf("render()"))console.log("guest animates before render — correct");else throw new Error("the guest must animate BEFORE render(), or the ship has already jumped");if(w.indexOf("events.push")>w.indexOf("animateRimSweepIfAny"))throw new Error("the event must be pushed BEFORE any await, or a mid-sweep arrival reorders the feed");console.log("G14 one stepper, both tiers, correct ordering")' &amp;&amp; node scripts/narration_flow_test.js &amp;&amp; node scripts/host_guest_parity_check.js &amp;&amp; node scripts/host_guest_parity_check.js --drill &amp;&amp; node scripts/module_graph_check.js &amp;&amp; node scripts/net_contract_check.js &amp;&amp; node scripts/determinism_baseline.js --verify 2>&amp;1 | tail -3 &amp;&amp; npm test 2>&amp;1 | tail -8 &amp;&amp; test -z "$(git diff --stat src/engine/index.js)" &amp;&amp; echo ENGINE-CLEAN</automated>
    <human-check>
**On a GUEST seat specifically** — that is the path that has silently diverged four times. Sail onto
a rim square as a guest and watch the boat travel around the ring rather than teleport. Then confirm
the host tab shows the same sweep at the same pace. (Bot storm sweeps still jump on the guest by
design — that is the documented fall-back, not a defect.)
    </human-check>
  </verify>
  <done>
`rimSweepPath` passes every case in `<behavior>` over 12 seeds and every rim cell. One stepper is
called from four host sites and from `watchEvents`; `src/orchestrator.js` contains no rim walk of
its own and the parity gate asserts it. The guest pushes its event before any await and animates
before `render()`. Bot-storm and battle-flee sweeps fall back to today's instant render, documented
as such. 31/31 determinism. `npm test` exits 0. Engine diff empty.
  </done>
</task>

<task type="auto">
  <name>T13: G20–G24 — the re-record batch extended, and four rulings recorded so nobody "fixes" them</name>
  <files>docs/DETERMINISM-RERECORD-NEXT.md, .planning/STATE.md, .planning/phases/15-narration-audit-fixes/15-PLAYTEST-NOTES.md, .planning/todos/pending/ships-stack-after-rim-sweep.md, .planning/todos/pending/flip-outcomes-all-caps-in-play-only.md, .planning/todos/pending/narration-two-schedulers-unenforced.md, .planning/todos/pending/flee-not-offered-when-broke.md</files>
  <read_first>docs/DETERMINISM-RERECORD-NEXT.md (all 129 lines — match its voice, numbered ## sections, exact file:line citations, plainly-stated costs), .planning/todos/pending/flee-not-offered-when-broke.md (already exists from this morning — the front-matter shape to match, and the ruling to EXTEND not duplicate), .planning/quick/20260730-bot-intelligence/PLAN.md frontmatter (it lists docs/DETERMINISM-RERECORD-NEXT.md and a bot-rim-escape-live-parity todo as artifacts), .planning/STATE.md §Blockers/Concerns and §Deferred Items (the STORM-02 row)</read_first>
  <action>
Documents only. No source changes; `git diff --stat src/ index.html` must be empty.

**(a) G20 — extend `docs/DETERMINISM-RERECORD-NEXT.md`.** ONE re-record, not three. Add:
  - a cross-reference to `.planning/quick/20260730-bot-intelligence/PLAN.md`, whose improvements
    also need a gated pass and which already names this file as an artifact — so the bot work and
    the engine-purity work land before the SAME single `--capture`.
  - **Do NOT add G14's guest half.** An earlier framing queued "intermediate rim-sweep squares in
    the event stream" here on the assumption the guest could not derive them. That was wrong: the
    ring is static, ordered and already on every client, and T12 ships guest parity today with no
    engine change. If any cross-reference in this file, in STATE.md, or in the playtest notes says
    otherwise, correct it. **STORM-02 stays parked on its own merits** — a storm push is simulation,
    not geometry — and the two must not be conflated again. Write that distinction down in one
    sentence, because it is the thing that was got wrong.

**(b) G21 — new ruling `.planning/todos/pending/ships-stack-after-rim-sweep.md.`** Front matter
matching the existing ruling file: `type: ruling`, `status: closed-not-a-bug`, `severity: low`,
`area: gameplay`, `created: 2026-07-30`, `source: Phase 15 playtest notes (Wyatt, 2026-07-30)`,
`resolves_phase: null`, `regression: false`. Wyatt, verbatim: *"i know this, and have no good
solution, because the logic is weird… I think it's fine -- it renders okay in the game, because the
renderer seems to nudge them next to each other on the same square so they're both visible."*
**The renderer-nudge half is the load-bearing part** and must be named in source: `shipXY`
(`src/ui/util.js:199-205`) offsets ships sharing a cell by ±0.18 of a cell. That is WHY the stacking
is acceptable, and a future pass that "fixes" the stacking without knowing it would trade a
harmless overlap for a real rules change. Name `tradewind` (`src/engine/index.js:244-251`) as the
site — it moves a ship to the arc head with no occupancy test, deliberately.

**(c) G22 — EXTEND `.planning/todos/pending/flee-not-offered-when-broke.md`, do not duplicate it.**
It already records the ruling from this morning. Add: his session-2 re-confirmation, verbatim — *"in
this case, we don't need to keep reminding a broke player that they're too broke to flee every time
they flip double-tails lol. keep it as is."* — and the clause that is genuinely NEW and now urgent:
**this is a deliberate exception to the D-41 family, and no greyed flee button is to be added
either.** T5 has just added the SIXTH greyed-with-a-reason control (storm anchor), so the next sweep
will reason by analogy straight into this branch. Say so explicitly.

**(d) G23 — new ruling `.planning/todos/pending/flip-outcomes-all-caps-in-play-only.md.`** The rule:
ALL CAPS when the game announces a flip outcome AS IT HAPPENS; lowercase when teaching or tallying.
Wyatt: *"just the in-play line is fine, leave the prose and stats."* Record that the sweep is DONE —
the only in-play offender was the tails dock prompt, fixed in T1 — so this file exists to stop a
future sweep re-running it. **Record the hazard by name:** a blanket replace would hit `e.heads`,
`p.heads` and the `.coin.heads` CSS class; scope any future work to string literals only. Same
`layout`→`layet` trap D-29 documented.

**(e) G24 — inline icon spacing, explicitly declined.** One line in the SESSION 2 section of
`15-PLAYTEST-NOTES.md` (the code comment lives at T3's site). *"i don't care at all about breathing
room around inline items right now -- i just wanted the emoji wording fix."* No separate file — it
is a scope decision, not a branch anyone can "fix".

**(f) The D-57 residue — new `.planning/todos/pending/narration-two-schedulers-unenforced.md`,
`type: concern`, `status: pending`.** `flash()` and `showNarration()` are two independent hold/fade
schedulers writing the same `.apMsg`; the Phase 15 verifier called it "benign today but unenforced".
Deliberately NOT fixed in this pass — it is a refactor of live narration timing and T10 has just
changed that code. Record it so it is visible rather than forgotten, and note that of the four
host/guest drifts, F7 is gated (assertion 7), D-55 is fixed and gated (T7/T8), D-35 is structurally
safe and now class-gated, and this is the remaining unenforced one.

**(g) `.planning/STATE.md`.** Update §Blockers/Concerns and §Session Continuity: the parity gate now
exists (T8) and what it covers; G18 fixed the botTurn rim-escape gap that
`.planning/quick/20260730-bot-intelligence/PLAN.md` planned only to FLAG, so its
`bot-rim-escape-live-parity.md` task becomes "verify already fixed"; the storm-rain seeding closes a
per-client visual divergence; and the D-57 residue is the one host/guest item still unenforced. Do
not leave two competing bullets describing the same thing.

**(h) `15-PLAYTEST-NOTES.md` §SESSION 2.** Bring the record up to date: G10/G11/G12 are no longer
"COPY QUEUE — not yet applied"; add short G13–G26 entries with their dispositions; and correct the
COPY QUEUE list so it reflects what shipped.
  </action>
  <verify>
    <automated>test -z "$(git diff --stat src/ index.html package.json scripts/)" &amp;&amp; echo DOCS-ONLY &amp;&amp; for f in .planning/todos/pending/ships-stack-after-rim-sweep.md .planning/todos/pending/flip-outcomes-all-caps-in-play-only.md .planning/todos/pending/narration-two-schedulers-unenforced.md; do test -f "$f" || { echo "MISSING $f"; exit 1; }; done &amp;&amp; node -e 'const fs=require("fs");const rr=fs.readFileSync("docs/DETERMINISM-RERECORD-NEXT.md","utf8");if(/rim.?sweep|tradewind/i.test(rr)&&!/not.*queued|no longer|removed|ships today|without an engine change/i.test(rr))throw new Error("the re-record batch still queues the rim sweep — G14 ships guest parity today");if(!/bot-intelligence/.test(rr))throw new Error("the bot-intelligence cross-reference is missing");const flee=fs.readFileSync(".planning/todos/pending/flee-not-offered-when-broke.md","utf8");if(!/keep it as is/.test(flee))throw new Error("the session-2 re-confirmation is missing");if(!/D-41/.test(flee)||!/grey/i.test(flee))throw new Error("the no-greyed-flee-button clause is missing");const caps=fs.readFileSync(".planning/todos/pending/flip-outcomes-all-caps-in-play-only.md","utf8");if(!/\.coin\.heads/.test(caps)||!/e\.heads/.test(caps))throw new Error("the blanket-replace hazard is not named");const st=fs.readFileSync(".planning/STATE.md","utf8");if(!/host_guest_parity_check/.test(st))throw new Error("STATE.md does not record the new parity gate");console.log("G20-G24 + the D-57 residue recorded")' &amp;&amp; npm test 2>&amp;1 | tail -6 &amp;&amp; test -z "$(git diff --stat src/engine/index.js)" &amp;&amp; echo ENGINE-CLEAN</automated>
  </verify>
  <done>
The re-record batch cross-references the bot-intelligence plan and no longer queues the rim sweep,
with the geometry-vs-simulation distinction written down and STORM-02 left parked on its own merits.
Three new ruling/concern files exist with valid front matter; the flee ruling carries the session-2
re-confirmation AND the no-greyed-button clause. STATE.md and the SESSION 2 notes match reality.
Source tree diff is empty. `npm test` exits 0.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| player input → UI prompt handlers | Every change sits behind an existing `ask()`/`pickCell()` prompt; no new input surface is created |
| host → guest (Firebase RTDB) | T12 makes the guest ANIMATE from data it already receives; no new field, node or writer. T7 changes only guest-side rendering |
| DOM ← narration HTML | T10 clones an already-rendered node into a ghost; no string reaches `innerHTML` that did not already |
| game seed → per-client visuals | T11 derives rain from `game.seed` via a PRIVATE RNG — the seed is already shared; nothing is drawn from `game.r()` |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-Q31-01 | Tampering | the seeded RNG stream (T11) | critical | mitigate | Drawing rain jitter from `game.r()` instead of a private `mulberry32(game.seed)` would desync every client AND all 31 fixtures. Asserted in T11's verify (no `.r()` in the region), by a new `ui_contract_check.js` assertion with a `--drill`, and by `determinism_baseline.js --verify` 31/31. |
| T-Q31-02 | Tampering | the broadcast event payload (T12) | high | mitigate | Re-entry is guarded by a MODULE-LOCAL index, never a flag stamped on the event — `pushEvents` serialises events verbatim, so a stray field would enter the Firebase payload. `net_contract_check.js` runs in T12's verify. |
| T-Q31-03 | Tampering | guest event ordering (T12) | high | mitigate | `watchEvents` becomes async; the push and `evIdx` assignment happen BEFORE any await so a second event arriving mid-sweep cannot reorder the feed. Asserted textually in T12's verify. |
| T-Q31-04 | Repudiation | host/guest visual divergence | medium | mitigate | The whole of T7+T8: one builder for the sail rect, one stepper for the sweep, and a gate that fails naming the class present on one side and missing on the other. Four prior drifts are the evidence this is real. |
| T-Q31-05 | Elevation of privilege | the fade ghost intercepting prompt clicks (T10) | medium | mitigate | `pointer-events:none` preserved and grep-asserted; the ghost is out of flow and removed on `animationend` with a 250ms `setTimeout` belt. |
| T-Q31-06 | Denial of service | a stranded ship element mid-arc (T12) | low | mitigate | The stepper restores the true destination in a `finally`; an event arriving mid-sweep repaints every ship from its own snapshot. Degradation, not breakage. |
| T-Q31-07 | Denial of service | Safari storm hitch (T11) | medium | accept | `buildStormLayers` is inside the file's BYTE-IDENTICAL Safari region. The change swaps an RNG source and two constants — it reintroduces no live gradient, mask or per-frame work, which is what BUG-01 actually fixed. Header records the scoped exception; a Safari eyeball check is on the human list. |
| T-Q31-08 | Information disclosure | the register gate widening (T4) | low | mitigate | The exception is per-file, content-anchored, freshness-checked and carries the reason on file. A stale anchor FAILS. T4 forbids adding a second entry to force green. |
| T-Q31-SC | Tampering | supply chain | low | accept | No package-manager install anywhere in this plan. No build step, no CDN, no new dependency. `package.json` changes only its `test` script (T8); `package-lock.json` must show an empty diff. |
</threat_model>

<source_coverage_audit>
Every item in the brief and both coordinator corrections is planned. Nothing is deferred,
simplified, or reduced.

| Source item | Where |
|---|---|
| 1 — Tails dock prompt, his exact words, amounts removed | T1 |
| 2 — Coin picker → `How many?`, both branches | T2 |
| 3 — Privacy notice → "you" | T4 (a) |
| 3 — Register gate learns the rule, named allowlist, not widened | T4 (b) |
| 4 — Fade becomes a STRICT sequence | T10 |
| 4 — No fade-to-empty; ghost properties preserved; durations stated | T10 (F6 kept; 180ms + 180ms delay) |
| 5 — Storm anchor greyed with `Yer too broke to anchor` | T5 (a) |
| 5 — Prompt stops offering a branch with no button | T5 (b) |
| 6 — `lose half yer treasure`; icon margins untouched | T3 (+ G24 comment) |
| 7 — Trade winds square-by-square, solo + host | T12 |
| 7 — **Guest too**, ONE shared stepper (coordinator correction) | T12 |
| 7 — Reuse an existing pacing constant, check the cadence | T12 (`RIM_SWEEP_STEP_MS` derived from `BOT_STORM_STEP_MS`) |
| 7 — Verify on a guest seat specifically | T12 `<human-check>` |
| 7 — Bot trade-winds linkage noted | T12 comment + T6 + T13 (g) |
| 8 — Render before narrate, all three branches | T9 |
| 8 — A gate enforcing the invariant | T9 (invariant over windLeg, replacing two literal pins) |
| 8 — Sweep the rest of flow.js and REPORT | T9 (report in SUMMARY, no changes) |
| 9 — Boxed-in bot escapes via the rim, UI-tier only | T6 |
| 10 — Rain seeded from the game (option 1) | T11 (a) |
| 10 — Retuned to the midpoint: 0.676 / ×0.969 (option 3) | T11 (b) |
| 10 — Per-layer jitter KEPT | T11 (`LAYERS=4`, `JIT=0.86` asserted unchanged) |
| 11 — Extend the re-record batch; bot-intelligence cross-ref | T13 (a) |
| 11 — **Remove G14's guest half** (coordinator correction) | T13 (a), asserted in verify |
| 12 — RULING: ship stacking accepted, renderer-nudge reasoning | T13 (b) |
| 13 — RULING: flee not offered when broke, + no greyed button | T13 (c), extends the existing file |
| 14 — RULING: ALL CAPS in play only, + the blanket-replace hazard | T13 (d) + T1 comment |
| 15 — RULING: inline icon spacing declined | T13 (e) + T3 comment |
| 16 — D-55 pulled forward, one shared rect builder | T7 |
| 16 — how-to-play harness note corrected | T7 |
| 17 — Host/guest parity gate, both assertions | T8 (+ assertion 3 added by T12) |
| 17 — Red-proofed both ways, npm test 16 → 17 | T8 (`--drill` shipped, `git show` recorded in SUMMARY) |
| 17 — D-57 residue recorded, NOT fixed | T13 (f) |

**Constraints honoured:** `src/engine/index.js` empty diff (asserted in all 13 tasks); `npm test`
green before every commit; `npm test` grows once, in T8; no build step / CDN / dependency;
`src/ui/` never imports `src/net/`; comment convention with `2026-07-30` attribution; re-pin-with-
reason for every fixture a correct fix reddens (T2 drift baseline, T9 the two ordering pins), never
widening a pattern; no player-facing copy invented anywhere (T5's third prompt case is a DELETION,
with a STOP rule if it reads badly).
</source_coverage_audit>

<verification>
Run after the final commit:

1. `npm test` — **17** gate scripts, 23/23 assertion groups PASS, exit 0.
2. `git diff --stat 31cd24c..HEAD -- src/engine/index.js` — **must print nothing.** The single most
   important check in the plan.
3. `git diff --stat 31cd24c..HEAD -- package-lock.json` — must print nothing.
4. `node scripts/determinism_baseline.js --verify` — 31/31 PASS, `SOURCE: unchanged`.
5. `node scripts/host_guest_parity_check.js --drill` and `node scripts/ui_contract_check.js --drill`
   — both green, i.e. every new assertion is proven capable of failing.
6. `git log --oneline 31cd24c..HEAD` — thirteen commits, one per task, each independently revertible.
7. `git diff --numstat 31cd24c..HEAD -- .planning/REQUIREMENTS.md` — must print nothing; this plan
   changes no requirement.
</verification>

<human_verify>
Deliberately short. Everything not listed here is settled by a gate.

**Blocking — the two genuine taste calls:**

1. **T10, the strict fade at 180ms.** Watch four or five lines replace each other: the outgoing line
   should finish fading before the next begins to type. Then stop on a trailing line and confirm it
   stays up. Right, quicker, or slower?
2. **T11, the rain.** Force a storm (temporary `cfg.storm=1` — **revert it** — on a fresh server
   port, per the module-cache note). It should sit midway between the two screens compared this
   morning. Right, or another nudge? Confirm in **Safari** that the storm still runs smoothly.

**Blocking — one parity check, because this path has silently diverged four times:**

3. **T12 + T7 on a GUEST seat.** Sail onto a rim square as a guest: the boat should travel around
   the ring, not teleport, at the same pace the host sees. In the same turn, check the yellow sail
   squares match the host's — same orange, same bounce, hover pops them.

**Opportunistic — fold into the same session, no separate run:**

4. **T1/T2/T3/T5 in one storm and one dock.** At 0 coins in a storm: the anchor button greyed with
   `Yer too broke to anchor`, and the prompt no longer offering to anchor. The flip button reading
   `lose half yer treasure`. On a tails dock: `⚫️ TAILS! Take treasure instead? Or buy …?`. In a
   trade: `How many?`.
5. **T6, a boxed-in bot.** Not forceable — watch for it. A walled-in bot should duck into the rim and
   sweep, with the sweep line on screen.
</human_verify>

<success_criteria>
- Thirteen atomic commits, each green on `npm test`, each independently revertible.
- `src/engine/index.js` byte-identical to `31cd24c`.
- Every fixture a correct fix reddened is re-pinned in the same commit with its reason in its own
  provenance; no pattern widened, no equality loosened, no disposition file touched.
- No player-facing string invented anywhere; every fallback reuses copy that already ships.
- Host and guest render the same moment the same way, and a gate now fails if they stop.
- The three blocking human checks are the only things waiting on Wyatt.
</success_criteria>

<output>
Commit each task separately. Suggested subjects, in order:

1. `fix(g12): the tails dock prompt in his words — TAILS in caps, amounts on the buttons`
2. `fix(g11): the coin picker just asks How many?`
3. `fix(g13): lose half yer treasure — two coin glyphs read as confusing`
4. `fix(g16): the privacy notice speaks plain english, and the gate learns why`
5. `fix(g10): at nothin' in yer purse the storm no longer offers an anchor ye cannot drop`
6. `fix(g18): a boxed-in bot escapes via the rim in the game people actually play`
7. `refactor(g25): one function draws the sail squares, so host and guest cannot drift again`
8. `test(g26): the host/guest parity gate D-56 asked for and nobody wrote`
9. `fix(g15): windLeg paints the board before it narrates it, and a gate says so`
10. `feat(g17): the outgoing line fades, THEN the next one shows`
11. `fix(g19): every crew sees the same rain, at the midpoint of the two screens we measured`
12. `feat(g14): the trade winds carry ye square-by-square — on the host AND the guest`
13. `docs(g20-g24): the re-record batch, and four rulings recorded so nobody fixes them back`

Write `.planning/quick/20260730-playtest-session2-fixes/SUMMARY.md` when done, recording:
- the `git show` red-proof output from T8 (the parity gate failing against the pre-T7 tree);
- T9's sweep verdicts for the `narrate`-before-`paint` pairs OUTSIDE `windLeg`;
- whether T5's truncated broke prompt read acceptably or had to STOP;
- which line actually played after T6's rim escape, and whether an explicit narrate was needed;
- the measured mean duration and tile scale from T11's seeded specs;
- every fixture re-pinned, with its reason.
</output>
