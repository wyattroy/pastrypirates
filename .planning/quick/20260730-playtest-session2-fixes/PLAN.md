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
<!-- gsd:write-continue -->
</tasks>
</content>
</invoke>
