# Roadmap — v1.3 workstream `prompts-polish`

**Milestone:** v1.3 The Game Comes Alive (Prompts & Polish)
**Overview of the whole milestone:** [`../../V1.3-V1.4-PLAN.md`](../../V1.3-V1.4-PLAN.md)

## Phases in this workstream

- [ ] **Phase 18: Prompts & Polish** — Buttons wait for the typewriter; a narrow window stops clipping the only button that takes the action; narration stops jumping sideways as it fades and the box stops shrinking under a still-fading line; orange buttons restyled; captain circles removed; no orphaned coins or brackets (FIX-03, FIX-04, FIX-06, FIX-07, FIX-08, FIX-09, FIX-10, FIX-16, FIX-17, FIX-21)

### Phase 18: Prompts & Polish

**Goal**: The game stops feeling slightly off in the small moments — the narration box measures and positions itself honestly, and ten small rough edges in the prompts, buttons and copy are gone. Touches no game rules.
**Depends on**: Nothing. First phase of this workstream; runs concurrently with Phases 19–22.
**Requirements**: FIX-03, FIX-04, FIX-06, FIX-07, FIX-08, FIX-09, FIX-10, FIX-16, FIX-17, FIX-21
**Success Criteria** (what must be TRUE):

  1. On a narrow window (320 / 375 / 390) and across an orientation change, the action button is never clipped — the box is never pinned shorter than its content. Verified in **Safari** as well as Chrome. *(FIX-10)*
  2. A narration line fades exactly where it sat — no sideways jump — and the box only shrinks once the fade has completed, never slicing lines that are still fading. *(FIX-16)*
  3. In an action prompt the buttons appear only after the final character has been typewriter'd out; under `prefers-reduced-motion` they appear immediately. *(FIX-03)*
  4. `resizePanel()` still measures the finished height **once per message** — BUG-01's Safari fix survives all of criteria 1–3. Re-measuring per reveal tick is the original near-crash. *(FIX-03, FIX-10, FIX-16)*
  5. A loser with an empty hold reads "they give up 5🌕", not the bribe framing; under 5 coins falls to the existing "all they have" line. Fixed in `src/orchestrator.js` + `src/ui/util.js` with `src/engine/index.js` untouched, so no determinism re-record. *(FIX-07)*
  6. The win banner only prints "a" in front of a recipe name that takes one. **No recipe is renamed.** *(FIX-08)*
  7. On narrow mobile the ingredient chips stay readable instead of collapsing into one vertical column. *(FIX-09)*
  8. The 12 solid-orange `button.primary` buttons use the outline + faded-fill pattern. *(FIX-06)*
  9. The "{captain} is blown by the storm" line is gone, both viewer variants together. *(FIX-04)*
  10. The coloured circle beside captain names is gone everywhere it appears — player rows and the lobby seat list — and each row shifts left to close the gap. *(FIX-17)*
  11. Narration never orphans a trailing chunk: `(+1🌕)` wraps as one block, and end-of-voyage awards keep a quantity with its unit. *(FIX-21)*
  12. Nothing in this phase touches `src/engine/index.js` or changes what it emits. *(milestone constraint 1)*
  13. Every copy change is recorded against `.planning/todos/pending/copy-shipped-vs-approved-gate.md`. *(milestone constraint 3)*

**Design note — criteria 1–4 are ONE piece of work.** FIX-03, FIX-10 and FIX-16 all live in
`resizePanel()` and the panel's height measurement, and each breaks the others if done alone. Plan
them as a single unit holding all four constraints at once. FIX-16's two reported symptoms (the jump
left, the early shrink) are **one cause** — `.apMsg.fadeOut` going `position:absolute; inset:0`,
which both re-anchors the line and hides it from the height measurement. The remaining seven items
are small and independent.

**Origin**: Wyatt's 2026-07-31 punch list + the v1.2 Phase 17 playtest (screenshot), plus the
2026-08-01 batch (FIX-16, FIX-17, FIX-21). Plain-language overview: [`../../V1.3-V1.4-PLAN.md`](../../V1.3-V1.4-PLAN.md) "Phase 1 — Prompts & Polish".
**Plans**: 5/7 plans executed

Plans:
**Wave 1**

- [x] 18-01-PLAN.md — wave 1 — the interlocking panel group: buttons wait for the typewriter, the ghost fades where it sat, the box re-measures on resize (FIX-03, FIX-10, FIX-16)
- [x] 18-02-PLAN.md — wave 1 — win-banner article: a per-recipe `article` field, `recipeArticle()`, and the one coordinated `src/ui/board.js` line (FIX-08)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 18-03-PLAN.md — wave 2 — remove the storm-drift line; wrap every orphan-prone trailing chunk, plus a permanent anchored gate (FIX-04, FIX-21)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 18-04-PLAN.md — wave 3 — an empty hold is not a bribe: `spoilChosen` on the orchestrator's battle event, engine untouched (FIX-07)

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 18-05-PLAN.md — wave 4 — D-02: the shot clock starts when the buttons become clickable, with a frozen clock during the reveal (FIX-03)

**Wave 5** *(blocked on Wave 4 completion)*

