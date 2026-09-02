# THE CHART LOG — closed rows, kept forever

*Rows the Chartkeeper swept off [`CHART.md`](CHART.md) the moment they were finished — his
ruling, 2026-09-02: every completed row leaves immediately and leaves no stub, because the Chart
"should only show WHERE WE ARE GOING". Nothing is lost here: the full text of every row is below,
under the handle it was closed with, and `scripts/qa/chart_sweep_conserves_check.mjs` fails the
build if any allocated handle ends up owned by neither file. Swept by
`scripts/wyclau/chartkeeper.mjs --sweep --write`, never by hand.*

*This preamble is re-emitted from the tool on every sweep, so it cannot describe a design that has
been superseded. It did exactly that for four minutes on 2026-09-02 and the fix is above the line
that writes it.*

## T-032 — date not recorded — Day 1 — the relay: Door rewritten (watch + advisor) · the Bell · the Inbox · the close

- [x] Day 1 — the relay: Door rewritten (watch + advisor) · the Bell · the Inbox · the close
      ⟨`T-032`⟩
  gate (`close_item_check.mjs`, red-proofed both directions) · detached trials
  (`start_trial_detached.mjs`) · `publish_status.mjs` built, its red gate now green ·
  keep-working/pulse/thresholds hooks and the watchdog judgement stack DELETED · npm test 81/81

## T-033 — 2026-09-02 — Your ruling: judge the 0137Z queue — the screenshots of the build that would actually be (closed 2026-09-02 · CEO 87 · no game diff — a judging pass, not a code change: 315 of 315 queued screens judged (307 PASS, 8 FAIL, 0 unjudged, 0 lost) on build 2026.09.01.8, the stamp in the tree; deliberately no src/ diff, because any stamp bump retires the evidence just gathered)

- [x] **Your ruling: judge the 0137Z queue — the screenshots of the build that would actually be (closed 2026-09-02 · CEO 87 · no game diff — a judging pass, not a code change: 315 of 315 queued screens judged (307 PASS, 8 FAIL, 0 unjudged, 0 lost) on build 2026.09.01.8, the stamp in the tree; deliberately no src/ diff, because any stamp bump retires the evidence just gathered)
      ⟨`T-033`⟩
  staged.** His standing pre-ship ruling (INBOX-20260902T0050Z, question UI): *"Judge the
  screenshots first"* — before staging, before release — applied to the SECOND queue. The 0137Z
  trial landed with its eyes shut (the `vision.mjs` fix landed while it was already at sea) and
  deferred **315 screens** on build `2026.09.01.8`, which is the stamp in the tree. Claimed by the
  watch of 2026-09-02T03:00Z, which is also the last gate standing between here and staging.

## T-004 — 2026-09-02 — Convert the recipe art to WebP — CONVERT, DO NOT RESIZE — his ruling: do it, and /classic (closed 2026-09-02 · CEO 96 · commit 3a43235 (1 game file))

- [x] **Convert the recipe art to WebP — CONVERT, DO NOT RESIZE** — his ruling: do it, and `/classic` (closed 2026-09-02 · CEO 96 · commit 3a43235 (1 game file))
      ⟨`T-004`⟩
      shares the converted files. ⚠ The Advisor measured the scope and it is smaller than the item
      claimed: files are 512×~385px; the largest they are ever drawn is 220px tall
      (`index.html:344`), ≈290 CSS px wide. **On a 2× phone that is 580 DEVICE pixels against a
      512px file — the art is already slightly upscaled.** "40% too big" was a 1× reading. Resizing
      down would visibly soften every modern phone. Saving is compression alone (~0.53 MB).
      Screenshot a phone before and after.

## T-057 — 2026-09-02 — THE BOARD IS WEBP — 4.24 MB → 0.19 MB, and that one file was 43% of every image in the (closed 2026-09-02 · CEO 97 · commit fbbf44a (1 game file))

