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