- [ ] 18-06-PLAN.md — wave 5 — button restyle, captain circles removed everywhere, and BOTH narrow-screen chip treatments rendered for D-03 (FIX-06, FIX-09, FIX-17)

**Wave 6** *(blocked on Wave 5 completion)*

- [ ] 18-07-PLAN.md — wave 6 — phase gate: copy-change ledger, Wyatt's Safari + by-eye checkpoint, the FIX-09 choice applied

**Note on waves**: several plans sit in a later wave only because they share `index.html`'s CSS block
or `src/ui/util.js` with an earlier one — a file-serialisation ordering, not a logical dependency.

## Boundaries

**This workstream owns:** `src/ui/panel.js`, the CSS block in `index.html`, `src/ui/util.js`, `src/ui/recipe.js`

**Also owns (widened 2026-07-31 — these were needed by Phase 18 and owned by nobody):**
`src/orchestrator.js`, `src/main.js`, `src/ui/flow.js`. No other v1.3 workstream claims any of
these, so the widening takes nothing from anyone. Why each is needed:

- `src/orchestrator.js:626-634` — FIX-07. The bribe/spoil decision (`canCoins && hasIng`) lives here,
  and the fix adds a `spoilChosen` field to the orchestrator's battle event. **Deliberately NOT
  `src/engine/index.js`** — an engine field would change every fixture hash and force the one-time
  determinism re-record that v1.3 must stay clear of (milestone constraint 1).

- `src/main.js:161-168` — FIX-10. The `resize`/`orientationchange` listener calls only
  `syncBoardSizing()` and never re-runs `resizePanel()`, which is the confirmed cause of the clipped
  action button after a resize.

- `src/ui/flow.js:96` — FIX-03. Where the `.apBtn` markup is built and handed to `panel()`.

**Runs concurrently with:** the other v1.3 workstreams — `prompts-polish`, `board-wind`,
`sound-clock`, `front-door` — except where noted below.

**⚠ Shared-file risk:** this workstream edits **the CSS block** of `index.html` while `front-door`
edits **the markup** of the same file. Different regions, same file — expect merge friction and
sequence the `index.html` touches deliberately rather than assuming they are independent.

**⚠ Cross-workstream touch — `src/ui/board.js:772` (owned by `board-wind`).** FIX-08 (the win banner
must only print "a" in front of a recipe name that takes one) needs the victory line
`` `${pn(w)} baked a ${winRecipeSpan(w)} …` ``, which sits in **board-wind's** file. This is a
**one-line** change and the only reach into that file. Coordinate before touching it — either hand
this single line to `board-wind`, or sequence it so the two sessions do not edit `board.js`
concurrently. Everything else in FIX-08 is in `src/ui/recipe.js` (ours).

**Not a board touch:** FIX-09 (mobile ingredient chips) is **pure CSS** — `.prowTop` grid and the
`@media (max-width: 480px)` override in the `index.html` CSS block. The `src/ui/board.js` reference
in the FIX-09 todo is where chip *contents* are rendered, not their layout; no board file edit is
required for it.

## Decisions

- **D-01 (Wyatt, 2026-07-31) — buttons wait for the typewriter.** FIX-03 stands: the action buttons
  stay hidden until the reveal completes. This knowingly pulls against the deferred narration-pacing
  work (NARR-07, now **Phase 26 in v1.4**), which makes narration never gate play. Wyatt's ruling:
  *"let's have the buttons wait for narration typewritering to finish; if that feels like it drags,
  we'll shorten the typewriter time later."* So the lever for a too-slow feel is
  **`REVEAL_MS_PER_CHAR`, not re-coupling the buttons.** Phase 26 must not silently undo this.

- **D-02 (Wyatt, 2026-07-31) — the shot clock starts when the buttons become clickable.** Follows
  from D-01: with buttons held until the reveal completes, a player was losing up to ~2.8s of the 30s
  window on the longest prompts (measured: ~100 visible chars × `REVEAL_MS_PER_CHAR` 20ms, plus
  `GHOST_FADE_MS` 800ms when the prompt replaces a prior line). `armClock(seat)`
  (`src/ui/util.js:1157-1161`, called from `ask()`) currently fires **before** `panel()` renders.
  Move it to fire from the same reveal-completion callback that reveals the buttons, so a player
  always gets the full window to act. **Carries a UI obligation:** `setClockUI()`
  (`src/ui/panel.js:51`) must show a sane frozen value during the 0–2.8s reveal rather than a
  ticking or blank countdown. This overrides the research doc's "leave as-is" recommendation.

- **D-03 (2026-07-31) — FIX-09 is decided by eye, not up front.** Both candidate treatments (shrink
  the chips vs. give them their own full-width row on narrow screens) are pure CSS and low-risk. The
  plan must produce a render at 320/375/390 for Wyatt to choose from rather than picking blind.

## Staying current — this project's demonstrated failure mode

**Staleness, not conflicts, is what has actually cost this project time.** A branch drifted 34
commits behind `main` and made a shipped milestone look unfinished; the repo already carries several
stale worktrees. So:

1. **Branch from current `main`** when you start.
2. **Merge back promptly** when a phase completes — do not let a workstream sit.
3. **Pull `main` in before planning a new phase**, so you are planning against what actually shipped.