- [x] **THE BOARD IS WEBP — 4.24 MB → 0.19 MB, and that one file was 43% of every image in the (closed 2026-09-02 · CEO 97 · commit fbbf44a (1 game file))
      ⟨`T-057`⟩
      game.** All 2132×2132 pixels kept; format only. `assets/` 10.05 MB → 6.00 MB. His sentence
      *"the only one that needs to be as big as it is is the board itself"* exempts the board from
      RESIZING — it sits inside *"resized and compressed according to its maximum pixel size"* — not
      from compression. CEO 97 tried to break that reading and could not, **but he has not been
      asked**; the pulse invites him to overrule it and it is one command to put back.
      Posed pair on the worst-changed square (the game's own title art) at 3×, indistinguishable;
      both engines and both games photographed, Safari included. New gate
      `asset_paths_exist_check.mjs` — 368 asset paths across both trees, derived from the game's own
      `sharedAssetUrls()`, red-proofed.

## T-058 — 2026-09-02 — THE SAME TRADE IS UNTRIED ON 8.24 MB OF PNGs — the next lever of his launch-critical (closed 2026-09-02 · CEO 98 · commit 05f63b1 (2 game files))

- [x] **THE SAME TRADE IS UNTRIED ON 8.24 MB OF PNGs — the next lever of his launch-critical (closed 2026-09-02 · CEO 98 · commit 05f63b1 (2 game files))
      ⟨`T-058`⟩
      compression ask** (`INBOX-20260901T1335Z`, *"make the game load MUCH faster"*). Measured
      2026-09-02T08:1xZ: islands **1.67 MB**, icons **1.20 MB**, ingredients 0.36 MB, compass
      0.21 MB, boats 0.17 MB, badges 0.10 MB. The board went **95% lighter** at q0.92 with a posed
      pair showing no visible difference at 3× on the hardest content in the game, and the recipe
      art went 31% lighter before it — so the format is proven twice on this library.
      ⚠ **DO NOT ASSUME 95% AGAIN.** The board is smooth painted washes, PNG's worst case. Small
      flat icons already quantize well and may barely move; the honest step is
      `board_reexport_fidelity.mjs`-style measurement per family, not a bulk rewrite.
      ⚠ **AND ISLANDS/ICONS ARE ALPHA CUTOUTS**, unlike the board — check transparency survives
      before believing a byte count (W5-1 paid for exactly that: numbers right, picture wrong).

## T-059 — 2026-09-02 — npm test IS RED AND HAS BEEN SINCE ~08:00Z — one line, not this watch's, on a (closed 2026-09-02 · CEO 99 · no game diff — measured, no game-code change is right: the fault was a QA probe hand-typing where the frozen v1 is served, so the fix is CLASSIC_PATH in lib/chrome.mjs plus gate cases 1b and 2b -- npm test back to 96/96, commit cb86ff45)

- [x] **`npm test` IS RED AND HAS BEEN SINCE ~08:00Z — one line, not this watch's, on a (closed 2026-09-02 · CEO 99 · no game diff — measured, no game-code change is right: the fault was a QA probe hand-typing where the frozen v1 is served, so the fix is CLASSIC_PATH in lib/chrome.mjs plus gate cases 1b and 2b -- npm test back to 96/96, commit cb86ff45)
      ⟨`T-059`⟩
      launch-critical path.** `game_url_check.js` rejects `scripts/qa/pastry_shipped_art_probe.mjs:98`,
      whose in-page `import('/classic/src/ui/recipe.js')` names a non-root tree. Committed in
      `bc97d40d` (the 07:31Z watch, answering CEO 96). Verified at HEAD by the 08:10Z watch and
      independently by CEO 97. **95 of 96 gates pass**; a `&&` chain hides everything after the
      first failure, so run them separately to see that. The probe's need is legitimate — it
      photographs the frozen v1 — so the fix is to build that URL the way the gate expects rather
      than to weaken the gate.

## T-005 — 2026-09-02 — The money symbol: this row's diagnosis was wrong, and the corrected answer is below — (closed 2026-09-02 · CEO 101 · no game diff — answered, not fixed: no game change is right -- the residual is T-078, recurrence-gated)

- [x] **The money symbol: this row's diagnosis was wrong, and the corrected answer is below — (closed 2026-09-02 · CEO 101 · no game diff — answered, not fixed: no game change is right -- the residual is T-078, recurrence-gated)
      ⟨`T-005`⟩
  nothing on screen is a raw emoji and there is no rule-23 sweep to do.** Measured 2026-09-02T11:xxZ:
  [`T005-2026-09-02-THE-COIN-AND-THE-RIG.md`](T005-2026-09-02-THE-COIN-AND-THE-RIG.md).
  **`src/shared/index.js:135` maps 🌕 to `assets/icons/coin-emoji.png` and `emojify()` swaps it
  before anything renders**, so the typed character never reaches the DOM and no Safari — his or
  the rig's — is ever asked to draw it. What was blank was that IMAGE. **What rules out a failed
  load is not the gap's width** — `.narrIcon` is pinned at 18×18 (`index.html:307`), so a failed
  image reserves the same box (CEO 101) — **but the same file painting four times in the CAPTAINS
  panel of that very frame** (`src/ui/util.js:165`). And the card's own opening 🏴 is a bare
  U+1F3F4 that `EMOJI_IMG` does not map, so the font drew it, in that same frame: **a rig with no
  emoji font would have blanked that too.** **His Safari and the rig were both right.** The question
  this row put to him is VOID, not unanswered, and `BLOCKED ON WYATT` has nothing here. Guarded by
  `scripts/qa/emoji_with_art_never_reaches_screen_check.mjs` (5 cases, red-proofed, in `npm test`).
  **Nothing is left of THIS row — the residual is `T-078`, on its own, recurrence-gated.**
  *The original text is kept below, struck, because a wrong reading nobody can see is a wrong
  reading that comes back:*
  ~~**THE GAME'S MONEY SYMBOL IS A RAW EMOJI IN SOME STRINGS AND AN IMAGE IN OTHERS, AND THE EMOJI
  RENDERED BLANK ON THE WEBKIT LEG. Found by the vision judge 2026-09-02, confirmed by eye, traced
  to one line. Not fixed (one item; and the durable version is a sweep, not a patch).**~~
  `solo-tablet-wk-026-settled.png`: the black-market card reads *"They'll find ye one more ingredient
  — for **10⬜.**"* — a blank where the coin belongs, then an orphaned full stop.
  `src/ui/panel.js:1155` writes ``for <b>${bmPrice}🌕.</b>`` — a raw **U+1F315** glyph. The coins in
  the CAPTAINS panel of the same screenshot render perfectly because those are `<img>`
  (`assets/icons/coin-emoji.png`). **Two representations of one coin (rule 23), and one of them can
  vanish.**
  **Measured:** it is ONE missing glyph on that build, not a missing emoji font — the 🏴 two lines
  above it renders fine — and not a slow-loading image. **NOT measured:** whether real Safari does
  the same; Playwright WebKit is not Safari and no report may say it is. **His phone is the only
  real Safari this project has — asked in BLOCKED ON WYATT.**
  **Why it is worth asking:** 🌕 is raw emoji in dozens of strings including the How to Play page
  (`index.html:2835-2847` — crate prices, the black market, the call bounty, Muse). If any Safari
  blanks it, the currency disappears from the page that explains the currency. **The fix is rule
  23's: one coin, the image, everywhere.**
  Account: [`.planning/JUDGED-2026-09-02T0219Z.md`](JUDGED-2026-09-02T0219Z.md).

## T-034 — 2026-08-31 — Charter approved (2026-08-31, amendment: daily lessons)

- [x] Charter approved (2026-08-31, amendment: daily lessons)
      ⟨`T-034`⟩

## T-035 — date not recorded — The Chart exists (this file)

- [x] The Chart exists (this file)
      ⟨`T-035`⟩

## T-036 — date not recorded — The Door exists (.claude/skills/door/SKILL.md)

- [x] The Door exists (`.claude/skills/door/SKILL.md`)
      ⟨`T-036`⟩

## T-037 — date not recorded — The Glass generator exists (scripts/wyclau/glass.mjs) and the first Glass is published

- [x] The Glass generator exists (`scripts/wyclau/glass.mjs`) and the first Glass is published
      ⟨`T-037`⟩

## T-038 — date not recorded — Watchdog scripts + Razer setup guide exist (scripts/wyclau/)

- [x] Watchdog scripts + Razer setup guide exist (`scripts/wyclau/`)
      ⟨`T-038`⟩

## T-039 — 2026-08-31 — The Razer hour — watchdog registered, engine launched, stall test passed through the scheduled task (2026-08-31 16:19Z)

- [x] **The Razer hour** — watchdog registered, engine launched, stall test passed through the scheduled task (2026-08-31 16:19Z)
      ⟨`T-039`⟩

## T-040 — 2026-09-01 — Root-cause the sea trial's crash — FOUND AND FIXED, 2026-09-01 01:15Z. Widened the harness's own console-error capture (200→2000 chars, commit 27a9f382) to get the full stack trace, then ran a targeted single-leg repro (--max-min=2, fails fast instead of waiting the full 35 min): pn(e.p) → pname() → NAMES[i].replace(...) crashed at narrateCurrentBody on a "turn" event whose .p was undefined. Traced to src/ui/flow.js: commit b3c7b12c ("rename the player p to player... function by function") mechanically renamed the LOCAL VARIABLE p→player and swept the EVENT SCHEMA FIELD NAME along with it, nine times — g.ev({t:"turn",p:p.idx}) became g.ev({t:"turn",player:player.idx}), for purse, dock, openoffer (×2), sail (×3), turn (×2). The engine's own emission of the same five event types (src/engine/index.js, never touched by that rename) still correctly used p:; narrationSubjects() reads .p unconditionally for every event type, so this broke narration/camera-tracking for the whole live turn loop, not just the crash. Fixed all 9 sites (p:player.idx, keeping the renamed local variable). New gate scripts/qa/event_actor_field_check.mjs derives the canonical actor-carrying event types from the engine's own emissions (never a hand-typed list — exactly the kind of list that drifted silently here) and checks every UI-layer emission matches; red-proofed against the pre-fix code (8 of 9 sites caught structurally). npm test 75/75. Verified by re-running the exact repro that first reproduced the crash: the voyage now progresses past Day 1 into Day 2/3 with real, varied gameplay (sail squares, calls, trades, offers) and zero console errors — the only "FAIL" is a benign 2-minute timeout from the deliberately short diagnostic cap. Full sea trial now running to get a complete, real verdict before recommending staging.

- [x] **Root-cause the sea trial's crash — FOUND AND FIXED, 2026-09-01 01:15Z.** Widened the harness's own console-error capture (200→2000 chars, commit `27a9f382`) to get the full stack trace, then ran a targeted single-leg repro (`--max-min=2`, fails fast instead of waiting the full 35 min): `pn(e.p)` → `pname()` → `NAMES[i].replace(...)` crashed at `narrateCurrentBody` on a `"turn"` event whose `.p` was `undefined`. Traced to `src/ui/flow.js`: commit `b3c7b12c` ("rename the player `p` to `player`... function by function") mechanically renamed the LOCAL VARIABLE `p`→`player` and swept the EVENT SCHEMA FIELD NAME along with it, **nine times** — `g.ev({t:"turn",p:p.idx})` became `g.ev({t:"turn",player:player.idx})`, for `purse`, `dock`, `openoffer` (×2), `sail` (×3), `turn` (×2). The engine's own emission of the same five event types (`src/engine/index.js`, never touched by that rename) still correctly used `p:`; `narrationSubjects()` reads `.p` unconditionally for every event type, so this broke narration/camera-tracking for the whole live turn loop, not just the crash. **Fixed all 9 sites** (`p:player.idx`, keeping the renamed local variable). New gate `scripts/qa/event_actor_field_check.mjs` derives the canonical actor-carrying event types from the engine's own emissions (never a hand-typed list — exactly the kind of list that drifted silently here) and checks every UI-layer emission matches; red-proofed against the pre-fix code (8 of 9 sites caught structurally). npm test 75/75. **Verified by re-running the exact repro that first reproduced the crash**: the voyage now progresses past Day 1 into Day 2/3 with real, varied gameplay (sail squares, calls, trades, offers) and zero console errors — the only "FAIL" is a benign 2-minute timeout from the deliberately short diagnostic cap. Full sea trial now running to get a complete, real verdict before recommending staging.
      ⟨`T-040`⟩

## T-041 — 2026-09-01 — THE SEA TRIAL CANNOT FINISH WHILE THE VISION JUDGE IS BROKEN — FOUND AND FIXED 2026-09-01, both halves. *(1)* scripts/lib/judge_mode.mjs — when step 1b has just proven the judge blind, the fleet is handed --judge=queue instead of --judge=on: the screens are still captured and still judgeable later, so nothing visual is forfeited, only deferred. UNKNOWN is deliberately not treated as SHUT, or a broken *check* would silently stop judging everywhere. *(2)* a circuit breaker in judgeAll for a judge that dies mid-run, which (1) cannot catch: once no screen has produced a usable verdict and a whole group has failed both batched and one-by-one, it is declared dead rather than paying a timeout on every remaining screen. Gate scripts/qa/judge_shut_defers_check.mjs, 10 checks, RED first, red-proofed both ways through an injected seam. npm test 76/76. ⚠ MY ORIGINAL FILING BELOW WAS WRONG ON THE MECHANISM and is kept, corrected, rather than edited away: I said there was "no timeout behind it". There is — 120s per screen, 300s per batch, both firing correctly. The real fault is that a timeout does not resolve to FATAL, so the designed rescue fires when the judge is ABSENT and is missed when it is merely BROKEN. The original filing: The 01:10Z run hung for 80 of its 111 minutes: all seven Chromium legs finished their voyages by 01:42:45Z and then stalled inside the judge, with zero leg results recorded. The trial's own step 1b had already printed *"can the judge open a screenshot? FAIL — the eyes are SHUT"* — in this run and the one before it — and then launched ten legs that would each hang in that same judge. The designed fallback (JUDGE_MODE=queue, *"THE JUDGE IS DEAD, NOT THE SCREENS. Defer rather than forfeit"*) is only reached when judgeAll RETURNS a fatal; it hangs instead, and there is no timeout behind it. Two things to fix, neither done yet: the judge needs a timeout so its fallback can actually fire, and step 1b's verdict must be ACTED on rather than merely printed — a check that warns and is then ignored is not a gate. *(Corrected in the open: I first told Wyatt the final legs were "actively writing screenshots this minute". They were not — I had read Chrome cache-file timestamps as leg progress. The newest real screenshot was 80 minutes old.)*

- [x] **THE SEA TRIAL CANNOT FINISH WHILE THE VISION JUDGE IS BROKEN — FOUND AND FIXED 2026-09-01, both halves.** *(1)* `scripts/lib/judge_mode.mjs` — when step 1b has just proven the judge blind, the fleet is handed `--judge=queue` instead of `--judge=on`: the screens are still captured and still judgeable later, so nothing visual is forfeited, only deferred. UNKNOWN is deliberately not treated as SHUT, or a broken *check* would silently stop judging everywhere. *(2)* a circuit breaker in `judgeAll` for a judge that dies mid-run, which (1) cannot catch: once no screen has produced a usable verdict and a whole group has failed both batched and one-by-one, it is declared dead rather than paying a timeout on every remaining screen. Gate `scripts/qa/judge_shut_defers_check.mjs`, 10 checks, RED first, red-proofed both ways through an injected seam. npm test 76/76. **⚠ MY ORIGINAL FILING BELOW WAS WRONG ON THE MECHANISM and is kept, corrected, rather than edited away:** I said there was "no timeout behind it". There is — 120s per screen, 300s per batch, both firing correctly. The real fault is that **a timeout does not resolve to FATAL**, so the designed rescue fires when the judge is ABSENT and is missed when it is merely BROKEN. The original filing: The 01:10Z run hung for 80 of its 111 minutes: all seven Chromium legs finished their voyages by 01:42:45Z and then stalled inside the judge, with zero leg results recorded. The trial's own step 1b had already printed *"can the judge open a screenshot? FAIL — the eyes are SHUT"* — in this run and the one before it — and then launched ten legs that would each hang in that same judge. The designed fallback (`JUDGE_MODE=queue`, *"THE JUDGE IS DEAD, NOT THE SCREENS. Defer rather than forfeit"*) is only reached when `judgeAll` RETURNS a fatal; it hangs instead, and there is no timeout behind it. **Two things to fix, neither done yet:** the judge needs a timeout so its fallback can actually fire, and step 1b's verdict must be ACTED on rather than merely printed — a check that warns and is then ignored is not a gate. *(Corrected in the open: I first told Wyatt the final legs were "actively writing screenshots this minute". They were not — I had read Chrome cache-file timestamps as leg progress. The newest real screenshot was 80 minutes old.)*
      ⟨`T-041`⟩

## T-042 — 2026-09-01 — Sail the three Safari legs, which had never once run on this machine — SAILING, 2026-09-01 04:50Z.

- [x] **Sail the three Safari legs, which had never once run on this machine — SAILING, 2026-09-01 04:50Z.**
      ⟨`T-042`⟩
  Two faults, both Windows-only, both invisible anywhere else. (1) The WebKit browser was never
  installed here — a documented setup step nobody had run. (2) `openWebKit()` handed a RAW
  Windows path to `import()`, which ESM reads as the protocol `c:` and rejects, so it reported
  "playwright not found" while playwright was installed and importable; `playwrightDir()` next
  door had always wrapped paths in `pathToFileURL`, so this was the drift `wk.mjs`'s own comment
  predicted. Now one resolver. **Verified by sailing: 44 and 30 screenshots off the WebKit legs,
  where every previous trial recorded a failure.** Safari is a stated core requirement, so this
  closes a hole in the merge evidence rather than adding polish.
  ⚠ The cached failure records had to be deleted first or `readDone()` would have replayed them —
  it resumes any leg with a record at the current stamp and never checks whether it succeeded.

## T-043 — 2026-09-01 — Re-sail crew-desktop — DONE 2026-09-01 05:55Z. Both fixes held: it played a full crew

- [x] **Re-sail `crew-desktop` — DONE 2026-09-01 05:55Z.** Both fixes held: it played a full crew
      ⟨`T-043`⟩
  voyage, host and guest in step, END OF VOYAGE at day 14, 42 screens, no EBUSY and no hang. Its
  only finding is the benign settle timing (9 geometry, longest 2.7s).

## T-044 — date not recorded — THE TEN-LEG VERDICT IS IN — 10 of 10 legs FINISHED THE VOYAGE, build 2026.08.31.2.

- [x] **THE TEN-LEG VERDICT IS IN — 10 of 10 legs FINISHED THE VOYAGE, build `2026.08.31.2`.**
      ⟨`T-044`⟩
  Three modes, three sizes, both engines. The `pname()` crash that failed 7 of 7 Chromium legs at
  21:31Z is gone, and Safari sailed here for the first time ever (one leg reached day 25).
  **Findings, separated by whether they are about the GAME or about the INSTRUMENT:**
  - **6 legs: settle-timing only** — screens checked a fraction before they stopped animating,
    all geometry churn, longest 2.7s against a 2.6s window. Instrument, not game. Parked with its
    measurement in the idea inbox.
  - **2 legs (`solo-phone`, `passplay-phone`): "vision judge FAILED" — ARTEFACTS, NOT FINDINGS.**
    Their records were written at 01:26Z and 01:38Z, in the run whose judge was broken ("the eyes
    are SHUT") and which then hung. The judge failing is the judge's fault. **These two legs should
    be re-sailed before the merge** so the fleet's evidence is uniform — they are the only records
    not produced by the clean `--judge=off` run.
  - **1 leg (`solo-tablet-wk`): a Firebase WebSocket console error in Safari.** Chased, not filed:
    it exposed a comment asserting the opposite of reality and a design question (does a solo
    voyage need a presence socket?) now parked for Wyatt. Not a game defect.
  - **⚠ 1 leg (`crew-phone`): THE ONE REAL PLAYER-FACING FINDING IN TEN LEGS — see below.**

## T-045 — 2026-09-01 — A GUEST ON A PHONE HAS A SAIL SQUARE IT CANNOT TAP — measured 2026-09-01. GATED: scope (closed 2026-09-01 · CEO 66 · commit 76c49bc (2 game files))

- [x] **A GUEST ON A PHONE HAS A SAIL SQUARE IT CANNOT TAP — measured 2026-09-01. GATED: scope (closed 2026-09-01 · CEO 66 · commit 76c49bc (2 game files))
      ⟨`T-045`⟩
  question posed to Wyatt (see BLOCKED ON WYATT) -- four days, seven probes, zero fixes; awaiting
  his call before an eighth probe. Wyatt has reported this shape before.** `crew-phone`, guest seat, DAY 1:
  `sea-trial-shots/crew-phone-guest-006-settled.png`. Two structural checks failed on one screen:
  `on-screen: clickable off-screen: sailCell` and
  `sail-clickable: 1 sail square(s) covered: a sail square <- nothing (outside any element)`.
  "Outside any element" means the square's own centre lands where there is no page at all — it is
  past the edge, not merely behind something. **The player consequence is exact: one of your sail
  options cannot be tapped, on the guest, on a phone, in a crew game — the configuration Wyatt
  actually playtests.**
  ⚠ **DO NOT FIX THIS BY GUESSING, AND DO NOT REACH FOR ANOTHER TRIAL.** CLAUDE.md rule 26 was
  earned on this exact bug: three probe runs and three 85-minute trials could not settle a
  placement question that two posed screenshots settled in minutes.

  **REPRODUCED, GEOMETRICALLY, TWICE, 2026-09-01 — `scripts/qa/sail_containment_crew_probe.mjs`.**
  A real two-browser crew room (boot flow copied from `playtest_gate.mjs`), driven turn-by-turn,
  measuring every `.sailCell` rect against the guest's own viewport at EVERY guest sail decision
  (not just the first — the original catch was several turns in). Two independent rooms, two
  different boards, **the identical failure**: one square, 41×41, centre at **exactly [-23,258]
  screen-relative both times** — 23px off the LEFT edge, its centre hitting nothing
  (`elementFromPoint` returns null there). Different grid cells each time ((1,9) then (3,8)), same
  screen position.
  ⚠ **CORRECTED IN THE OPEN, THIRD RUN, SAME SESSION: "fixed offset" was wrong.** A third
  reproduction (below) came back **24px off the RIGHT**, not the left. So it is not a constant
  left-hand shift — the magnitude (~23-24px) is consistent across all three catches so far, but the
  DIRECTION is not. That still narrows the search, just not the way the first two runs suggested:
  something is under-covering the frame by a near-constant AMOUNT on whichever edge the last
  highlighted square happens to sit past, not a one-directional bias.

  **THE CAMERA-DEFERRED-BY-A-CENTRE-STAGE-CARD THEORY IS NOW MEASURED, AND IT IS WRONG.**
  `src/ui/stage.js` `stageHoldsAttention()` (the only thing that can make `camTo()` remember a move
  instead of performing it) checks exactly two things: `body.pp4Cer` (the flip veil) and
  `actionPanel.dataset.pp4Stage` (a centre-stage card). At the reproduced moment: `body` classes
  were `"pp4Stage"` only (the ordinary phone-column layout, not the veil), and
  `actionPanel.dataset.pp4Stage` was `null`. One ordinary turn-announcement narration bubble
  (`.pp4Bub`, not yet `.out`) was on screen, and `stageHoldsAttention()` never reads `.pp4Bub` at
  all. **So the camera was never deferred — this correction replaces the earlier, unmeasured guess
  copied from the sail-squares-off-the-edge bug of 2026-08-27, which was a different investigation.**
  The comment already sitting in `src/ui/stage.js:196-216` (2026-08-29/30) is the more likely lead:
  a prior measurement of the *same shape* of bug ("six sail squares off the LEFT edge... the bbox
  genuinely contains every square — containment in BOARD coordinates is not containment on SCREEN")
  and says outright that two geometry theories were already tried and killed there — **read that
  comment and its own warning before touching `camFitCells`/`toScreen` again.**

  **SECOND THEORY MEASURED AND ALSO RULED OUT, THIRD RUN.** The HTML sail-square layer
  (`#sailHost`) is scaled/translated by a SEPARATE code path from the SVG board
  (`src/ui/stage.js`'s camera-sync block, the comment beginning *"EVERY HTML LAYER MAPPED TO THE
  BOARD NEEDS THE CAMERA COMPOSED IN"*) — it uses `W = vwPx()` where the SVG uses its own
  `getBoundingClientRect().width`. A mismatch between those two widths would explain a drift. **On
  a phone, measured, they are identical**: `documentElement.clientWidth=390`, `window.innerWidth=390`,
  `svg#board.getBoundingClientRect()` `= [left 0, width 390]` — all three agree exactly at the
  reproduced moment (`vwPx()` falls back to `window.innerWidth` on phone since `stageCappedRect()`
  is desktop-only by its own guard). **Not the cause.**

  **THIRD REPRODUCTION, WITH BOTH THEORIES' DIAGNOSTICS ATTACHED:** `sea_containment_crew_probe.mjs`
  now logs `#sailHost`'s live `transform` string alongside every reproduction — e.g.
  `scale(1.9) translate(-92.3684px, -118.368px)` — so the next session can decode the camera's own
  computed frame (`viewBox`) directly rather than re-deriving it. **Three for three now: every run
  of this probe has caught the bug on some guest sail turn.** This is common enough on a phone-sized
  guest that it is not a rare edge case — it is closer to routine.

  **WHERE THIS POINTS, FOR WHOEVER PICKS IT UP NEXT:** both the stage-hold theory and the two-width
  theory are now measured dead, in the open, so the search has narrowed to `camFitCells()`'s own
  containment math (`src/ui/stage.js` ~line 161-192) — specifically the `reservePx`/`room` shrink
  (`side = side / room`) and whether `camTo()`'s clamp (`Math.max(0, Math.min(640 - w, x))`) can
  push the frame's origin in a way that no longer contains the true bbox once the reserve has
  grown `side`.

  **THE FOURTH ATTEMPT — RED-PROOFED AND NOW TRUSTWORTHY, AND IT FOUND THE REAL SHAPE.** The
  previous entry here reported the viewBox/bbox comparison as "not yet trustworthy" because the
  numbers didn't add up — that diagnosis was right, but the cause was dumber than a stale seat:
  **the probe's own `split(/[\s,]+/)` lived inside an outer template literal, and an untagged
  template literal silently drops an unrecognized escape — `\s` became literal `s` before the
  string ever left this file.** `"151.5 194.2 336.8 336.8"` contains no `s`, so it never split at
  all, and every prior run of this diagnostic silently reported `viewBox=null`. Same trap the
  Glass corruption saga hit (backslashes halved on the way out). Fixed by splitting on a literal
  space (commit `438a6690`) — no regex needed, since the game always writes `viewBox` space-
  separated. **This is on the record as a correction, not quietly edited away — a wrong number
  from a broken instrument was almost the "finding."**

  With the parser fixed, two real occurrences in one room:
  - **Occurrence #1, CLEAN (0 outside).** Frame `x:151.6 y:194.2 w:336.8 h:336.8`. Reconstructed
    true bbox `x0:119.5 y0:162.1 x1:477.9 y1:563.2`. The frame is technically "short" of the
    reconstructed bbox by ~32 units on three sides — and nothing was off-screen anyway.
  - **Occurrence #2, REPRODUCED (2 outside — one on EACH side).** Frame
    `x:194.2 y:194.2 w:336.8 h:336.8`. True bbox `x0:119.5 x1:605.9` — **486 units wide, 150 units
    wider than the 336.8-unit frame**, and the shortfall lands almost exactly symmetric: 74.8 units
    short on the left, 74.8 short on the right — which is exactly what a frame centred on a bbox
    but too NARROW to contain it would do, and it matches the two actual overflowing squares
    (one off each side) almost perfectly.

  **WHAT THIS MEANS, STATED CAREFULLY, AS A LEAD NOT A PROVEN CAUSE.** `camFitCells()`'s own
  `side` can only ever GROW from `max(bw, bh)` — nothing in it can produce a frame narrower than
  the bbox it was handed. So a 337-wide frame against a 486-wide TRUE bbox means one of two things:
  either (a) the set of `.sailCell` elements `camFitSail()` actually measured, ONCE, 180ms after
  `pickCell()`, was NARROWER than the set that exists ~1200ms later when this probe (and a real
  player) looks at the screen — i.e. **more cells get added to the board AFTER the one-time camera
  fit already ran** — or (b) this probe's own cell-collection has a bug of its own not yet
  red-proofed. **(a) has a concrete candidate**: `src/ui/stage.js`'s own comment on
  `sailHighlightRect()` notes it is called from TWO places — `camFitSail` and "the trade-wind
  preview" — so a preview/sweep highlight arriving after the initial draw is a real, named
  mechanism that could widen the cell set post-fit.

  **(a) IS NOW RULED OUT, WITHOUT TOUCHING GAME CODE.** A `MutationObserver` on `#sailHost`,
  armed the instant `.sailCell` count first goes above zero, watched for any further additions
  through the whole ~1200ms settle window, across six occurrences now, including a fresh
  reproduction (14 squares at t=0, still 14 at measurement — one of them 23px off the RIGHT).
  Every single occurrence, clean or broken, held a perfectly steady count from the moment cells
  first appeared. Nothing is added to the board after the initial draw — this was not a timing
  race at all.

  **WHAT'S LEFT, NARROWED HONESTLY:** `camFitCells()`'s own logic (`side = Math.max(bw, bh)`,
  centred on the bbox's own centre) mathematically GUARANTEES containment of a bw x bh rectangle —
  a side x side square whose side is at least as large as both dimensions, centred on that same
  rectangle's centre, cannot fail to cover it, by construction, before the reserve step even runs
  (which can only grow `side` further). So either this probe's own bbox reconstruction still
  doesn't match the real inputs `camFitSail` uses (candidates worth checking: whether the real
  code's `cellPx`/grid or its exact seat differ from what this probe reads — the clean occurrences
  show non-zero, non-matching "shortfalls" on sides where nothing is actually wrong, which argues
  for this), or `camFitCells` genuinely has a containment bug that a geometry-only unit test (no
  browser needed: call `camFitCells`'s math directly with a known bw x bh and assert the returned
  frame contains it) would settle in minutes. **That unit test, not another probe run, is the
  concrete next step** — it removes every remaining uncertainty this session's DOM-based
  measurements could not (real DOM layout, camera timing, animation) by asking the pure math the
  question directly.

  **SIX RUNS, FOUR REPRODUCTIONS, ZERO WASTED — SESSION SUMMARY FOR WHOEVER PICKS THIS UP.**
  Overflow direction is not fixed (left once, right three times, once both sides at once);
  magnitude is consistently ~23-24px on the affected square. Two theories measured and killed
  (stage-hold; the HTML-layer-vs-SVG width mismatch). One theory measured and killed just now
  (cells added after the camera's one-time fit). **Still not fixed — correctly, per rule 26.**
  `scripts/qa/sail_containment_crew_probe.mjs` reproduces this on demand in about a minute; use it
  to verify any future fix rather than a full trial.

  Reproducible on demand: `node scripts/qa/sail_containment_crew_probe.mjs` (no fixed seed yet —
  each run is a fresh room; it has caught the bug on 2 of 2 runs so far, at occurrence #1 and #3 of
  the guest's sail turns). **Still not fixed — the mechanism this points at (a constant ~23px
  short on the left, in `camFitCells`/`toScreen`'s BOARD→SCREEN conversion) is a lead, not a
  measured cause.** Next step if picked up: instrument `toScreen()`/`camFitCells()` directly (log
  `S.cam.x/y/w`, `br.left`, `fixedOrigin()` at the reproduced moment) rather than guessing again —
  same posed-board discipline, one level deeper.

  **THE NAMED NEXT STEP IS DONE, 2026-09-01 — `camFitCells` ITSELF IS RULED OUT, NO BROWSER
  NEEDED.** `scripts/qa/cam_fit_cells_containment_check.mjs` (new, now wired into `npm test`, gate
  80/80): extracts the REAL `camFitCells()`/`camTo()`/`zoomCap()` from `src/ui/stage.js` by brace-
  matching (never a hand-copied re-implementation — that would test a description of the code, not
  the code) and runs them with no DOM at all, across a battery of shapes: a centre cluster, edge-
  adjacent clusters on both the left and right grid columns, five `reservePx` values up to a real
  phone prompt's height, the one line (`side = Math.min(side, 640)`) that is mathematically the ONLY
  place the function can shrink below its own subject, and — the decisive case — occurrence #2's own
  numbers from the probe above (true bbox 486.4 wide). **Every case held.** The reconstructed
  486.4-wide shape produced a frame exactly 486.4 wide, matching its own bbox to the pixel: this
  function's math cannot produce a 336.8-wide frame from a 486.4-wide subject, because
  `side = Math.max(bw, bh, ...)` provably cannot decrease except at the one traced-and-tested 640
  cap, which this case never reaches. **This means the two field numbers (486.4 true bbox, 336.8
  applied frame) cannot both describe the same `camFitCells` call** — so the remaining, narrower
  lead for whoever picks this up next is the PROBE'S OWN bbox reconstruction, not the function:
  `sail_containment_crew_probe.mjs` reads `win.activeTurnSeat` and `win.game.players[seat].pos` at
  MEASUREMENT time (after the ~1200ms settle wait) to reconstruct the ship's contribution to the
  true bbox, while the real `camFitSail()` reads the SAME fact at FIT time (180ms after `pickCell`).
  `applyActiveSeat()` is called from many sites, including `consumeEvent()` for every event carrying
  a `.p` field (`src/orchestrator.js:1601`) — so if `activeTurnSeat` or the ship's position changes
  between fit-time and measurement-time, the probe would reconstruct a bbox for a DIFFERENT ship
  than the one `camFitCells` actually received, without `camFitCells` doing anything wrong. **Not
  measured yet** — a live check would need to log the seat/ship-pos `camFitSail()` itself uses (not
  the probe's own later read) at the moment it runs, which needs a real two-browser room; not
  attempted this session, per rule 26 (a targeted single measurement, not another blind probe run,
  would be the next step, and it should be posed rather than driven).

  **A FOURTH LEAD, SOURCE-ONLY, NOT YET MEASURED — the guest's `#sailHost` transform can go stale
  against `#boardwrap`'s own width, and there is a real (if likely narrow) window for that.** Sail
  squares are positioned in `cqw` against `#boardwrap` (`container-type:inline-size`,
  `src/ui/flow.js:523,529-536`) — live, continuous, recomputed by the browser on every layout, with
  NO reference to the camera. `#sailHost` gets the camera composed IN as a separate CSS `transform`
  (`src/ui/stage.js:801-822`, `scale(640/c.w) translate(...)`), using `W = vwPx()`. Two real facts,
  each checked directly rather than assumed:
  - `vwPx()` (`src/ui/util.js:1203`) on a phone falls back to `document.documentElement.clientWidth
    || window.innerWidth` — the WHOLE VIEWPORT, not `#boardwrap`'s own measured rect.
  - `#boardwrap`'s two CSS states genuinely differ in what fills that role. Normal:
    `width:100%; max-width:min(820px, calc(100vh-210px))` inside `#game`/`#layout`, **both of which
    carry `padding:14px`** (`index.html:69,1213`) — so boardwrap's content width is narrower than
    the viewport by that padding, compounded through two ancestors. `body.pp4Stage #boardwrap`
    (`index.html:1698`): `position:fixed; inset:0; max-width:none` — escapes the padded ancestor
    chain entirely and is exactly viewport-width. **If `#sailHost`'s transform were computed while
    boardwrap was still in the FIRST state (or before `pp4Stage`'s box has settled) and then never
    recomputed, it would carry a `W` that no longer matches boardwrap's real box** — exactly the
    kind of small, constant-magnitude, direction-varying offset measured in the field.
  - **THE PART THAT WEAKENS IT, STATED HONESTLY RATHER THAN OMITTED:** `showStageLayer()` (which
    adds `body.pp4Stage`) is called ONCE, synchronously, from `showGameView()`
    (`src/ui/lobby.js:338-344`) when the lobby hands off to the actual game — well before recipe
    draft, turn order, or any sail prompt. So by the time a normal sail prompt fires, `pp4Stage`
    should already be long-settled, not toggling per-turn — which is the opposite of what this
    theory needs to explain a bug that shows up on ordinary later-game sail prompts, not just the
    first one. It does NOT rule the mechanism out (a brief post-boot layout/reflow window before
    the fixed box has fully applied, combined with `computeStageGeometry()`'s own `vb!==lastVB`
    memoization silently freezing a stale transform, could still do it once and never self-correct
    for the rest of the voyage) — but it means this is weaker than the clean per-turn race it first
    looked like, and it must not be reported as a cause without checking that specific window.
  - **THE ONE MEASUREMENT THAT WOULD SETTLE IT, NOT ATTEMPTED THIS SESSION** (to avoid a live probe
    colliding with the browser-driven investigation other sessions are actively running on the same
    files right now): on a failing guest, at the moment of the bug, read `#boardwrap
    .getBoundingClientRect().width` and `vwPx()` side by side. Equal ⇒ this lead is dead, the same
    way the two-width theory above already died. Different ⇒ this is very likely the mechanism, and
    the fix is either recomputing `#sailHost`'s transform outside the `vb!==lastVB` memo (keyed on
    boardwrap's own rect too, not just the camera's board-unit rectangle) or reading `#boardwrap`'s
    own `getBoundingClientRect().width` instead of `vwPx()` at line 815.

## T-046 — 2026-09-01 — Full sea trial, re-run against the fixed 465-commit branch, build 2026.08.31.2 — the underlying voyage data is CONFIRMED CURRENT, but the "re-run" itself never happened this session, and that gap is worth recording plainly. The 03:07Z attempt that showed PROGRESSING at 03:35Z died silently overnight (no .planning/wyclau/LONG-RUN marker survived it, and .planning/SEA-TRIAL-465-check-3.md sat stuck at "IN PROGRESS" for three hours). Relaunched 2026-09-01 06:29Z at the same --report= path. It "finished" in 1 minute and reported "10 of 10 voyage(s) sailed" — which is misleading. sea-trial-shots/log.txt (the real log, not the summary report) says plainly: *"10 of 10 leg(s) were resumed from a previous attempt at this build — they were NOT re-sailed."* Every leg's cache file under sea-trial-shots/legs/*--2026.08.31.2.json predates this run (newest at 01:17Z) — readDone() correctly matched them on build stamp and reused them, exactly as designed, but the markdown report's own "voyages that did NOT run: none" line does not distinguish RESUMED from FRESHLY SAILED, which is a real gap in the one file rule 24 says to trust at face value. Parking that as a one-line note, not fixing it now (rule 7): sea_trial.mjs's report should print a resumed-count line the way it already prints a not-run column.

- [x] **Full sea trial, re-run against the fixed 465-commit branch, build `2026.08.31.2` — the underlying voyage data is CONFIRMED CURRENT, but the "re-run" itself never happened this session, and that gap is worth recording plainly.** The 03:07Z attempt that showed PROGRESSING at 03:35Z died silently overnight (no `.planning/wyclau/LONG-RUN` marker survived it, and `.planning/SEA-TRIAL-465-check-3.md` sat stuck at "IN PROGRESS" for three hours). Relaunched 2026-09-01 06:29Z at the same `--report=` path. **It "finished" in 1 minute and reported "10 of 10 voyage(s) sailed" — which is misleading.** `sea-trial-shots/log.txt` (the real log, not the summary report) says plainly: *"10 of 10 leg(s) were resumed from a previous attempt at this build — they were NOT re-sailed."* Every leg's cache file under `sea-trial-shots/legs/*--2026.08.31.2.json` predates this run (newest at 01:17Z) — `readDone()` correctly matched them on build stamp and reused them, exactly as designed, but **the markdown report's own "voyages that did NOT run: none" line does not distinguish RESUMED from FRESHLY SAILED**, which is a real gap in the one file rule 24 says to trust at face value. Parking that as a one-line note, not fixing it now (rule 7): `sea_trial.mjs`'s report should print a resumed-count line the way it already prints a not-run column.
      ⟨`T-046`⟩
  ⚠ **What this means for "is the branch trial-clean": the resumed data is the SAME build's already-fully-triaged 10-leg result** (see the TEN-LEG VERDICT entry below, same build stamp) — 6 legs settle-timing noise, 1 Safari WebSocket comment/design question, 1 the real crew-phone sail-square finding above. No game code has changed since those records were made, so a genuinely fresh re-sail would almost certainly reproduce them identically; the ~1-3.5 hour cost of proving that seemed like a poor trade against the sail-square investigation. **Genuinely new in this run: `npm test` showed one FAIL** — `watchdog_one_engine_check.mjs`'s fixture expects no live engine on the machine when it runs, and detected THIS session itself (a real watchdog-started Bosun) as "an engine is already running," which is the gate's own correct behaviour aimed at the wrong target. Not a game bug; parked, one line, per rule 7 — the fixture needs to exclude the current test-runner's own process, or should_launch.mjs's engine check needs an override for exactly this case. Every OTHER `npm test` check passed.

## T-047 — 2026-09-01 — THE watchdog_one_engine_check/watchdog_liveness_check FALSE FAIL — FIXED 2026-09-01,

- [x] **THE `watchdog_one_engine_check`/`watchdog_liveness_check` FALSE FAIL — FIXED 2026-09-01,
      ⟨`T-047`⟩
  and it was blocking the back half of `npm test` on EVERY watchdog-started session, not just the
  one that first noticed it.** Both gates run the REAL `watchdog.ps1` against a throwaway fixture
  repo — right, per the "gate aimed at the wrong tree" lesson (§2 of this file) — but `watchdog.ps1`'s
  own engine-presence check (`Get-CimInstance Win32_Process -Filter "Name='claude.exe'"`) is
  deliberately MACHINE-GLOBAL, with no way to scope it to the fixture. So from inside a live
  watchdog session it correctly detects the CALLING session's own process and holds off on every
  fixture tick — not a bug in the watchdog, but an assumption the gates could no longer make once
  running-from-inside-a-watchdog-session became the normal way this project works. **Because
  `npm test` chains with `&&`, this silently swallowed every gate after it** (`chrome_discovery_check`
  through `doc_command_check`, ~13 gates) on every such run — a green run further up the chain was
  never proof the whole suite ran.
  Fixed by a shared preflight (`scripts/qa/lib/real_engine_check.mjs`): list every real `claude.exe`'s
  command line and test for `-p .../door` with a plain regex, then SKIP loudly (never silently pass)
  when a real engine is found, in both gates — `watchdog_liveness_check`'s pure-source structural
  half still runs unconditionally, only its six behavioural fixture assertions are skipped. Measured,
  not copied from `watchdog.ps1`: its own `-Filter`/`-like` pair returned ZERO hits against this
  exact session's command line when tested directly, so copying it would have reproduced the same
  blind spot rather than avoided it. `npm test` now runs to completion (80/80 gates, including the
  new `cam_fit_cells_containment_check` above) from inside this very watchdog session — verified by
  running it, not assumed. Gear: package.json + two `scripts/qa/*.mjs` files only, no `src/` or
  `index.html` touched — a full sea trial is not proportionate to a change that cannot reach a
  player; `npm test` green is the right depth here.

## T-048 — 2026-09-01 — ⚠ THE SEA TRIAL'S SCORECARD CANNOT EVER SAY A LEG SAILED — this blocks the release, and it (closed 2026-09-01 · CEO 75 · no game diff — fixed in the instrument, not the game: one stamped record now serves both the per-leg file and report.json, and the gate that could not fail was rebuilt to execute both files' real code)

- [x] **⚠ THE SEA TRIAL'S SCORECARD CANNOT EVER SAY A LEG SAILED — this blocks the release, and it (closed 2026-09-01 · CEO 75 · no game diff — fixed in the instrument, not the game: one stamped record now serves both the per-leg file and report.json, and the gate that could not fail was rebuilt to execute both files' real code)
      ⟨`T-048`⟩
  is the next watch's item. Measured 2026-09-01, CEO Review 74, re-measured by the watch before
  being written here.** `scripts/sea_trial.mjs:258` clears a leg only when `leg.__runId === runId`,
  reading `leg` out of `sea-trial-shots/report.json`. But `scripts/playtest_gate.mjs:609` writes
  `__runId` into the **per-leg** file only, and `:653` builds `report.json` from the raw `results`
  array, which never had `__runId` added. Measured, not reasoned: `grep -c "__runId"
  sea-trial-shots/report.json` → **0**, while `sea-trial-shots/runid.json` holds
  `{"runId":"2026.09.01.6-mtiwe6sl"}`. So `sailedHere()` returns false for **every leg of every run
  on every machine, always**, and `sea_trial.mjs:265` then files each leg under NOT RUN *using its
  own verdict text as the reason it did not run*.
  **That is the entire explanation of the release trial's headline** — `.planning/SEA-TRIAL-2026-09-01T1644Z-Wy-Blade.md`
  reads "FAILED — 0 of 10 voyage(s) sailed, 10 NOT RUN" while its own log holds twelve
  `END OF VOYAGE` lines. The ten legs sailed; whether they PASSED is a separate question the report
  no longer answers.
  ⚠ **AND THE GATE WRITTEN TO PREVENT EXACTLY THIS IS GREEN AND CANNOT FAIL.**
  `scripts/qa/notrun_provenance_check.mjs:43,47` asserts *"report.json carries the run id too"* by
  grepping **`playtest_gate.mjs`'s SOURCE TEXT** for `/__runId/`, and tests `sailedHere` against
  hand-built objects — it never opens a real `report.json`. A gate that greps the source of the
  thing it guards is checking that somebody wrote the word, not that the file has the field. **Fix
  the gate in the same change as the bug, or the next reader gets the same false assurance.**
  **DO NOT MAKE A RELEASE DECISION ON THAT REPORT UNTIL THIS IS FIXED** — rule 24 stands on opening
  the report and believing it, and right now it is lying in the pessimistic direction. Pessimistic
  is the safe direction and it is still a lie.

## T-049 — 2026-09-02 — THE RELEASE TRIAL'S ONE PLAYER-FACING FINDING IN TEN LEGS: a call circle drawn on the question it answers. (closed 2026-09-02 · CEO 84 · commit e191ad7 (1 game file))

- [x] **THE RELEASE TRIAL'S ONE PLAYER-FACING FINDING IN TEN LEGS: a call circle drawn on the question it answers.** (closed 2026-09-02 · CEO 84 · commit e191ad7 (1 game file))
      ⟨`T-049`⟩
  `2026-09-01T1914Z-Wy-Blade`, leg `passplay-phone`, `no-cover-ask` — *"Call Flaky Jack" over
  "Davy Scones — a battle's brewi[ng]"*. You are asked by name to pick a winner and the circle you
  must tap covers the sentence asking you. Posed, not sailed (rule 26):
  `scripts/qa/w54_call_clear_of_ask.mjs`, 21 posed fights across 390x844, 390x664 and 768x1024.

## T-010 — 2026-09-02 — ★★ deploy-staging.sh COULD NOT RUN ON THE BLADE AT ALL — and it was NOT the permission

- [x] **★★ `deploy-staging.sh` COULD NOT RUN ON THE BLADE AT ALL — and it was NOT the permission
      ⟨`T-010`⟩
      wall. FIXED AND STAGING IS LIVE** (closed 2026-09-02 · CEO 90 · commits `ecd2067c` + `3066ee07` ·
      no game diff — `scripts/deploy-staging.sh` paths + one new gate; `src/` and `index.html` untouched,
      `PP4_STAMP` not bumped).
      **STAGING SERVES `2026.09.01.8-staging@b2b4e28f`, curled by a fresh CEO — up from `2026.09.01.6`,
      and the first time in four verdicts that staging and the tree agree.** The fix keeps the rsync
      line byte-identical (rule 14) and changes only the paths handed to it: a `rsync_path()` helper
      gated on `uname -s`, plus `MSYS_NO_PATHCONV=1`. **Wyatt asked, before it was written, whether it
      would still let the Mac and the cloud containers deploy** — so `scripts/qa/deploy_rsync_paths_check.mjs`
      FORCES the non-Windows branch and asserts byte-identity, and CEO 90 proved that assertion can
      fail (Windows branch on → the Mac's path is mangled; off → identical). **Its fair caveat, kept
      rather than buried: forcing an env var is not literally being on Darwin, and nothing tests that
      `Darwin` lands on the `*)` arm — four lines, read and correct, but one notch weaker than
      "tested".**
      ⚠ **AND THE GATE WRITTEN TO ANSWER HIS QUESTION BROKE THE BUILD, which is the lesson worth more
      than the fix.** Its two sample paths were the Mac's and a container's, hard-coded — tripping
      `tree_health_check`'s rule that no script may name one person's computer. The session then told
      Wyatt *a different session* had turned `npm test` red **without running `gate_count_check`**,
      which reports 93 declared against 93 in the chain. **The fourth unmeasured claim of the night,
      and the only one written into a commit message where it would outlive the session.** Fixed with
      generic POSIX shapes — identity does not care whose machine a string names.
      *(The original filing follows, kept because its measurements are what found the cause.)*
      With `"Bash(bash scripts/deploy-staging.sh*)"` added to
      `.claude/settings.json` at Wyatt's instruction, the script runs and dies at
      `scripts/deploy-staging.sh:133` — `rsync -a --delete "${EXCLUDES[@]}" "$SRC/" "$WORK/staging/"`
      — with *"The source and destination cannot both be remote."*
      **TWO LAYERS, BOTH MEASURED, NEITHER GUESSED (an earlier guess in this same session said
      "a Windows drive-letter colon" and that was WRONG — `pwd` returns `/c/Users/...`, no colon):**
      1. **Git Bash rewrites any argument beginning with `/` into a Windows path before the exe sees
         it.** So `/c/Users/…` reaches rsync as `C:\Users\…`, rsync reads `C:` as a *hostname*, and
         with both arguments converted it reports both as remote. **Proof:** with
         `MSYS_NO_PATHCONV=1` the "both remote" error disappears entirely and rsync parses both as
         local paths. With only ONE argument converted it says *"ssh: Could not resolve hostname c:"*
         — naming the phantom host out loud.
      2. **The rsync on PATH is a CYGWIN build**, `/c/ProgramData/chocolatey/bin/rsync` 3.4.1 — it
         wants `/cygdrive/c/…` and does not resolve Git Bash's `/c/…`. **Proof:** its own error
         message resolves a relative path to `/cygdrive/c/Users/wyatt/Projects/pastrypirates/…`.
      **THE WORKING FORM, VERIFIED AT EXIT 0:**
      `MSYS_NO_PATHCONV=1 rsync -a --dry-run /cygdrive/c/…/package.json /cygdrive/c/…/rtest5`
      **THE FIX, AND IT MUST NOT BE A HAND-ROLLED SYNC (rule 14 — two sessions came within one
      command of taking the live game down here):** inside `deploy-staging.sh`, keep the rsync line
      exactly as it is and make the PATHS right — `SRC="$(cygpath -u "$(cygpath -w "$SRC")")"` or
      simply `/c/` → `/cygdrive/c/`, with `MSYS_NO_PATHCONV=1` exported for the call. **Derive it
      from `cygpath`, never a string swap somebody typed** (rule 9). Gate it: a check that the
      script's rsync arguments resolve on this machine, red-proofed by pointing it at the `/c/` form.
      **WHY IT MATTERS BEYOND TONIGHT:** staging has been stuck on `2026.09.01.6` for four CEO
      verdicts running while the tree is on `.8`, and every account of *why* has named the permission
      layer. **The permission layer was real and is now gone — and at the moment this was written,
      staging still did not deploy.** *(That sentence was true when filed and is now false: it deploys.
      CEO 90 caught it still standing on the page an hour later, which is precisely the staleness the
      Chartkeeper exists to reap — a row correct at its writing and wrong on his phone.)*
      Every "staging is blocked on Wyatt" line written before this row was, at best, half the answer.
      **The same shape is already on the record:** `openWebKit()` handed a raw Windows path to
      `import()`, which read `c:` as a protocol and reported *"playwright not found"* while
      playwright was installed — Chart row "Sail the three Safari legs", 2026-09-01. **Second
      sighting of a Windows path read as a protocol. Sweep for a third (rule 8).**

## T-078 — 2026-09-02 — ★★★ INVERT vendor_check.mjs — HIS RULING, AND IT IS THE KEYSTONE THAT UNBLOCKS (closed 2026-09-02 · CEO 106 · no game diff — no game code is right -- the ask is the vendoring gate; inversion finished to his condition and gated, kit-behind detector SPLIT to its own row)

- [x] **★★★ INVERT `vendor_check.mjs` — HIS RULING, AND IT IS THE KEYSTONE THAT UNBLOCKS (closed 2026-09-02 · CEO 106 · no game diff — no game code is right -- the ask is the vendoring gate; inversion finished to his condition and gated, kit-behind detector SPLIT to its own row)
      ⟨`T-078`⟩
      EVERYTHING ELSE.** 2026-09-02, question UI. **Sizing: small, and it is the highest-leverage
      small thing on this Chart.**
      **His model, which reverses what the tooling enforces:** *"claude-kit is intended to be a repo
      where the DESIGN of our system is made… but our system must operate LOCALLY in its OWN REPO."*
      Today `scripts/qa/vendor_check.mjs:47-58` finds every `VENDORED-FROM` and **fails the build on
      any local edit** — the kit is authoritative at runtime, which is exactly backwards.
      **What it becomes:** the project copy is the truth. The check no longer blocks a local edit; it
      **reports that the KIT is behind** — a condition that has already occurred and went unnoticed
      (claude-kit commit `8691117`: *"the kit's glass.mjs was 104 lines behind the repo it vendors
      into"*).
      **WHY THIS IS FIRST: five patches and two of his own rulings are dammed behind this one gate.**
      `PENDING-KIT-PATCHES.md` 1, 2, 5 and 6 are all `glass.mjs`; patch 4 is the Door. **The moment
      the lock inverts, every one of them becomes an ordinary project edit.**
      ⚠ **DO NOT ALSO DELETE THE CHECK.** He chose *invert*, not *delete*, over an option that
      offered deletion — the drift signal is the point, only its direction was wrong. Red-proof both
      ways: a local edit must NOT fail; a kit that has fallen behind must be reported.

## T-018 — 2026-09-02 — Record the change-gate's verdict even when it is overridden — the runbook's override (closed 2026-09-02 · CEO 100 · no game diff — no game diff -- the ask is the Glass tick's runbook and its change-gate, not the game; shipped as glass_gate_log.mjs + glass_gate_verdict_logged_check.mjs (14 cases, red-proofed twice), commit 229843cf. What is LEFT is T-074 and T-075, written as their own rows)

- [x] **Record the change-gate's verdict even when it is overridden** — the runbook's override (closed 2026-09-02 · CEO 100 · no game diff — no game diff -- the ask is the Glass tick's runbook and its change-gate, not the game; shipped as glass_gate_log.mjs + glass_gate_verdict_logged_check.mjs (14 cases, red-proofed twice), commit 229843cf. What is LEFT is T-074 and T-075, written as their own rows)
      ⟨`T-018`⟩
      clause lets a tick skip `glass_needs_publish.mjs` when the harvest already forced a publish.
      The publisher's own words: *"'the answer was moot' and 'the gate ran and I have a verdict on
      record' are different things, and only the second is auditable."* Override the ACTION, not the
      CHECK. From outside, a skipped gate and an unwired gate look identical.
      ### ⚑ THE MECHANISM SHIPPED 2026-09-02T10:33Z AND ITS FIRST USE CAUGHT A REAL SKIP — TWO ROWS BELOW CARRY WHAT IS LEFT.
      `glass_gate_log.mjs` wraps the gate, appends one line to `.planning/wyclau/GATE-LOG` on every
      run, and hands back the gate's own exit code; `--harvested` overrides only the exit code, so
      the gate's REAL verdict is still what gets written down. Runbook step 3 calls it
      unconditionally. Gate `glass_gate_verdict_logged_check.mjs`, 14 cases, red-proofed twice
      (once with no wrapper at all, once with three deliberate breakages after CEO 100).

## T-079 — 2026-09-02 — npm test IS RED, AND WHAT IT IS RED ABOUT IS HIS OWN TOP PRIORITY FALLING OFF THE (closed 2026-09-02 · CEO 104 · no game diff — no game code is right -- the ask is the Chartkeeper's ranking signal, not the game: commit ed827799, npm test 99/99)

- [x] **`npm test` IS RED, AND WHAT IT IS RED ABOUT IS HIS OWN TOP PRIORITY FALLING OFF THE (closed 2026-09-02 · CEO 104 · no game diff — no game code is right -- the ask is the Chartkeeper's ranking signal, not the game: commit ed827799, npm test 99/99)
      ⟨`T-079`⟩
      TOP OF HIS LIST.** Filed by the 11:40Z watch, which found it in its own sweep and did NOT
      take it (one item per watch). **Not caused by that watch's change** — measured, not assumed:
      `chartkeeper_check.mjs` reads `CHART.md`, and the closing commit `42958113` does not touch
      that file.
      **THE FAILING CASE, in its own words:** *"the real Chart's top row is 'Your ruling: merge the
      465-commit branch to main…' — his four-times-asked request must rank first, and the spec says
      so in its own words."*
      **WHAT ACTUALLY HAPPENED, and it is worth more than the red build.** At 11:41Z the Chartkeeper
      ranked `T-001` (build the Chartkeeper — **his four-times-asked request**) **first, at 156**.
      By 11:50Z it was not in the top nine. The only thing that changed is commit `8178eb29`, in
      which another session filed two genuinely good, genuinely unrelated questions into
      **BLOCKED ON WYATT**. `T-001`'s score carries a **+40 for "something it was waiting on has
      landed"**, derived from that section being EMPTY — so filling it with anything at all silently
      demotes every row that points there.
      **THE DEFECT IS THE SIGNAL, NOT THE SCORE.** *"Points at BLOCKED ON WYATT, which is empty"* is
      a section-level test standing in for a row-level fact. It cannot tell *"the question THIS row
      waits on has been answered"* from *"somebody asked an unrelated question."* Same shape as the
      fault CEO 93 already found in this tool: **REAP measures a POINTER, and a pointer is not the
      thing it points at.**
      **AND IT IS THE ACCEPTANCE TEST FAILING, WHICH IS THE POINT.** The Chartkeeper exists because
      his repeated asks kept sinking on this list. It just happened again, to the row that asks for
      the Chartkeeper, by the mechanism the Chartkeeper was meant to remove. **Do not fix this by
      relaxing the gate case.**
      **SIZE:** small-to-medium, entirely in `lib/chart_model.mjs` / `chartkeeper.mjs`, no game code.
      Make the signal row-level — a row is unblocked when the question IT cites is answered — and
      red-proof it by adding an unrelated BLOCKED ON WYATT row and checking the ranking does not move.

## T-050 — 2026-08-31 — Gate retirement policy wired (quiet per-bug gates → archive; suite ceiling) — SHIPPED 2026-08-31 19:52Z. gates.ceiling in package.json (started at the exact current total, 71, so the next gate is the first conscious decision) + scripts/qa/gate_ceiling_check.mjs, red-proofed by planting total=72 on the real file and watching it fail before restoring it. scripts/qa/quiet_gate_report.mjs (advisory, NOT in npm test — retirement stays a human call, per docs/HARD-WON-LESSONS.md §12i) lists real wired-in per-bug gates only, after a scoping bug caught before shipping: it first matched every w##_/q##_ FILE in scripts/qa/, including one-off probes never wired into the suite at all. scripts/qa/gate_archive/ exists for retirements. Full policy: docs/GATE-RETIREMENT.md. npm test 71/71.

- [x] Gate retirement policy wired (quiet per-bug gates → archive; suite ceiling) — SHIPPED 2026-08-31 19:52Z. `gates.ceiling` in `package.json` (started at the exact current total, 71, so the next gate is the first conscious decision) + `scripts/qa/gate_ceiling_check.mjs`, red-proofed by planting `total=72` on the real file and watching it fail before restoring it. `scripts/qa/quiet_gate_report.mjs` (advisory, NOT in `npm test` — retirement stays a human call, per `docs/HARD-WON-LESSONS.md` §12i) lists real wired-in per-bug gates only, after a scoping bug caught before shipping: it first matched every `w##_/q##_` FILE in `scripts/qa/`, including one-off probes never wired into the suite at all. `scripts/qa/gate_archive/` exists for retirements. Full policy: `docs/GATE-RETIREMENT.md`. npm test 71/71.
      ⟨`T-050`⟩

## T-051 — 2026-08-31 — Glass v2 — the two-way interface (ideas box on the page; the page saves itself; sessions woken by his writes; harvest rule in the Door; gate glass_roundtrip_check, red-proofed both ways) — shipped 2026-08-31, first live save pending Wyatt's first tap

- [x] **Glass v2 — the two-way interface** (ideas box on the page; the page saves itself; sessions woken by his writes; harvest rule in the Door; gate `glass_roundtrip_check`, red-proofed both ways) — shipped 2026-08-31, first live save pending Wyatt's first tap
      ⟨`T-051`⟩

## T-052 — 2026-08-31 — Full sea trial against the 465-commit branch — RAN, FAILED 2026-08-31 23:56Z. Started 21:31:53Z, 144 min, .planning/SEA-TRIAL-465-check.md. 7 of 10 legs FAILED with the identical crash (every Chromium leg — solo, pass-and-play, crew, desktop/phone/tablet): TypeError: Cannot read properties of undefined (reading 'replace') at pname (src/ui/util.js:289:27) at pn (...). pname(i) does NAMES[i].replace(...); pn() wraps it and is called all over event narration as pn(e.p)/pn(order[i]) with an event-participant or turn-order index. Traced the likely site: showTurnOrderIntro() (src/ui/flow.js:2965) succeeded (its own screen rendered, screenshot-confirmed) — the crash lands in the FIRST post-turn-order event narration, most likely the dock heads/tails line (src/ui/util.js:499, pn(e.p)), which crashes uniformly across every mode right at the start of day 1. Checked the graveyard (rule 10): the recent p→player local-variable rename (b3c7b12c) is function-scoped by design and does not touch the engine's event emission (this.ev({t:"dock",p:p.idx,...}) at src/engine/index.js:996 is unchanged) — RULED OUT as the cause, not confirmed as it. 3 WebKit legs (-wk) additionally NOT RUN — Playwright isn't installed on this machine (~/.pw missing), a Razer setup gap, not a code defect. NOT MEASURED YET: the exact line producing the undefined index — the crash trace was truncated by the test harness's own 200-char console-capture limit, found and widened to 2000 chars (scripts/lib/cdp.mjs, commit 27a9f382) so the next run will show it directly; a quick single-leg repro to get that trace timed out after 10 min without completing and was not re-attempted this session. NOT DEPLOYED TO STAGING — a build that cannot finish a single voyage is not ready to show him.

- [x] **Full sea trial against the 465-commit branch — RAN, FAILED 2026-08-31 23:56Z.** Started 21:31:53Z, 144 min, `.planning/SEA-TRIAL-465-check.md`. **7 of 10 legs FAILED with the identical crash** (every Chromium leg — solo, pass-and-play, crew, desktop/phone/tablet): `TypeError: Cannot read properties of undefined (reading 'replace') at pname (src/ui/util.js:289:27) at pn (...)`. `pname(i)` does `NAMES[i].replace(...)`; `pn()` wraps it and is called all over event narration as `pn(e.p)`/`pn(order[i])` with an event-participant or turn-order index. Traced the likely site: `showTurnOrderIntro()` (`src/ui/flow.js:2965`) succeeded (its own screen rendered, screenshot-confirmed) — the crash lands in the FIRST post-turn-order event narration, most likely the dock heads/tails line (`src/ui/util.js:499`, `pn(e.p)`), which crashes uniformly across every mode right at the start of day 1. Checked the graveyard (rule 10): the recent `p`→`player` local-variable rename (`b3c7b12c`) is function-scoped by design and does not touch the engine's event emission (`this.ev({t:"dock",p:p.idx,...})` at `src/engine/index.js:996` is unchanged) — RULED OUT as the cause, not confirmed as it. 3 WebKit legs (`-wk`) additionally NOT RUN — Playwright isn't installed on this machine (`~/.pw` missing), a Razer setup gap, not a code defect. **NOT MEASURED YET**: the exact line producing the undefined index — the crash trace was truncated by the test harness's own 200-char console-capture limit, found and widened to 2000 chars (`scripts/lib/cdp.mjs`, commit `27a9f382`) so the next run will show it directly; a quick single-leg repro to get that trace timed out after 10 min without completing and was not re-attempted this session. **NOT DEPLOYED TO STAGING** — a build that cannot finish a single voyage is not ready to show him.
      ⟨`T-052`⟩

## T-053 — 2026-08-31 — wyclau source moves to claude-kit as the kit's second module; pastrypirates vendors it — SHIPPED 2026-08-31. *(his pick 2026-08-31)* claude-kit/plugins/wyclau/ now holds the canonical edit source (glass.mjs, mark_glass_published.mjs, watchdog.ps1/.sh, wyclau-pulse.cjs, wyclau-stop-keep-working.cjs, Door SKILL.md); install.sh generalized to multi-module (vendor/check <repo> [module], default org), the org case unchanged. pastrypirates' .claude/wyclau/ is a pure tracking anchor (VENDORED-FROM + MANIFEST.sha256, 7 files hashed) — the real files stay exactly where they already worked (scripts/wyclau/*, .claude/hooks/wyclau-*.cjs, .claude/skills/door/SKILL.md), nothing moved or renamed. Verified byte-identical to pastrypirates' current source before vendoring. CEO Review 55: YES, independently verified all seven points (full text in CEO-REVIEWS.md); its one actionable flag (no local marker showing a file is vendored) fixed same-pass — a header comment added to all seven files, both repos, re-vendored. bash install.sh check <this repo> wyclau reports IN STEP against claude-kit e61b4fe. npm test 74/74.

- [x] **wyclau source moves to claude-kit as the kit's second module; pastrypirates vendors it — SHIPPED 2026-08-31.** *(his pick 2026-08-31)* `claude-kit/plugins/wyclau/` now holds the canonical edit source (glass.mjs, mark_glass_published.mjs, watchdog.ps1/.sh, wyclau-pulse.cjs, wyclau-stop-keep-working.cjs, Door SKILL.md); `install.sh` generalized to multi-module (`vendor/check <repo> [module]`, default `org`), the `org` case unchanged. pastrypirates' `.claude/wyclau/` is a pure tracking anchor (VENDORED-FROM + MANIFEST.sha256, 7 files hashed) — the real files stay exactly where they already worked (`scripts/wyclau/*`, `.claude/hooks/wyclau-*.cjs`, `.claude/skills/door/SKILL.md`), nothing moved or renamed. Verified byte-identical to pastrypirates' current source before vendoring. **CEO Review 55: YES**, independently verified all seven points (full text in `CEO-REVIEWS.md`); its one actionable flag (no local marker showing a file is vendored) fixed same-pass — a header comment added to all seven files, both repos, re-vendored. `bash install.sh check <this repo> wyclau` reports IN STEP against claude-kit `e61b4fe`. npm test 74/74.
      ⟨`T-053`⟩

## T-054 — 2026-08-31 — Mechanically enforce the Glass harvest rule — .claude/hooks/glass-harvest-first.cjs + gate glass_harvest_hook_check (red first on the unregistered-hook case, red-proofed both ways), 2026-08-31

- [x] Mechanically enforce the Glass harvest rule — `.claude/hooks/glass-harvest-first.cjs` + gate `glass_harvest_hook_check` (red first on the unregistered-hook case, red-proofed both ways), 2026-08-31
      ⟨`T-054`⟩

## T-055 — 2026-08-31 — THE KEEP-WORKING STOP HOOK — SHIPPED 2026-08-31. Wyatt: *"why have you stopped working? your mission is to continuously work until every single task is finished... we already know that behavioral fixes get ignored."* .claude/hooks/wyclau-stop-keep-working.cjs, registered in settings.json's Stop array. First shipped firing in every session, interactive included (his live correction that day, overriding his own first answer "only unattended"); superseded the same day by the Quartermaster's scope change: fires ONLY in a session scripts/wyclau/watchdog.ps1 started, gated on an environment stamp ($env:PP_BOSUN = "1", set immediately before Start-Process, inherited by the child) rather than an inference — never in Wyatt's terminal, never in a cloud session. The preemption slot (PREEMPT.md) was removed in the same change — it existed to protect Wyatt's interactive window, which no longer runs this hook at all; steering now goes through the Chart's BLOCKED ON WYATT table as normal. Three brakes remain, in order: (0) stop_hook_active never blocks twice in one turn; (1) the Glass publish lag (moved here from npm test, CEO Review 52); (2) gives up on the 4th check of the same stuck item with no commit landing in between, having blocked on 1/2/3 (an off-by-one CEO Review 52 also found and fixed — the first version gave up after only 2 blocks); (3) allows the stop once every open STEP 1 CHECKLIST line is either done or carries the literal marker GATED: — including indented lines, another CEO Review 52 finding (the original regex only matched column zero). The Door's 6th situation-report line, "watchdog stamp: PRESENT/ABSENT", is the Quartermaster's silent-failure guard for Start-Process's env inheritance, which could not be tested from a container. Gate scripts/qa/wyclau_stop_hook_check.mjs, 16 cases against the real hook file (never a copy — HARD-WON-LESSONS §12i), red-proofed in both directions per the Quartermaster's instruction: PP_BOSUN unset with real unblocked work present still allows the stop; a planted broken gate blocks when it should not. npm test 72/72.

- [x] **THE KEEP-WORKING STOP HOOK — SHIPPED 2026-08-31.** Wyatt: *"why have you stopped working? your mission is to continuously work until every single task is finished... we already know that behavioral fixes get ignored."* `.claude/hooks/wyclau-stop-keep-working.cjs`, registered in `settings.json`'s `Stop` array. First shipped **firing in every session, interactive included** (his live correction that day, overriding his own first answer "only unattended"); **superseded the same day by the Quartermaster's scope change**: fires ONLY in a session `scripts/wyclau/watchdog.ps1` started, gated on an environment stamp (`$env:PP_BOSUN = "1"`, set immediately before `Start-Process`, inherited by the child) rather than an inference — never in Wyatt's terminal, never in a cloud session. **The preemption slot (`PREEMPT.md`) was removed in the same change** — it existed to protect Wyatt's interactive window, which no longer runs this hook at all; steering now goes through the Chart's `BLOCKED ON WYATT` table as normal. Three brakes remain, in order: (0) `stop_hook_active` never blocks twice in one turn; (1) the Glass publish lag (moved here from `npm test`, CEO Review 52); (2) gives up on the 4th check of the same stuck item with no commit landing in between, having blocked on 1/2/3 (an off-by-one CEO Review 52 also found and fixed — the first version gave up after only 2 blocks); (3) allows the stop once every open `STEP 1 CHECKLIST` line is either done or carries the literal marker `GATED:` — including indented lines, another CEO Review 52 finding (the original regex only matched column zero). The Door's 6th situation-report line, "watchdog stamp: PRESENT/ABSENT", is the Quartermaster's silent-failure guard for `Start-Process`'s env inheritance, which could not be tested from a container. Gate `scripts/qa/wyclau_stop_hook_check.mjs`, 16 cases against the real hook file (never a copy — HARD-WON-LESSONS §12i), red-proofed in both directions per the Quartermaster's instruction: `PP_BOSUN` unset with real unblocked work present still allows the stop; a planted broken gate blocks when it should not. npm test 72/72.
      ⟨`T-055`⟩

## T-056 — 2026-08-31 — GLASS REDESIGN — Wyatt's seven priorities, in his words — SHIPPED 2026-08-31 18:37Z, rendered and screenshotted locally (light + dark) before publishing, one real mojibake bug found and fixed by looking at the picture. Full detail in scripts/wyclau/glass.mjs's own header.

- [x] **GLASS REDESIGN — Wyatt's seven priorities, in his words** — SHIPPED 2026-08-31 18:37Z, rendered and screenshotted locally (light + dark) before publishing, one real mojibake bug found and fixed by looking at the picture. Full detail in `scripts/wyclau/glass.mjs`'s own header.
      ⟨`T-056`⟩
  - **[x] LAST PROGRESS VS PAGE PUBLISHED — SHIPPED 2026-08-31 20:04Z.** His measured finding: the dot read 🔴 54 min ago while a commit had landed 12 minutes earlier, because the old code drove the dot from `state.generatedAt` (page age) not real evidence. Two numbers now shown and computed separately: "last progress" (the newer of HEARTBEAT/LAST-ACTIVITY, read BEFORE this run's own write, so running glass.mjs is never mistaken for progress) and "page published" (`generatedAt`). **Traced and stated honestly, not oversold**: since the page is static once published, neither number can retroactively reflect work that happens AFTER the last generation — the exact reported false alarm is closed only by the third part, republishing being made mechanical. Red-proofed: ran genuinely red before the first publish+mark, genuinely green after.
    - **⚠ CORRECTION, CEO Review 52, SAME DAY, IN THE OPEN.** The line above originally said the publish-lag check lived in `scripts/qa/glass_publish_lag_check.mjs`, wired into `npm test`. CEO Review 52 found that real and correct — AND a genuine defect: it made the game's own release gate (`npm test`, required green before staging/merge per CLAUDE.md §6) dependent on whether the wyclau DASHBOARD had been republished recently. A stale Glass could have blocked a real game fix from reaching players. **Moved the same day**: the check now lives as a brake inside `.claude/hooks/wyclau-stop-keep-working.cjs` (fires on session Stop, never on `npm test`); the standalone gate script was deleted; `gates.total`/`ceiling` correctly dropped 72→71 with the removal, then rose 71→72 again for the Stop-hook's own gate (`scripts/qa/wyclau_stop_hook_check.mjs`, 14 cases, red-proofed both by planting a broken hook and by fabricating an unregistered `settings.json`). Also corrected the same review caught: `glass.mjs`'s own comment had overclaimed that an "administrative re-run… now correctly shows an older last progress" as settled behaviour — measured instead, `.claude/hooks/wyclau-pulse.cjs` stamps LAST-ACTIVITY on every tool call rate-limited to one minute, so during active work the two numbers are typically within about a minute of each other; the comment now says so.
  1. Save space -- remove "Pastry Pirates -- the engine's one honest window. Branch claude/cloud-handoff-planning-a9ay1u."
  2. "I want to see that the work is being done, right at the top, at a glance. A small emoji + a timestamp since last progress is perfect -- remove the entire 'Alive' box."
  3. Rename "Write to Claude" to **Ideas** and put it below Your Call.
  4. Reformat Shipped Today: **remove the commit codes -- they mean nothing to me** -- make them more visual and clearer to read, ideally 5-7 words each. His two examples of what is inscrutable: "`f3d3ee9b` ledger: the harvest hazard fired for real (safely) -- evidence, not prediction" and "`3934d9d4` ledger: retract the Glass v2 claim -- the Mac boardroom session claimed first, and holds it". Put below Your Call. *(Note for whoever builds it: a generator cannot summarise a bad subject line into a good one. The durable half is a commit convention -- sessions write a subject he can read -- with the generator stripping prefixes, hashes and everything after the dash. Say which half you did.)*
  5. Put **Your Call in its own box** (above Shipped Today), and **show him a few test calls** so he can check the format is intuitive.
  6. **Merge "On the Chart" with "The Reboot Checklist" -- one source of tasks**, reprioritised as needed, which the Blade Pirates process is always working. *(This item lives in the merged list once it exists.)*
  7. Reformat everything to look **more like a dashboard**, easily scannable, and **matching the colours of the game**.

## T-057 — 2026-08-31 — ONE PUBLISHER for the Glass — SHIPPED 2026-08-31. .planning/wyclau/GLASS-NOTE.md, tracked: another session writes there and commits instead of publishing; the Bosun folds it into the page and resets the file on its next pulse. Gate glass_note_relay_check.mjs, red-proofed (the pre-fix code cannot even run the check — the mechanism did not exist to test). Screenshotted before shipping.

- [x] **ONE PUBLISHER for the Glass** — SHIPPED 2026-08-31. `.planning/wyclau/GLASS-NOTE.md`, tracked: another session writes there and commits instead of publishing; the Bosun folds it into the page and resets the file on its next pulse. Gate `glass_note_relay_check.mjs`, red-proofed (the pre-fix code cannot even run the check — the mechanism did not exist to test). Screenshotted before shipping.
      ⟨`T-057`⟩

## T-058 — 2026-08-31 — Fold the Helm into the Glass — decision cards live INSIDE the Glass, derived from this file's own tables; the Helm URL serves a retirement notice (2026-08-31, his instruction)

- [x] **Fold the Helm into the Glass** — decision cards live INSIDE the Glass, derived from this file's own tables; the Helm URL serves a retirement notice (2026-08-31, his instruction)
      ⟨`T-058`⟩

## SETTLED RULINGS — swept off the Chart 2026-09-02, kept on the record forever


**Harvested 2026-08-31 from the Helm's state block, over an hour after he made them.** Full
record with the failure it exposes: [`.claude/memory/DECISIONS.md`](../.claude/memory/DECISIONS.md).
**The Glass does not render this section** — that is the point of it. A ruling here has a fate;
the three still carrying work also have a checklist row above, which is where he sees them.

| item | HIS RULING | now |
|---|---|---|
| May an unattended watch READ the claude-kit folder? The kit was described as "physically unreachable"; the fence is `bell.ps1:98-100`, which launches an unattended watch with no added directories, so it cannot see outside this repo. | **"yes"** — ruled on the Glass 2026-09-02T12:39:56.363Z, no note attached | **APPLIED 13:5xZ, commit `9c4edb48`** — `bell.ps1` passes `--add-dir <kit>`, derived from `$Repo` and only when the directory exists; gated both ways in `bell_check.mjs`. ⚠ **Your answer sat here unharvested for 31 minutes and in that time it cost the item that depended on it** (CEO 106): a watch wrote "cannot be built here" about the very half of `T-078` you had just unblocked. Still to do: the entry in `DECISIONS.md` (`T-085`, this watch was refused permission) and the detector itself (`T-084`). |
| The settings.json permission wall blocking unattended staging publish, filed to BLOCKED ON WYATT 2026-09-02T04:14Z after his YES turned out not to fully unblock it | **"this is already ruled upon -- remove it from the list, we fixed it."** — ruled on the Glass 2026-09-02T04:38:42.395Z | **CLOSED, ALREADY FIXED.** Another session's commit `ecd2067c` ("staging is LIVE on 2026.09.01.8 -- the deploy was broken, not blocked") landed between when this row was filed and when he read it — the row was stale by the time he saw it. Removed from BLOCKED ON WYATT. |
| The "Bake this!" pill covering the recipe art you're choosing | **"This is not a bug -- the pill only sits there as a confirmation. don't move it."** — ruled on the Glass 2026-09-02T03:54:24.991Z | **CLOSED, NOTHING TO BUILD.** He rejects the recommendation to move it — the covering is deliberate (confirmation affordance, built 2026-08-13), not a defect. Removed from BLOCKED ON WYATT. |
| Black-market gold coin: on iPhone/Mac Safari, does *"…for 10 🌕"* render correctly? | First answer landed as a note that read cut off mid-sentence (2026-09-02T03:50:58Z); clarified by his own follow-up 2026-09-02T03:54:47Z: **"I just tested the black market coin bug on safari, staging.6 and the coin appeared correctly. I'm not sure what caused your rig to miss it, but it's working correctly as is/"** | **CLOSED, NOTHING TO BUILD.** He tested it himself on the real device this project's rulebook says is the only real Safari — coin renders fine on staging.6. The recommendation to make the coin an image everywhere is now unsupported by evidence; not doing it on a guess. Removed from BLOCKED ON WYATT. **And measured 2026-09-02T11:xxZ (`T005-2026-09-02-THE-COIN-AND-THE-RIG.md`, CEO 101): the coin already IS an image everywhere — `emojify()` swaps the typed 🌕 for `coin-emoji.png` before render — so the question could never have had an answer, and there was never a sweep to do.** |
| The Glass's Ideas box corrupting the page after a save | **Reported four times** | **ROOT-CAUSED AND FIXED 2026-09-01.** The page's own escaper was a no-op, so every save wrote a live closing script tag into the document and broke it. Found by clicking Send in a real browser and rendering what the page saved. Gate `glass_self_publish_check.mjs`, red first. Awaiting his look on the live page. |
| Merge the 465-commit branch to `main` via the normal release loop | **"Do it" / "re merge: do it, a"** — ruled on the Glass 2026-08-31 23:39:57Z, confirmed live in chat the same message, choosing option (a) (run the trial now with active foreground monitoring) | **STAGED, AWAITING THE RELEASE TRIAL.** The `pname()` crash was root-caused and fixed 2026-09-01 (10/10 legs finished on `2026.08.31.2`); the sail-camera fix landed after that verdict, so build `2026.09.01.2` needs its own trial. Staging serves `2026.09.01.2-staging@159e26e1` and **Wyatt played it 2026-09-01: all five checklist items PASSED.** The remaining merge gate is the full trial — queued as the first Watch cargo (INBOX), run detached so it cannot die with a session — then his final say-so. |
| Live audio defect (8s full-volume storm per ship) | **"Yes — delete the line"** | **CLOSED, NOT BUILT — the ruling was on a stale premise.** Measured 2026-08-31 18:12Z: `soundForEvent({t:"anchorHold"})` returns `{name:"fishing",bus:"master"}`, `EVENT_SOUND` declares `anchorHold` exactly once (`src/ui/audio.js:105`), and `node scripts/audio_mapping_test.js` PASSes all three of DEFECT-1/2's own regression guards. The fix shipped at the cutover, commit `fb74eedc`, before today — `docs/AUDIO.md`'s own correction box says so and names this exact trap. There is no line to delete. Same shape as the sea-trial-PR correction the same day: a question was put to him from a stale reading. |
| Pass-and-play hand-over ahead of the turn | **"Just move it"** — no A/B switch, make the change | **ALREADY SHIPPED before the ruling was harvested.** Commit `ae75fe63` ("the device changes hands before the screen changes captain"), 2026-08-31 12:51Z — over four hours before his 17:08Z ruling reached anyone. `humanTurn()`'s own comment quotes him: *"Move it, I trust the plan."* All three pass-and-play hand-over sites (turn, secret draft, bake) gate before the screen switches captain; `node scripts/qa/handover_before_turn_check.mjs` PASSes, including its red-proof of the backwards order. Nothing to build. |
| One-director step 5 (Decider scope) | **"Narrow half"** — three drawing branches behind the Decider; the two questions stay two | **ALREADY SHIPPED before the ruling was harvested.** Commit `44dc853e` ("step 5, the narrow half: the secrecy rules move to one pure place"), 2026-08-31 12:54Z — over four hours before the 17:09Z ruling. `mayRevealRecipe`/`offersRecipeCheck`/`showsThinkingIndicator` in `src/shared/visibility.js` are the one pure rule; `board.js`/`stage.js` supply facts (`sharedDevice: appState.passAndPlay`) rather than branching. `decisionIsLocal` still the sole other predicate, unmerged, per the ruling. Both `scripts/qa/decider_table_check.mjs` and `scripts/qa/visibility_rules_shared_check.mjs` PASS, red-proofed. Nothing to build. |
| The plan document vs the measured tree | **"Yes — make the measured table the plan of record"** | **DONE 2026-08-31 18:35Z.** The only one of the four genuinely unbuilt when picked up. Republished [One Engine, One Director](https://claude.ai/code/artifact/715b29fe-fe33-4038-9e61-a20ef6676570) §07: each of the six migration steps now carries its real status inline (four SHIPPED, one dead-premise-closed, one largely-enforced) instead of reading as a plain to-build list; the footer's "nothing has been built" claim corrected to match. Nothing else on the page touched. |
| The cutover moment | **"After the exit test verdict"** — the 24-hour no-silent-stall run finishes first | **SCHEDULED** — gated on the exit test verdict. |
| The Razer hour | done 2026-08-31, 16:19Z | **CLOSED 2026-08-31 16:19Z.** Watchdog registered, engine launched, stall test passed through the scheduled task. |
| ⟨`T-105`⟩ May a watch make the two `.claude/` edits, or should he? | **"Let the watch write them -- I allow edits to hooks and skills"** — ruled on the Glass 2026-09-02 5:43:55 PM ET | **SETTLED, nothing to build.** Recorded in `DECISIONS.md`. ⚠ The question's premise was measured FALSE the same minute: `.claude/settings.json` allows bare `Edit`/`Write` and denies only `Read(.env*)` — **nothing under `.claude/` is blocked by this project.** His permission stands; no allowlist change was needed or made. *(Moved off the card 2026-09-02 6:38 PM ET — it had been left in `## RULED` with its verdict already written, which is the one state `rulings_triage_check.mjs` fails on, so `npm test` was red for two watches.)* |
| ⟨`T-105`⟩ Run the one-minute stale-publish test on his live page? | **"Done -- I wrote about adding google analytics and firebase"** — ruled on the Glass 2026-09-02 5:45:23 PM ET | **SETTLED, and his half is done.** His idea is harvested (`INBOX-20260902T214507Z`). The publishing half **cannot be run** — the auto-mode classifier refused it twice. The answer was already measured on a disposable artifact at 4:58 PM: **REFUSED** (`INBOX-20260902T2100Z`). *(Moved off the card 2026-09-02 6:38 PM ET, same repair as the row above. ⚠ **The removal half of this repair — deleting both rows from `CHART.md`'s `## RULED` — went out inside another live session's commit `19c0c785`, not the repairing watch's**, because that session ran `git add -A` on a shared tree. Ninth sighting of `T-093`. The two halves are therefore in two different commits by two different sessions, which is exactly the split that makes a record hard to undo.)* |
| **That black window you asked about is fixed — but the check that keeps it fixed flashes one for about a second every time we run the checks. Is that price OK?** The window was the sea trial's own helper process, and it is gone. To make sure it stays gone, the new safety check deliberately opens one itself for about a second and confirms it can see it — because a check that can't tell a window from no window would go green forever on a broken build, which is how 183 hidden browsers piled up on your laptop this morning. The cost: `npm test` runs often, and inside every sea trial, so you will see a brief black flash more often than before. Measured: the whole check takes 1.0–1.1 seconds. *(The recommendation that stood with it: **keep it** — a one-second flash you understand is a better trade than a check that can quietly go blind, and the flash is now the ONLY window the trial makes, where before it made a window that sat there for 85 minutes. Alternatives offered: (b) run the flashing half only in the sea trial, not in every `npm test` — quieter, but then a laptop that never sails never checks; (c) drop the self-test, which makes the check unfalsifiable and is the option this project has been burned by three times.)* | **"keep it"** — ruled on the Glass 2026-09-02T17:06Z; his exact words to the Advisor at 17:38Z were *"I apprroved 'keep it'"* | **CLOSED, NOTHING TO BUILD — the flashing self-test stays in `npm test`** (`scripts/qa/detached_trial_windowless_check.mjs`). Removed from BLOCKED ON WYATT 2026-09-02T18:xxZ. ⚠ **AND THIS IS THE FOURTH INSTANCE IN ONE DAY OF A QUESTION HE HAS ANSWERED STILL BEING ASKED, WHICH IS THE PART WORTH KEEPING.** He ruled at 17:06Z, it was harvested to the record at 17:21Z (`778c6f92`), and **nothing retired the question**, so his page went on asking him something he had already answered for another half hour — and he was angry, correctly. Harvesting a ruling and RETIRING the question are two moves, and only the first has ever been automatic. |

## T-001 — 2026-09-02 — THE CHARTKEEPER — BUILT AND RUNNING. What is left is SWEEP alone. Full spec: (closed 2026-09-02 · CEO 107 · no game diff — no game diff — the ask is his Chart's own upkeep, not the game; src/ and index.html untouched, stamp unchanged)

- [x] **THE CHARTKEEPER — BUILT AND RUNNING. What is left is SWEEP alone. Full spec: (closed 2026-09-02 · CEO 107 · no game diff — no game diff — the ask is his Chart's own upkeep, not the game; src/ and index.html untouched, stamp unchanged)
      ⟨`T-001`⟩
      ✅ **SHIPPED 2026-09-02:** REAP runs every Glass tick (report-only, and it flags stale rows on
      his page). RANK runs in **every watch**, wired into the Door at step 6a with a gate that fails
      if the line is ever removed. And the two derivations were CONVERGED — before that, RANK was
      ordering a list missing eleven rows, ten of them his own words.
      ⏳ **STILL OPEN: SWEEP, and only SWEEP.** The version that exists is the seven-day-with-a-stub
      form he **OVERRULED** (his ruling: every completed row leaves immediately, no stub). It cannot
      ship until the Glass's done count is re-sourced from `CHART-LOG.md` — sweeping today would
      take his page to "0 done". **That single dependency is the whole of what remains here.**
      [`.planning/SPEC-CHARTKEEPER.md`](SPEC-CHARTKEEPER.md).** His words, 2026-09-02
      (INBOX-20260902T04xxZ): *"design -- BUT DONT BUILD -- a system that will dynamically
      reprioritize it, update it, and move things around it that is built into this process
      somehow -- either with the Glass Update Session, or in the watch … then give the full spec to
      the Watch to build it, **highest priority after what it is currently working on**."*
      **He has now asked for this four times and the first three are still sitting in the IDEA
      INBOX marked "SCHEDULED"** (00:59:32Z, 03:45:45Z/03:46:13Z, 03:49:02Z) — the fix for the
      Chart's inability to reprioritise was itself filed on the Chart and never rose. That is the
      acceptance test.
      **Shape:** `scripts/wyclau/chartkeeper.mjs`, three passes — REAP (flags stale rows from
      derived facts, **never ticks a box**), RANK (orders by approved-and-unblocked, blocked,
      player-facing, evidence-retired, how often HE has raised it, size), SWEEP (done rows older
      than 7 days move to `.planning/CHART-LOG.md`). RANK+SWEEP run in the **Watch** and act;
      REAP runs in the **Glass-update session** in report mode only. Sizing: **MEDIUM** for the
      Chartkeeper, **smaller and separate** for the Glass-side rendering (expandable rows,
      per-item comment, rename the card to "The Chart (Tasks To Do)", move The Lesson below it).
      **Recommendation: ship the Glass-side half first or alongside** — a perfectly ranked list
      still reads as gibberish if every row is 90 truncated characters of a 200-line essay.
      The spec also names **five open rows measured dead** (701, 380, 420, 674, 647) with the
      evidence for each; close them through the gate, each with its own CEO verdict.

      ### ⚑ HALF-BUILT 2026-09-02T04:19Z. CEO 91 said **NO** and it was right. What is done, what is left.
      **The tool exists, is green, and its ranking is live on his page** —
      `scripts/wyclau/chartkeeper.mjs` + `lib/chart_model.mjs`, gates `chartkeeper_check.mjs` (24
      behavioural cases) and `chart_model_agrees_with_glass_check.mjs` (runs the REAL `glass.mjs`
      against a fixture and compares counts; CEO 91: *"the best thing in this pass"*). The Chart is
      re-ordered, every row has a `T-nnn` handle on its own line, and **nothing was lost** —
      CEO 91 measured +5 net lines, open 31→31, done 27→27, sections 8→8.
      ### ⚑ BANNER ITEM 1 — SETTLE — IS BUILT, 2026-09-02T05:3xZ. Items 2 and 3 are still open, and item 2 is BLOCKED.
      **`--settle` is pass 2 of four and it is live**, in `chartkeeper.mjs`, behind 17 new
      behavioural cases in `chartkeeper_check.mjs` (RED 11 first, then green; `npm test` 94/94).
      It derives a row's CLAIMS from the row's own text, runs REAP's existing probes against each
      one, and forces the row to his three fates in his order — **VALIDATE** (every part derives
      finished → propose a close through `close_item.mjs`; it never ticks), **SPLIT** (some parts
      finished → each unfinished part becomes a row of its own, purely additive, the parent's essay
      kept verbatim), **ASK** (nothing to carry onto the parts → one question into BLOCKED ON WYATT
      **with the measurement attached**). Enforced, not suggested: `settleUnresolved` names any row
      that survives a write pass still half-done, and case 10e fails if one does.
      **THE MISREPORT IT FIXES — and CEO 93 found the first fix was only HALF of it, which is the
      most useful thing to come out of this pass.** RANK used to say *"looks finished — needs a
      verdict, not work"* about any row REAP had flagged. SETTLE's verdict now speaks over REAP's
      on any row it has judged — but the fault was never really about bundles. **REAP measures a
      POINTER**, and a row can have every pointer in it resolve and still be entirely unstarted;
      this very row was being labelled "looks finished" while its own text said half of it was
      blocked and unbuilt. The phrase is now *"something it was waiting on has landed"*, which is
      true, and the +40 that lifts such rows is unchanged and correct. Gate case 10i, red-proofed
      both ways.
      ⚠ **AND ONE CORRECTION THIS ROW OWES, kept rather than edited away:** the first version of
      this entry said the old phrase "was on his page". It was not. `whyNow` prints to the console
      only — never into `CHART.md`, never onto the Glass. What reaches his page is the score's
      effect on ORDER. Every session that runs the tool read the wrong sentence; he did not.
      **WHAT IT SAYS ABOUT TODAY'S CHART, honestly: 5 bundled rows examined, 0 half-done.** The
      Blade hour (`T-021`) IS bundled and IS one-third finished, but the evidence for that third is
      PROSE in its body, not a pointer any probe can ask the world about — and prose-grepping is the
      fault this project keeps paying for. SETTLE will act the first time a finished part carries a
      real pointer. **The tool now prints how many rows it EXAMINED, not just what it found**,
      because a pass that is silent on a healthy Chart and a pass that has gone blind print the same
      line — a gap that nearly shipped behind 16 green cases (`.planning/wyclau/PREDICTION-20260902T0515Z-settle.md`).
      **⚠ IT WAS BUILT TO THE SUPERSEDED SPEC.** The 🛑 banner at the top of
      `SPEC-CHARTKEEPER.md` landed six and a half minutes before the build committed and was never
      re-read. **Read the banner FIRST.** What it requires and nobody has built:
        1. ~~**SETTLE — a NEW pass, his, pass 2 of four.**~~ **DONE 2026-09-02T05:3xZ — see above.**
        2. **SWEEP takes EVERY completed row, immediately, and leaves NO stub.** ⚠ **BLOCKED, AND
           THE BLOCKER IS MEASURED, NOT GUESSED — it is the same shape as the staging permission.**
           The banner says three repairs must land in the same change, and the first is
           `glass.mjs:392`, which derives his "done" count by counting `- [x]` rows in `CHART.md`.
           Sweep them all without that repair and his Tasks card reads **"0 done"**.
           **`glass.mjs` is VENDORED** — line 1 of `.claude/wyclau/MANIFEST.sha256` — and the
           claude-kit checkout is outside an unattended watch's permitted directories: a read of
           `C:\Users\wyatt\Projects\claude-kit` is **refused**, not empty. So this needs a session
           with the kit open, or Wyatt. Filed in `PENDING-KIT-PATCHES.md` as item 6. The code is
           still the overruled seven-day-with-a-stub version — **find it by NAME, not by number:
           `SEVEN_DAYS`, `sweepable`, and the `type: "prose"` stub inside the `DO.sweep` block of
           the write.** *(This citation read `chartkeeper.mjs:250,258,348-351` for one commit and
           CEO 93 caught it: the SETTLE commit added 435 lines and those numbers then landed inside
           an unrelated comment block. The spec's own banner warns about exactly this, and a row
           about stale pointers had gone stale in the commit that wrote it — twice now, in the same
           document family. **Cite a symbol, never a line.**)* **Three gate cases now DEFEND the
           overruled design** — they must go red before they go green.
        3. **The three repairs the banner says must land in the same change:** the Glass's `done`
           count becomes "done today" from `CHART-LOG.md`; `rulings_triage_check.mjs` reads the log
           not the Chart; the `SETTLED RULINGS` table is swept too.
      ### ⚑ NEXT, AND CEO 95 SAYS IT OUTRANKS ANY MORE INTERNAL WORK: NOBODY RUNS THIS TOOL.
      CEO 95, 2026-09-02, in its own words: *"A ranking tool nobody runs does not clean your list."*
      It looked for an invocation and found none — not in `.claude/`, not in `package.json`; only a
      mention in `GLASS-UPDATE-SESSION.md`. **That is not new information** — this row already says
      *"the Chart re-prioritises only when somebody types the command"*, and the wiring is filed as
      `PENDING-KIT-PATCHES.md` items 4 and 5, blocked on a vendored `glass.mjs`/Door outside an
      unattended watch's reach. **But it is the right ranking of what is left**: Wyatt's complaint
      was finished tasks sitting on his list, and the pass that moves them runs only when a human
      types it. Whoever can reach claude-kit should take patch 4 before any more keying work.
      ### ⚑ THE DUPLICATE-KEY COLLISION — DONE 2026-09-02T06:49Z, CEO 95 PARTIAL, and the PARTIAL was earned.
      **Three lookups keyed on things that can repeat, all fixed.** `new Map(pairs)` keeps the last
      value for a repeated key in silence: his Inbox had two notes under one stamp
      (`INBOX-20260902T05xxZ`, since repaired to give the second its own `-a`), and `reapById` /
      `settleByTitle` / `applySettle`'s split match / SWEEP all keyed on a row's TITLE, which nothing
      forbids two rows from sharing. Rows now carry `row.key`, unique by construction
      (`chart_model.mjs`'s `rowKey`), and the write pass tracks which row landed in which slot
      instead of re-deriving identity from the text afterwards. Ten new gate cases (block 12),
      five red first; `npm test` 94.
      **SIZED HONESTLY, AND THE MEASUREMENT CAME BEFORE THE FIX: nothing on his page was wrong.**
      Both colliding entries were open and no row cited that stamp. The defect was that the answer
      was UNGROUNDED — it turned on file order — not that it was wrong. The real Chart's ranking is
      byte-identical before and after.
      ⚠ **AND CEO 95 CAUGHT THE SAME FAULT CEO 94 CAUGHT, ONE COMMIT LATER, IN THE SAME FILE.** The
      first version of the new banner told him a row citing an ambiguous stamp *"cannot be read as
      approval"* — **false in exactly the case that had actually happened in his Inbox**, where both
      notes were open and the citation therefore WAS credited. A behavioural claim written into the
      one place he reads. The code was the half that was right; the words are now the code's, and
      gate case 12a-ii holds them there. Two more comment claims of the same shape were corrected in
      the same pass. Full verdict and response: `.planning/CEO-REVIEWS.md`, CEO 95.
      ### ⚑ THE TWO UNSOUND RANKING SIGNALS — WORKED 2026-09-02T06:0xZ. One is DONE, one is HALF DONE, and CEO 94 says exactly where the line is.
      **SIGNAL B — the false "you have raised it N times" — is DONE (CEO 94's own scoring).** It
      was a five-letter token overlap over 900 characters of essay, and on the real Chart it told
      him he had raised the `can_push` row — a tool fault a session found, which he has never
      mentioned — **ten times**. It now counts DISTINCT RESOLVED CITATIONS: entries of his Inbox
      the row names, plus entries naming the row's `T-nnn` handle. `can_push` now reads *"no signal
      either way"*.
      ⚠ **AND THE OBVIOUS DIAGNOSIS WAS WRONG, which is the reusable half:** it was not tracking row
      LENGTH — the 900-character cap flattens that out (a 4,695-char row scored 1, a 487-char row
      scored 5). It tracked **shared process vocabulary**: rows about the watch/trial machinery
      matched the many Inbox entries about the watch/trial machinery. It measured *"is this row
      about the same subsystem as most of his recent notes"* and reported it as *"you raised this N
      times."*
      **SIGNAL A — approved-and-unblocked (+100) — IS HALF DONE, AND CEO 94 BROKE IT IN A MINUTE.**
      The prose regex is gone; approval now needs a resolved `INBOX-<stamp>` that is still live, or
      a `Your ruling:` tag that resolves against the Chart's own rulings tables. Two of CEO 94's
      findings were faults introduced in the same watch and are fixed in it (`9dbac237`): the tag
      used to be credited on a Chart with **empty** rulings tables, because the file claimed in two
      places that `rulings_triage_check.mjs` enforces it and **that gate only walks rulings → rows**
      (`rulings_triage_check.mjs:92-98`); and a comment said "eight rows" where the tool's own
      report says four. Gate cases 11a, 11a-ii, 11b, 11c, 11d, 11e — twelve assertions, RED first
      (six failures), `npm test` 94 green.
      **WHAT IS STILL OPEN, AND IT IS THE NEXT STEP HERE, WITH CEO 94'S OWN REPRODUCTION:**
        • **A row citing a REAL BUT UNRELATED live Inbox entry is still credited.** CEO 94 wrote a
          fictional *"repaint the bilge pump widget, nobody has ever mentioned this"* row, pasted
          this row's own live Inbox stamp into it, and **it scored 108 and ranked #1** against a real
          player-facing bug. Nothing checks the entry is ABOUT the row. Its proposed fix — require
          the cited entry to name the row's `T-nnn` handle — **would today zero every row on the
          list**, because `grep -o "T-0[0-9][0-9]" .planning/wyclau/INBOX.md` returns NOTHING: there
          are no backrefs at all. So this needs the backref convention established on the Advisor's
          side first, plus a decision about what a one-sided citation is worth. **A design choice
          about his record, not a patch.**
        • **Two rows were demoted that should not have been, and the repair is one line each.**
          The tool NAMES them in its report. *"Convert the recipe art to WebP"* — his ruling was
          *"do it"* and his 2026-09-02T00:48Z Inbox entry is live and right there; it fell from
          +100 to 30 for want of a citation that is not a matter of judgement. And the row that is
          literally his quoted words (*"Make Glass…"*, 2026-09-01 02:13:52Z) now scores **0** at
          rank 27. Writing those citations in is the Advisor's job under his 2026-09-02T04:00Z
          record-only ruling.
        • **`INBOX.md:390` and `:409` are two different entries sharing one id** (the
          `2026-09-02T05:xx` stamp). The tool keys them in a Map, so one silently overwrites the
          other and the survivor's status decides both. Found by CEO 94.
      ⚠ **AND WRITING THIS ROW DEMONSTRATED THE HOLE, WHICH IS WHY THE WORDING ABOVE IS INDIRECT.**
      The first draft named those two entries by their raw `INBOX-…` ids as evidence about OTHER
      rows — and the tool immediately counted them as THIS row's citations and printed *"you asked
      for it in 3 of your notes"* at him. A pointer written for a human reader became a score. So
      the ids are spelled out in prose here instead. **That is not the fix; it is the bug wearing a
      workaround**, and it is the sharpest argument for the two-sided citation above.
      **REAP CATCHES 4 OF THE AUDIT'S 5.** The 24-hour-run row is missed: *"the 24h exit test"*
      tokenises to an empty set through the five-letter filter (`chart_model.mjs:196`). Two probes,
      `supersededByAnotherRow` and `pidLongDead`, have no gate case at all.
      **STILL NOT BUILT AND NOT FILED ANYWHERE ELSE:** his 03:49Z asks for **expandable rows** and
      **a comment box under each item**. Both need `glass.mjs`, which is vendored.
      **THE WATCH-SIDE WIRING IS FILED, NOT RUNNING** — `PENDING-KIT-PATCHES.md` 4 and 5. Until a
      session with claude-kit applies patch 4, **the Chart re-prioritises only when somebody types
      the command.** REAP is wired and live in `GLASS-UPDATE-SESSION.md` step 4b.
      **ONE REGRESSION THIS WATCH CAUSED AND FIXED:** the handle was first written inline, so every
      task on his page read `` `T-001` ★ NEXT ITEM… `` with literal backticks (`glass.mjs:122`
      strips `**` and `~~`, not backticks). Handles now live on their own line; gate case 7b asserts
      every row's first line survives the write byte for byte; the rendered page was opened and
      checked afterwards. **Twenty-two green cases and none of them had looked at the picture.**

## T-087 — 2026-09-02 — THE IMAGE-WEIGHT ASK IS CLOSED — HIS RULING 2026-09-02: call it finished. 17.79 MB -> 3.89 MB, a 78% reduction; preload 144/144 gated; the last 0.09 MB (2.3%) deliberately left. A MEASURED NUMBER, NOT A

- [x] **THE IMAGE-WEIGHT ASK IS CLOSED — HIS RULING 2026-09-02: call it finished.** 17.79 MB -> 3.89 MB, a 78% reduction; preload 144/144 gated; the last 0.09 MB (2.3%) deliberately left. A MEASURED NUMBER, NOT A
      ⟨`T-087`⟩
      GUESS. His question is in BLOCKED ON WYATT.** *"everything else should be resized… according
      to its maximum pixel size in the real gameplay"*, `INBOX-20260901T1335Z`. Re-measured
      2026-09-02T15:5xZ, commit `00e85bf2`, **CEO 109 (PARTIAL)**.
      **COMPRESS is done and large** — `assets/` is **3,873,895 bytes (3.89 MB)** against the
      17.79 MB he raised it at. **PRELOAD is done** — 144 of 144 pictures warmed at boot, gated.
      **RESIZE has happened to exactly ONE file**: `assets/about-recipes.jpg`, −137 KB, `a086edcf`.
      **WHAT IS ACTUALLY LEFT: 12 files, 0.10 MB on disk, ~0.09 MB recoverable — 2.3% of the
      library — and every one of the twelve is a 4–12 KB icon.**
      [`.planning/ASSET-DISPLAY-SIZES.md`](ASSET-DISPLAY-SIZES.md) is regenerated and trustworthy
      for the first time since the WebP renames.
      ⚠ **AND THE LIST IT REPLACED WAS A TRAP, WHICH IS WHY NOBODY SHOULD HAVE WORKED IT.** The old
      *"25 candidates / ~0.34 MB"* was led by `icons/flip-heads.png` at **x7.07** — **the
      flippenator coin.** Its only sighting was an 18px inline icon in the About page's prose; its
      real slot is 119–211 CSS px in the flip ceremony, a screen the probe never reaches, which is
      also why its siblings `flip-tails` and `flip-socket` come back NOT SEEN. **Cutting it to 54px
      would have destroyed the coin.** Same for `crown` (x5.93) and `cupcake` (x5.88) — all three
      peaking at the same 18×18 slot. The probe now separates gameplay peaks from off-game ones and
      the exclusion is derived from the surface names it already records, not a list of filenames.
      Verified independently by CEO 109 down to `src/ui/board.js:2368` and `index.html:2127-2130`.
      **THE ONE THING THAT WOULD STILL CHANGE THIS NUMBER, and it is now `T-088`:** about **1.25 MB
      — a third of the library — has no measured gameplay maximum at all.**
      **Do not resize anything here without a posed pair.** Resizing down softens art on a retina
      phone (measured, `INBOX-20260902T0048Z`), and this probe's zoom ceiling has been wrong twice
      in opposite directions.

## BOOKKEEPING — questions that have left `BLOCKED ON WYATT`

*Moved out of `CHART.md` on 2026-09-02 by the watch that fixed the Glass. **Nothing here was
deleted and nothing here is waiting on him** — every question below is already ruled, and each note
says where it went. They lived in the `## BLOCKED ON WYATT` section as prose, and prose in that
section is exactly what put a red "this page could not read part of BLOCKED ON WYATT" warning on his
Glass, above his real decisions. His words: "what is causing this? debug and fix." This was the
cause. A gate now keeps that section to table rows, blanks and HTML comments —
`scripts/qa/glass_calm_check.mjs`, case 10.*

*The four blocks below are **verbatim**, changed only where a note said "below" or "here" about a
section that is now in a different file. **The settled black-window row is NOT one of the four** —
it was a live table row, and it is at the foot of SETTLED RULINGS above, question text intact with
its recommendation folded into the same cell so the table keeps three columns.*

*(This section carries no `T-nnn` handle on purpose: it is not a swept row, so
`chart_sweep_conserves_check.mjs` neither owns it nor is confused by it, and
`chartkeeper.mjs --sweep` preserves everything from the first `## ` heading onward. **And no row
here names a live handle in its text**: `hisAnswerLanded` (`chartkeeper.mjs:303`) reads a settled
row for the handles it mentions and stamps "your answer landed" on every open row it finds — so a
handle written as decoration in a closed row tells his Chart he ruled on work he has never seen.
It did exactly that, on two rows, and CEO 114 caught it.)*

*(the settings.json permission wall was RULED 2026-09-02T04:38:42Z: "this
is already ruled upon -- remove it from the list, we fixed it." Moved to SETTLED. The row
about `SCHEDULED` hiding your ideas was RULED YES 2026-09-02T12:28:02.757Z, moved to RULED,
awaiting triage. The row about an unattended watch reading the claude-kit folder was RULED YES
2026-09-02T12:39:56.363Z, moved to RULED, awaiting triage.)*

*The "May an unattended watch READ the claude-kit folder?" question was RULED YES ON THE GLASS
2026-09-02T12:39:56.363Z, no note attached. Harvested to RULED, awaiting triage: someone
needs to actually widen `.claude/settings.json` so a Bell-started watch can read outside this
repo, per the recommendation that was standing there, and confirm it really does unblock the five
dammed-up claude-kit patches. Not done there — that session's mandate was harvest-and-publish only,
never settings changes.*

*The "Do you want `SCHEDULED` to stop hiding your ideas?" question was RULED YES ON THE GLASS
2026-09-02T12:28:02.757Z, no note attached. Harvested to RULED, awaiting triage: fixing it
touches `glass.mjs` (vendored from claude-kit at the time) and every row already tagged SCHEDULED in
THE IDEA INBOX — this is the same defect `T-076` already named. Not done there — that session's
mandate was harvest-and-publish only, never settings or code changes.*

*The staging-publish-permission question — **"May a watch publish to staging on its own?"** — was
RULED YES ON THE GLASS 2026-09-02T04:03:36Z, no note attached. Harvested to RULED, awaiting
triage: someone needs to actually add the line to `.claude/settings.json`
(`"Bash(bash scripts/deploy-staging.sh*)"`, the recommendation that was standing there) and confirm
it lets an unattended watch publish to staging without the production path being reachable. Not
done there — that session's mandate was harvest-and-publish only, never settings changes. The "Bake
this!" pill question was RULED ON THE GLASS 2026-09-02T03:54:24Z —
**"This is not a bug -- the pill only sits there as a confirmation. don't move it."** — SETTLED,
nothing to build. The black-market gold-coin question was answered 2026-09-02T03:50:58Z as
a cut-off note, then CLARIFIED by his own follow-up idea 2026-09-02T03:54:47Z — he tested it
himself on Safari/staging.6 and the coin renders correctly; SETTLED, nothing to build.
Otherwise: the recipe-picture WebP question was RULED ON THE GLASS 2026-09-02
00:58:35Z — **"Do it; but I am surprised that they are already 'too small' — what is the maximum
size they are displayed at?"** — harvested to RULED, awaiting triage (his format-change
approval, plus his own follow-up question about the display-size measurement, both unanswered
yet by the watch that picks this up). The trade-fan question was RULED ON THE GLASS 2026-09-01
14:16Z — "Don't touch the trade fan, it's fine" — now DECISIONS.md relay-addendum ruling 5; the
first real tap-to-rule harvest, answered and filed within the hour. Two questions resolved 2026-09-01: **rsync** — he
installed it on the Razer (his pick, option (a)); deploys are mechanically unblocked from both
machines. **The sail-square scope question** — he ruled the same morning: fix it NOW, with his
stated camera-zoom solution; shipped, staged, and his own playtest passed all five checks the
same day (staging checklist 2026-09-01, items 1–5 PASSED — item 5 was the framing taste call,
so the wider camera is settled, not pending). The removed rows are in git history at `CHART.md`,
2026-09-01.*

## T-095 — 2026-09-02 — ★★★ "THE GLASS LOOKS CHAOTIC AGAIN" — his three newest faults. CEO 112 approved item 2 and (closed 2026-09-02 · CEO 114 · no game diff — no game code is right: all three faults are in his Glass page (glass.mjs) and the Chart it reads -- commit 0b63026c, src/ and index.html untouched, build stamp unchanged)

- [x] **★★★ "THE GLASS LOOKS CHAOTIC AGAIN" — his three newest faults. CEO 112 approved item 2 and (closed 2026-09-02 · CEO 114 · no game diff — no game code is right: all three faults are in his Glass page (glass.mjs) and the Chart it reads -- commit 0b63026c, src/ and index.html untouched, build stamp unchanged)
      ⟨`T-095`⟩
      REJECTED items 1 and 3 as first written; the spec is rewritten and every finding re-measured.
      Spec: [`SPEC-GLASS-CALM.md`](SPEC-GLASS-CALM.md). Sizing: SMALL, three parts.** ⟨`T-095`⟩
      **HIS WORDS:** *"the glass looks chaotic again. 1. In Hand needs to give me context on what is
      being worked on -- i don't know or care about the 'T-088 · claimed 2026-09-02T16:49Z' -- i want
      to know the content of it. 2. 'page published 3 min ago — it cannot see anything newer than
      that' should be up next to '🟢 last progress 6 min ago' as one status bar with fewer words:
      '🟢 Progress: 6 min ago. 🟢 Updated: 4 min ago.' 3. '…and there is more in that section this
      page could not read…' --> what is causing this? debug and fix."*
      **1 · SPLIT THE FIELD — DO NOT LOOK THE TITLE UP IN THE CHART.** `claim_item.mjs` takes
      `--handle=T-088` and `--item="fix the Glass: his five asks"` separately; the page prints the
      words and keeps the handle in `data-handle`. **`publish_status.mjs:65-68` copies the marker's
      JSON verbatim, so a new field arrives with that file unchanged.** Old markers carry only
      `item` — fall back to stripping a leading `T-nnn — `, then to printing it whole; **never
      render blank.**
      ⚠ **WHY NOT THE LOOKUP: `⟨T-088⟩` IS ON TWO ROWS** — `CHART.md:60` (this Glass work) and
      `:196` (the art-library measurement). A lookup picks one, and his page confidently reports the
      wrong work. **And it was never needed: the words are already in `.planning/wyclau/IN-HAND`.**
      **THE TIME GOES INTO `tick()`, NOT INTO THE HTML.** `inHandHtml` is built in Node
      (`glass.mjs:570-577`), so a relative age computed there really would freeze. `tick()` runs
      every 30s in his browser (`:999`) and already renders two live clocks — put `claimedAt` and
      `staleAfterMinutes` into `glassState` and let it write the line. **⚠ COLD moves with it**
      (decided in Node today, `:575`), so a page open on his phone stops claiming work is in hand
      once the claim goes stale. **AND CORRECT THE COMMENT AT `:543-544` IN THE SAME CHANGE** — it
      shouts *"THE TIME IS ABSOLUTE, NEVER 'N MINUTES AGO'"* on reasoning `:986-987` disproves, and
      it will talk the next reader out of the right fix.
      **2 · ONE STATUS BAR, HIS WORDING EXACTLY — approved as written.** `🟢 Progress: 6 min ago
      🟢 Updated: 4 min ago`. **Keep both clocks** (his own 2026-08-31 ask — they legitimately
      disagree, and the disagreement is the signal). **Delete the `BLIND` apology string** (`:967`).
      **Two dots colouring independently** — today there is one (`:842`) and the published line has
      none. **Both use the 45-minute rule the first already uses (`:996`). No new constant.**
      **3 · FENCE THE WRITER, NOT THE READER.** ⚠ **The first plan's "warn only on a `?` or a bold
      lead" WAS MEASURED AND FAILS: three of the five prose blocks quote his own questions verbatim,
      question marks and all — the red warning would still be on his page after the work was
      reported done.** Instead: **(a)** move the four historical notes to `CHART-LOG.md` and turn my
      warning paragraph into an HTML comment; **(b)** a gate fails `npm test` when `## BLOCKED ON
      WYATT` holds any line that is not a table row, a blank, or an HTML comment — the rule
      `SPEC-VISIBILITY-AND-INJECTION.md:101-103` already specified; **(c)** the reader
      (`glass.mjs:384-389`) stays broad and dumb and **must strip HTML comments before the check**.
      **DO NOT DELETE THE DETECTOR** — Your Call truthfully read `(0)` while a real question sat in
      prose, and he caught that in a screenshot.
      **THE PROOF A GATE IS WARRANTED:** five prose blocks are in that section right now
      (`CHART.md:956-1010`) on a tree where `npm test` is green. Nothing in the build can see them;
      the only thing that notices is the renderer, at read time, on his page, in red.

## T-088 — 2026-09-02 — FIX THE GLASS — his five asks from the screenshot, 2026-09-02T16:1xZ. HIS WORDS: "claude my (closed 2026-09-02 · CEO 118 · no game diff — no game code is right: his ask is the GLASS, his own status page, not the game -- fixed in scripts/wyclau/glass.mjs and lib/chart_model.mjs with two new gate cases; src/ and index.html untouched (commit 1d852187)) friend, you just HAVE to fix the glass. Don't do it yourself -- put it to the TOP of the chart." Every one is glass.mjs, which is editable in-repo. Sizing: 1, 3, 4 and 5 are each MINUTES. Only 2 needs thought.

- [x] **FIX THE GLASS — his five asks from the screenshot, 2026-09-02T16:1xZ. HIS WORDS: *"claude my (closed 2026-09-02 · CEO 118 · no game diff — no game code is right: his ask is the GLASS, his own status page, not the game -- fixed in scripts/wyclau/glass.mjs and lib/chart_model.mjs with two new gate cases; src/ and index.html untouched (commit 1d852187))
      friend, you just HAVE to fix the glass. Don't do it yourself -- put it to the TOP of the
      chart."* Every one is `glass.mjs`, which is editable in-repo. Sizing: 1, 3, 4 and 5 are each
      MINUTES. Only 2 needs thought.**
      ⟨`T-088`⟩

      **1 · WHAT IS BEING WORKED ON RIGHT NOW, under the status dot.** *"what is being worked on
      RIGHT NOW? that needs to be visible just underneath the emoji status."* Derive it from the
      newest `claims` line in `.planning/CTO-LEDGER.md` — the Door already requires a claim before a
      watch touches anything, so the fact is on disk. **Between watches there is no claim: render
      *"nothing in hand"*, NEVER the last thing finished.** A status line that keeps showing a
      completed item is the lie this page has told all day.

      **2 · "LAST PROGRESS 25 MIN AGO" WHEN WORK WAS 4 MINUTES OLD — and the number is not lying,
      the PAGE is stale.** Measured at 16:12:47Z: `HEARTBEAT` said **16:09:00Z**, four minutes
      earlier. The page had been published 13 minutes before and **a published page is a STATIC
      photograph** — its "25 min ago" was computed at publish time and has been ageing on screen
      ever since. `glass_needs_publish.mjs` then correctly declines to republish when nothing has
      *changed*, so **the staleness he sees is worst exactly when the relay is quietly working.**
      **THE FIX IS NOT MORE PUBLISHING** — he charged the timer design once already and CEO 80
      upheld him. **Make the page compute its own age in the browser** from the timestamps embedded
      in it: it already carries `generatedAt`, so a few lines of client script can render *"last
      progress N min ago"* live and, better, say *"this page is N minutes old"* when it is stale
      rather than presenting an aged number as current.

      **3 · HIDE `YOUR CALL` WHEN IT IS EMPTY.** *"if there are no calls for me to make, don't show
      the Your Call box."* One conditional. **⚠ And do NOT hide it when the count is 0 for the wrong
      reason:** the card renders only `|` table rows in `## BLOCKED ON WYATT`, so a question written
      there as PROSE renders as `(0)` while genuinely waiting — that is `T-077`, still open. **Hide
      an empty card; never hide an unparseable one. If the section has content the renderer could
      not read, the card must say so.**

      **4 · NUMBERS, NOT BULLETS.** *"the Chart is still not using numbers -- it's using bullet
      points. it needs numbers."* `<ol>` instead of `<ul>`. **This is the second time he has asked**
      (INBOX-20260902T13xxZ). RANK now orders the list, so the numbers are the whole point: without
      them the ordering he asked for four times is invisible.

      **5 · THE ALL-CAPS SHOUTING — the Glass is innocent and the CHART is the culprit.**
      `glass.mjs:288` `shortTask()` takes each row's first line, strips markdown, truncates to 16
      words — **and renders whatever the row says, verbatim.** Watches write row titles in ALL CAPS
      for emphasis inside `CHART.md`, so the page inherits the shouting. **TWO POSSIBLE FIXES AND
      THEY ARE NOT EQUIVALENT:** (a) sentence-case the title at render time — one line, immediate,
      and it cannot regress; (b) a convention that rows are written in sentence case — durable but
      it is prose, and prose rules fail here (Principle 2). **Recommend (a) now and (b) as a gate
      later.** *(Related, same screenshot: his note read* "evidence from before today's 2026." —
      **cut off mid-sentence.** *The note text is being truncated too, and that is the same class:
      the page clipping content rather than the content being wrong.)*

      **WHERE HIS EARLIER GLASS ASKS WENT, because he asked and deserves the honest list:**
      **expandable rows** and **a comment box under each item** are `T-076`, filed and open.
      **Numbers** and **what-is-being-worked-on** were filed at INBOX-20260902T13xxZ and were sitting
      NINTH in an eight-item oldest-first queue. **Hiding Your Call and the ALL-CAPS are new here.**
      **Nothing was lost — but nothing was built either, and that is the point of his message.**

      **AND HOW HE PRIORITISES THEM HIMSELF is already designed and unbuilt: `T-083`** — RANK becomes
      the single ordering authority, the Door stops draining oldest-first, and **a checkbox under the
      Ideas box marked *"Add to top of list"*** puts his hand on the queue with no session in the
      loop. **Until that ships, "put it at the top" is something only a session can do for him.**

## T-090 — 2026-09-02 — ONE LABEL IS DOING DUTY FOR THREE UNRELATED FAULTS, AND EVERY READER OF HIS PAGE HAS DRAWN (closed 2026-09-02 · CEO 119 · no game diff — no game code is right: the ask is the label on his own status page -- commits 70592475/710b7af6; PARTS 1-2 OF 4, steps 3 and 4 SPLIT to their own row) THE WRONG CONCLUSION FROM IT — INCLUDING THE ADVISOR, TO HIS FACE. His idea, 3:30 PM ET, INBOX-20260902T193000Z: "do you want to put those in the Your Call section so I can approve/deny them being closed?" His page says "N tasks on your list look already finished." Ran node scripts/wyclau/chartkeeper.mjs --reap and read all ten: not one of them is flagged "looks finished." Six say the evidence is stale because the build moved on, three say he ruled and the row never moved, one says a pid is dead. THE ANSWER TO HIS IDEA: right instinct, wrong pile. Stale-evidence rows need RE-MEASURING, not his approval — he cannot know from a phone whether a trade circle still clips a name. Already-ruled rows must never go back to him; that is T-090's exact fault, the one he was furious about at 1:38 PM today. Your Call is right for the residue only — rows whose fate is genuinely his say-so, like "merge the 465-commit branch to main — his own final say-so". That pile is one or two rows, not ten. ⚠ AND THE "HE ALREADY RULED" SIGNAL CAN FIRE ON A ROW HE NEVER RULED ON. VERIFIED: T-078 (CHART.md:1047) is "chase it only if it is seen again" about an <img> that failed to paint once in a WebKit frame — matched against his 12:39:56Z ruling on whether a watch may read the claude-kit folder. Unrelated. Under his proposal, unfixed, that row would be put to him as a question — the very failure the proposal exists to reduce. Fix the matcher before wiring anything to his page. THE BUILD, in order: (1) split the reap by KIND and name each kind in the note in his words; (2) fix the ruling-to-row matcher and red-proof it on T-078; (3) route each kind to its owner — re-measure, close, or ask him; (4) only then, his Your Call pile. Sizing: chartkeeper.mjs and glass.mjs. No game code, no sea trial.

- [x] **ONE LABEL IS DOING DUTY FOR THREE UNRELATED FAULTS, AND EVERY READER OF HIS PAGE HAS DRAWN (closed 2026-09-02 · CEO 119 · no game diff — no game code is right: the ask is the label on his own status page -- commits 70592475/710b7af6; PARTS 1-2 OF 4, steps 3 and 4 SPLIT to their own row)
      ⟨`T-090`⟩
      THE WRONG CONCLUSION FROM IT — INCLUDING THE ADVISOR, TO HIS FACE.** His idea, 3:30 PM ET,
      `INBOX-20260902T193000Z`: *"do you want to put those in the Your Call section so I can
      approve/deny them being closed?"*
      **His page says "N tasks on your list look already finished."** Ran
      `node scripts/wyclau/chartkeeper.mjs --reap` and read all ten: **not one of them is flagged
      "looks finished."** Six say *the evidence is stale because the build moved on*, three say *he
      ruled and the row never moved*, one says *a pid is dead*.
      **THE ANSWER TO HIS IDEA: right instinct, wrong pile.** Stale-evidence rows need RE-MEASURING,
      not his approval — he cannot know from a phone whether a trade circle still clips a name.
      Already-ruled rows must never go back to him; that is `T-090`'s exact fault, the one he was
      furious about at 1:38 PM today. **Your Call is right for the residue only** — rows whose fate
      is genuinely his say-so, like *"merge the 465-commit branch to main — his own final say-so"*.
      **That pile is one or two rows, not ten.**
      ⚠ **AND THE "HE ALREADY RULED" SIGNAL CAN FIRE ON A ROW HE NEVER RULED ON. VERIFIED:** `T-078`
      (`CHART.md:1047`) is *"chase it only if it is seen again"* about an `<img>` that failed to paint
      once in a WebKit frame — matched against his **12:39:56Z ruling on whether a watch may read the
      claude-kit folder**. Unrelated. **Under his proposal, unfixed, that row would be put to him as a
      question — the very failure the proposal exists to reduce.** Fix the matcher before wiring
      anything to his page.
      **THE BUILD, in order:** (1) split the reap by KIND and name each kind in the note in his
      words; (2) fix the ruling-to-row matcher and red-proof it on `T-078`; (3) route each kind to
      its owner — re-measure, close, or ask him; (4) only then, his Your Call pile.
      **Sizing: `chartkeeper.mjs` and `glass.mjs`. No game code, no sea trial.**
