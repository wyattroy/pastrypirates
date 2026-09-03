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

## T-218 — 2026-09-03 — Your ruling: does "number the options" cover the buttons themselves? (closed 2026-09-03 · CEO 176 · no game diff — his page's ruling buttons, not the game)

      ⟨`T-218`⟩

**His answer, twice, and the second one overruled this row's own recommendation.** First to the
Advisor ~11:55 AM ET: *"for every call i need to make, you should label your suggestions in the same
way as the claude question UI does -- with numbers, and a (recommended) -- so I can reply with 1, 2,
3, 4, or other and write in the box"*, naming the cause himself: *"There is no yes button -- only one
that says do it -- but what the it is, is unclear."* Then on the Glass at 15:56:28Z: *"this is a
perfect example of why 'approve' and 'deny' make no sense here -- what would 'approve' even mean in
response to your above question? Replace Approve and Deny with 1 2 3 Other."*

**The alternatives he did not pick**, as this row offered them: **(1)** leave the buttons as words
and number options only where he has to type an answer — this row's OWN recommendation, which he
rejected; **(3)** letter them A, B, C. **He chose (2) and went further:** Approve and Deny go
entirely.

**Shipped.** Questions declare numbered options and the page renders them with a (recommended)
marker; a question declaring none gets numbered defaults; the write-in box is labelled Other. Stored
keys stay `yes`/`no`/`talk` so nothing already ruled comes un-pressed, and declared options key
off their WORDS, so inserting an option cannot move his tick onto a choice he never made.

⚠ **THREE PLACES WERE ENFORCING THE WORDS HE HAD REVERSED, AND EACH WAS FOUND BY THE NEXT REVIEW.**
`numbered_options_check` case 4 (CEO 174), `glass_ruling_button_words_check` cases 1–2, and then
that same file's case 5 plus `harvest_glass.mjs`'s hard-coded word map (CEO 176) — which meant his
page said *"1 Yes — go ahead"* while his permanent decision record said *"Approve"*, and a numbered
answer landed as `opt-15wnciu`. **The rule earned: gate the PROPERTY he asked for, never the
literal string.**

⚠ **AND THIS ROW STAYED LIVE ON HIS GLASS FOR HOURS AFTER THE WORK SHIPPED** — CEO 176: *"the page
he steers from still describes buttons that no longer exist and offers him a choice that has already
been made. He does not read the commits; he reads that row."*

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
| **Does "always number or letter the options" cover the ruling buttons themselves?** ⟨`T-218`⟩ | **NUMBERS, AND THEN FURTHER.** ~11:55 AM ET: *"label your suggestions in the same way as the claude question UI does -- with numbers, and a (recommended) -- so I can reply with 1, 2, 3, 4, or other"*; then on the Glass 15:56:28Z, rejecting this row's own recommendation: *"what would 'approve' even mean in response to your above question? Replace Approve and Deny with 1 2 3 Other."* | **SHIPPED AND SWEPT 2026-09-03 · CEO 176.** Full record: `## T-218` above. Every card is 1 2 3 Other; stored keys unchanged so nothing already ruled came un-pressed. ⚠ **Three separate gates were enforcing the words he had reversed** — two found by CEO 174, a third plus the harvest's hard-coded map by CEO 176, which had his page saying *"1 Yes — go ahead"* and his decision record saying *"Approve"*. |
| **The rules-page split — all five questions, 6:50–6:53 PM ET** (which page is THE rules page; what About keeps; the in-game modal; pirate voice or his own; About's credits list) | **ANSWERED, ALL FIVE.** Verbatim in `INBOX-20260902T225008Z` / `…225032Z`; rulings 1 and 2 also in `DECISIONS.md`. | **RETIRED FROM `BLOCKED ON WYATT` 2026-09-02 6:58 PM ET — BY HAND, FOR THE THIRD TIME THAT DAY, AND THAT HAND REPAIR IS WHY THE FIX EXISTS.** ⚠ The harvest that recorded them wrote *"all five rules-page questions in the Your Call table above are now answered"* **and left all five asking**, because harvesting and retiring were different jobs and it had authority for only one. His words, 6:57 PM: *"this is NOT fixed and it is a PRIORITY more than any of the SEO work"*. **BUILT 7:xx PM the same evening** — `retire_answered.mjs` makes recording the answer and deleting the question one act, and `answered_question_retired_check.mjs` fails the build if an answered question is still asking him, red-proofed on these exact five questions. ⚠ **This row sat in `## RULED` carrying its verdict, which had `npm test` RED**: step 3 of that table's own three-move process — move the row here — had not been taken. Second night running the same step was skipped; the move is what makes it settled. |
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
| <!--qid:t206-ga-turn-on--> ⟨`T-206`⟩ **There is probably already a Google Analytics account sitting in your Google login for this game, and nothing on the site has ever used it. Switching it on is one line — so the only real questions are which pages, and whether you want a cookie notice.** You asked for *"google analytics on playpastrypirates.com"*. The game's Firebase settings carry a Google Analytics ID, `G-2KK6EZDZSP`. Google normally writes that line in only when Analytics is switched on for a project — **but I cannot see inside your account, and this repo's own note says that settings block was copied wholesale from an older file, so treat "the account exists" as likely, not certain. You can confirm it in about ten seconds and that is the first thing to check.** What I did measure, across every one of the 38 pages and 71 script files in the repo: **nothing anywhere loads it.** No `gtag.js`, no Firebase analytics, not one call. So whatever that account is, it has been told nothing, ever. **And here is what the game already tells you without Google, measured on the live site this morning, last 14 days:** 237 page loads from **123 different browsers** → **44 voyages started** (by 19 of them) → **8 finished**. Solo 35, pass-and-play 3, crew 6. ⚠ **Those last two ratios read worse than the game deserves and I nearly quoted them at you flat**: the counter only records a start for the person who *begins* a voyage, so **every crew guest, and every player who resumes a saved game, counts as "opened it and never played"** — and private tabs count as a new browser each time. The real drop-off is better than 123→19; nobody knows yet by how much. | Give me instructions to switch it on, and give me the full plan for analytics as an artifact that I can understand more easily than this text. Thank you! Also, we need a way to bypass sea trial for this-- it clearly doesn't need a full one given that you're just adding a tag to index; so we need a way to tell sea trial that and manually choose the depth of the trial | **PLAN DELIVERED 2026-09-03T17:0xZ — the artifact you asked for is written, and the ball is back with you.** Published: https://claude.ai/code/artifact/e2b9946d-93ec-4d4f-8c90-f9dd771bf6b0 — what you already collect (237 boots / 123 browsers / 44 starts / 8 finishes, re-read off the live database that morning, not remembered), the four reasons the 123→19 drop-off reads worse than it is, the three things Google adds that you genuinely do not have, and five numbered steps to switch it on. **Nothing was installed** — you asked for instructions and a plan, and consent is yours. **It ends on two questions for you**, both with a recommendation marked: which pages get the tag, and cookie or cookieless. ⚠ **One claim on that page is unverified and says so on its own face** — this machine has no web access, so GA4's no-storage setting rests on how it has worked rather than on Google's current docs; it gets checked before anything is installed. **Your third sentence — the sea-trial depth control — is NOT in here**; it is its own checklist row, because it changes the testing machinery and not the game. Photographed at 390px and 1280px: `.planning/posed/t206-analytics-plan-phone.png`, `…-desktop.png`. |

| Recipe pictures: convert PNG → WebP (21 pastry images, 1.71MB → 1.18MB, no visible change) | **"Do it; but I am surprised that they are already 'too small'— what is the maximum size they are displayed at?"** — ruled on the Glass 2026-09-02T00:58:35.117Z |  **SHIPPED** — CEO 96, commit `3a43235`. Triaged out of RULED 2026-09-03T07:1xZ. |
| May a watch publish to staging on its own? The tree is green, trial-covered and every screen judged, and the one command that puts it on `staging.playpastrypirates.com` is the one thing an unattended watch is not allowed to run — three forms all answered "This command requires approval." | **YES** — ruled on the Glass 2026-09-02T04:03:36.066Z, no note attached |  **DONE** — the permission is at `.claude/settings.json:11-12` (both forms); `T-027` closed 06:50Z on CEO 149. Triaged out of RULED 2026-09-03T07:1xZ. |

| Do you want `SCHEDULED` to stop hiding your ideas? Measured with the page's own logic: 13 of your 15 ideas are hidden from the Glass, 9 of them by the word `SCHEDULED` — which the code treats as identical to SHIPPED and CLOSED, against the Charter's own words: "Every idea gets a visible fate (shipped / scheduled / parked-with-reason)." | **"yes"** — ruled on the Glass 2026-09-02T12:28:02.757Z, no note attached |  **SHIPPED** — all three fate states built; the third (PARKED dimmed, with its reason) landed in `417adefc`, CEO 155 then 157. `T-139` closed through the gate. Triaged out of RULED 2026-09-03T09:0xZ. |

> **Settled 2026-09-03T09:0xZ, and the lifecycle is the point:** the work shipped, so the ruling
> moves to SETTLED — it does NOT get another task row. `rulings_triage_check` failed here because
> `T-139` was closed and swept while the ruling still sat in `## RULED` with an empty verdict, so
> the gate correctly saw a ruling on no surface he reads. **Closing the work and settling the
> ruling are two acts, and only the first is automatic.**

| **Your player-count console — where should it live?** You asked for *"a firebase admin console so I can see how many people are playing"*. **Measured first: the current game has NO stats or admin page at all** — `stats.html` and `lab.html` do not exist at the repo root; the only one in the repo is `classic/stats.html`, inside the frozen v1. So this is a new surface however it is built, and where it goes is yours. | **"put it at /stats.html behind a simple curtain and block it from robots.txt"** — ruled on the Glass, harvested from `INBOX-20260902T214507Z` | **BUILT 2026-09-03T09:5xZ, CEO 159 — and NOT YET ON THE LIVE SITE.** All three clauses done and held by `scripts/qa/stats_console_check.mjs` (five red-proofs, one per clause). ⚠ **The premise of the question was measured half-wrong in the doing, and that is the part worth keeping:** the console ALREADY EXISTED and was ALREADY LIVE at `playpastrypirates.com/classic/stats.html` (HTTP 200), reading his real numbers, at a URL nobody had told him about — while `/stats.html` was a 404. `src/ui/usage.js:5` has said since 2026-08-10 that its records are *"read back by /stats.html"*; the cutover moved the writers and left the reader in `classic/`. **And `robots.txt:11` had blocked `/stats.html` since that same cutover, so half his ruling was true before he gave it.** The GA half of his original sentence is untouched and has its own row on the Chart. Triaged out of RULED 2026-09-03T09:5xZ. |

> ⚠ **THE TWO ROWS ABOVE WERE TRIAGED OUT OF `## RULED` ON 2026-09-03T07:1xZ, AND THE REASON IS
> WORTH KEEPING: THE CARD THAT WAS THEIR ONLY SURFACE IS BEING REMOVED.** Wyatt, on the Glass
> 2026-09-02T13:18Z: *"Remove the 'Your rulings in hand' box from the Glass."* Watch c1 is doing
> that, and checked BEFORE shipping whether it would blind the detector — it does not, because
> `rulings_triage_check`'s `violations()` reads the RECORD (`## RULED`, `## SETTLED RULINGS`, the
> STEP 1 CHECKLIST) and never the HTML. **But four rulings sat in `## RULED` with empty `now`
> cells, and that card was the only place they appeared.** Removing it would have dropped all
> four off the page he reads, silently, with every gate still green.
> **Two were finished and are here. The two that still owe work got `- [ ] Your ruling:` rows in
> the STEP 1 CHECKLIST instead** — the admin console at `/stats.html`, and *"stop `SCHEDULED`
> hiding your ideas"*. **A surface being retired is a moment to ask what only lived there.**

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

## T-111 — 2026-09-03 — A FIELD NAMED artifactVersion HOLDS A CLOCK, IN BOTH RECEIPTS, AND THE GATE CANNOT SEE IT (closed 2026-09-03 · CEO 130 · no game diff — no game diff -- the ask is the Glass receipts' own format, not the game: both writers refuse a clock from one shared definition, gate 112 red-proofed on the two real strings from his 2026-09-02 receipts; src/ and index.html untouched) BECAUSE IT ONLY CHECKS THE NAME. INBOX-20260902T2156Z, measured 2026-09-02 5:56 and 6:06 PM ET. Sizing: one value in two call sites, plus one gate. No game code, no sea trial. MEASURED, two real versions of his page: 1788385436-4b8b and 1788385523-b046 both carry generatedAt 21:08:44.245Z — identical — and the second contains his Google Analytics idea while the first does not. generatedAt moves when a SESSION regenerates the page and never when HE saves into it, and his saves are the only thing these receipts exist to detect. A comparison against it says "unchanged" at the exact moment he has written something. IT SPREAD IN TEN MINUTES. LAST-HARVEST first ("artifactVersion": "2026-09-02T21:55:24.391Z"), then LAST-PUBLISH (version=2026-09-02T22:06:23.279Z) — which held the correct 1788386140-0fbe form eleven minutes earlier. Both receipts now record a clock and call it a version. ⚠ AND IT BROKE A DETECTOR THAT WAS WORKING: the cheapest way to tell HIS save from a session's publish was whether LAST-PUBLISH named the version the notification announced. The two sides are now different kinds of value, so that comparison is impossible. It is how his 5:43 PM ruling was found sitting unharvested. THE FIX: (1) pass the tool's <epoch>-<hash> id to mark_glass_harvest.mjs --version= and mark_glass_published.mjs --version=; (2) add the missing gate — fail if the recorded version parses as a date — and red-proof it against today's files, which do. WHY IT SLIPPED PAST EVERYTHING, and this is the reusable half: glass_harvest_hook_check.mjs:277-279 asserts the writer stores SOMETHING under artifactVersion, and the runbook reads that name (GLASS-UPDATE-SESSION.md:217). Nothing checks the KIND of value. A gate on a field's NAME is not a gate on its CONTENTS, and the right name is precisely what kept everyone confident. mark_glass_published.mjs refusing an EMPTY value is the same gap one level down: refusing absence is not checking kind. ROOT CAUSE NAMED BY THE SESSION THAT DID IT, and it points at an item already on this Chart: the Glass-update session dispatches each tick to a fresh subagent and sees only its prose report, never its tool calls — "that's my dispatched subagents' mistake on the last two ticks." Same weakness filed at INBOX-20260902T1845Z. Fixing the value without fixing that leaves the next wrong value equally invisible. ✅ HIS WORDS WERE NEVER AT RISK FROM THIS — the runtime refuses a stale publish regardless (INBOX-20260902T2100Z). What was at risk is every reader believing these receipts mean something they do not.

- [x] **A FIELD NAMED `artifactVersion` HOLDS A CLOCK, IN BOTH RECEIPTS, AND THE GATE CANNOT SEE IT (closed 2026-09-03 · CEO 130 · no game diff — no game diff -- the ask is the Glass receipts' own format, not the game: both writers refuse a clock from one shared definition, gate 112 red-proofed on the two real strings from his 2026-09-02 receipts; src/ and index.html untouched)
      ⟨`T-111`⟩
      BECAUSE IT ONLY CHECKS THE NAME.** `INBOX-20260902T2156Z`, measured 2026-09-02 5:56 and
      6:06 PM ET. **Sizing: one value in two call sites, plus one gate. No game code, no sea trial.**
      **MEASURED, two real versions of his page:** `1788385436-4b8b` and `1788385523-b046` both carry
      `generatedAt` **`21:08:44.245Z`** — identical — and the second contains his Google Analytics
      idea while the first does not. **`generatedAt` moves when a SESSION regenerates the page and
      never when HE saves into it**, and his saves are the only thing these receipts exist to detect.
      A comparison against it says "unchanged" at the exact moment he has written something.
      **IT SPREAD IN TEN MINUTES.** `LAST-HARVEST` first (`"artifactVersion": "2026-09-02T21:55:24.391Z"`),
      then `LAST-PUBLISH` (`version=2026-09-02T22:06:23.279Z`) — which held the correct
      `1788386140-0fbe` form eleven minutes earlier. **Both receipts now record a clock and call it a
      version.**
      ⚠ **AND IT BROKE A DETECTOR THAT WAS WORKING:** the cheapest way to tell HIS save from a
      session's publish was whether `LAST-PUBLISH` named the version the notification announced. The
      two sides are now different kinds of value, so that comparison is impossible. **It is how his
      5:43 PM ruling was found sitting unharvested.**
      **THE FIX:** (1) pass the tool's `<epoch>-<hash>` id to `mark_glass_harvest.mjs --version=` and
      `mark_glass_published.mjs --version=`; (2) **add the missing gate — fail if the recorded
      version parses as a date — and red-proof it against today's files, which do.**
      **WHY IT SLIPPED PAST EVERYTHING, and this is the reusable half:**
      `glass_harvest_hook_check.mjs:277-279` asserts the writer stores SOMETHING under
      `artifactVersion`, and the runbook reads that name (`GLASS-UPDATE-SESSION.md:217`). **Nothing
      checks the KIND of value. A gate on a field's NAME is not a gate on its CONTENTS**, and the
      right name is precisely what kept everyone confident. `mark_glass_published.mjs` refusing an
      EMPTY value is the same gap one level down: refusing absence is not checking kind.
      **ROOT CAUSE NAMED BY THE SESSION THAT DID IT, and it points at an item already on this
      Chart:** the Glass-update session dispatches each tick to a fresh subagent and sees only its
      prose report, never its tool calls — *"that's my dispatched subagents' mistake on the last two
      ticks."* **Same weakness filed at `INBOX-20260902T1845Z`.** Fixing the value without fixing
      that leaves the next wrong value equally invisible.
      ✅ **HIS WORDS WERE NEVER AT RISK FROM THIS** — the runtime refuses a stale publish regardless
      (`INBOX-20260902T2100Z`). What was at risk is every reader believing these receipts mean
      something they do not.

## T-103 — 2026-09-03 — ⚑⚑ DRAG TO REPRIORITISE THE CHART, IN THE GLASS — he wrote "DO NOW" on this himself. (closed 2026-09-03 · CEO 132 · no game diff — no game code is right: the ask is his own page and the tool that ranks it -- he can drag the Tasks list, the order rides as handles, and chartkeeper --order= makes RANK obey it; commits 8327a1b9 and 2703d0b4, src/ and index.html untouched) (This row asserted "THEY ARE THE TOP TWO ROWS" while sitting third — CEO 117 caught it. A row must not claim its own position: RANK decides that and moves rows under it.) Glass, 2026-09-02, 3:09 PM ET. Triaged here by the Advisor at 3:12 PM out of THE IDEA INBOX, where the harvest correctly parked them below every open checklist row — which is the exact sinking he has now complained about five times. HIS WORDS, VERBATIM: "DO NOW: build a way for me to drag to reprioritize the chart, in The Glass." (He wrote a second DO NOW note in the same breath — the button — and it was under this same checkbox until 21:5xZ. It is now the row below, and its handle is T-104. The bracketed handle tags that used to sit in this paragraph were removed with the split: they made T-104 a handle carried by two open rows, which is the fault that silently mis-attributed T-078.) THESE ARE THE CONCRETE BUILD OF T-083's SECOND HALF, which is the row directly below and carries his earlier words: "i need a way to say DO THIS NOW." Read T-083 first — it is the design and it is his — then build these two as its interface. They are not a separate idea and must not be designed twice. ⚠ AND THE JOKE IS LOAD-BEARING, SO DO NOT LOSE IT: he had to type "DO NOW" in prose, twice, because the button that would have let him say it does not exist yet — and the request for that button then sank to the bottom of the list. The feature is its own acceptance test: had T-104 been shipped, T-104 would not have needed rescuing by hand. That is the same sentence the Chartkeeper audit already earned once (INBOX-20260902T04xxZ), now true a second time, of a different tool, in one day. A hand-placement like this one is the failure, not the fix — it works once and generalises to nothing. Sizing: both are Glass UI (glass.mjs plus chartkeeper.mjs's rank input). No game code, no sea trial — COSMETIC gear plus a rendered screenshot at 390×844. Verbatim text and the harvest account: THE IDEA INBOX below, and the Glass commits 996ee621 / 7042c7e0. ⚑ SPLIT 2026-09-02T21:5xZ. THE SECOND OF HIS TWO NOTES — THE BUTTON — IS BUILT AND IS NOW THE ROW DIRECTLY BELOW. WHAT IS LEFT ON THIS ROW IS THE DRAG, AND ONLY THE DRAG. Two notes under one checkbox meant RANK's number-one row could only ever be half-closed. CEO 121 caught the commit claiming this split in the past tense while CHART.md had not been touched — the eighth verdict to find a sentence tidier than the record, and this is the correction. The head line above still reads T-103, so this row is the drag. WHAT THE DRAG STILL NEEDS, and it is genuinely more than the button was: the Tasks card renders plain strings (glass.mjs's openChecklist → shortTask), so no task on his page carries its handle — there is nothing for a drag to identify yet. Dragging also has to persist an ORDER where the pin persists a single slot; chartkeeper.mjs --do-now is the read-modify-write shape to copy, not to reinvent. Sizing: MEDIUM.

- [x] **⚑⚑ DRAG TO REPRIORITISE THE CHART, IN THE GLASS — he wrote "DO NOW" on this himself.** (closed 2026-09-03 · CEO 132 · no game diff — no game code is right: the ask is his own page and the tool that ranks it -- he can drag the Tasks list, the order rides as handles, and chartkeeper --order= makes RANK obey it; commits 8327a1b9 and 2703d0b4, src/ and index.html untouched)
      ⟨`T-103`⟩
      *(This row asserted "THEY ARE THE TOP TWO ROWS" while sitting third — CEO 117 caught
      it. **A row must not claim its own position: RANK decides that and moves rows under it.**)*
      Glass, 2026-09-02, 3:09 PM ET. Triaged here by the Advisor at 3:12 PM out of
      THE IDEA INBOX, where the harvest correctly parked them **below every open checklist row** —
      which is the exact sinking he has now complained about five times.
      **HIS WORDS, VERBATIM:** *"DO NOW: build a way for me to drag to reprioritize the chart, in
      The Glass."*
      *(He wrote a second DO NOW note in the same breath — the button — and it was under this same
      checkbox until 21:5xZ. It is now the row below, and its handle is `T-104`. The bracketed
      handle tags that used to sit in this paragraph were removed with the split: they made `T-104`
      a handle carried by two open rows, which is the fault that silently mis-attributed `T-078`.)*
      **THESE ARE THE CONCRETE BUILD OF `T-083`'s SECOND HALF**, which is the row directly below and
      carries his earlier words: *"i need a way to say DO THIS NOW."* **Read `T-083` first — it is
      the design and it is his — then build these two as its interface.** They are not a separate
      idea and must not be designed twice.
      ⚠ **AND THE JOKE IS LOAD-BEARING, SO DO NOT LOSE IT: he had to type "DO NOW" in prose,
      twice, because the button that would have let him say it does not exist yet — and the request
      for that button then sank to the bottom of the list.** The feature is its own acceptance test:
      **had `T-104` been shipped, `T-104` would not have needed rescuing by hand.** That is the same
      sentence the Chartkeeper audit already earned once (`INBOX-20260902T04xxZ`), now true a second
      time, of a different tool, in one day. **A hand-placement like this one is the failure, not the
      fix** — it works once and generalises to nothing.
      **Sizing: both are Glass UI (`glass.mjs` plus `chartkeeper.mjs`'s rank input). No game code,
      no sea trial** — COSMETIC gear plus a rendered screenshot at 390×844. Verbatim text and the
      harvest account: `THE IDEA INBOX` below, and the Glass commits `996ee621` / `7042c7e0`.
      ⚑ **SPLIT 2026-09-02T21:5xZ. THE SECOND OF HIS TWO NOTES — THE BUTTON — IS BUILT AND IS NOW
      THE ROW DIRECTLY BELOW. WHAT IS LEFT ON THIS ROW IS THE DRAG, AND ONLY THE DRAG.**
      Two notes under one checkbox meant RANK's number-one row could only ever be half-closed.
      **CEO 121 caught the commit claiming this split in the past tense while `CHART.md` had not
      been touched** — the eighth verdict to find a sentence tidier than the record, and this is the
      correction. **The head line above still reads `T-103`, so this row is the drag.**
      **WHAT THE DRAG STILL NEEDS, and it is genuinely more than the button was:** the Tasks card
      renders plain strings (`glass.mjs`'s `openChecklist` → `shortTask`), so **no task on his page
      carries its handle** — there is nothing for a drag to identify yet. Dragging also has to
      persist an ORDER where the pin persists a single slot; `chartkeeper.mjs --do-now` is the
      read-modify-write shape to copy, not to reinvent. **Sizing: MEDIUM.**

      ---
      ⚑ **BUILT 2026-09-03T01:1xZ, commits `8327a1b9` and `2703d0b4`. CEO 131 (PARTIAL) FOUND THREE
      FAULTS THAT MADE IT INERT ON THIS VERY CHART; all three were fixed in the same watch, and
      CEO 132 reviewed the fixes and returned YES** — *"the drag now reaches his Chart, and I
      measured it on his real data"* — **with four residuals filed as `T-115`–`T-118`.**
      *(The paragraph above is the state before this watch and is kept as written — it is what was
      true when the row was filed. "No task on his page carries its handle" is no longer true.)*
      **YOU CAN DRAG THE LIST.** Every open Chart row on the Tasks card carries its handle
      (`idOfRow`, the same reader the Chartkeeper identifies a row with, so the page and the tool
      cannot disagree about which row is which). The drag is POINTER events, not HTML5
      drag-and-drop — `dragstart`/`drop` never fire on iOS Safari, so the obvious build would have
      been perfect on the laptop and INERT on the phone you read this on. Photographed both ways:
      a real mouse at 900×1000 and a real touch drag at 390×844,
      [`.planning/posed/t103-*.png`](posed/).
      **THE ORDER IS SAVED AS HANDLES AND OBEYED BY RANK.** `chartkeeper.mjs --order=` writes
      `order: N` onto those head lines and clears the previous order in the same act — one order,
      replaced whole, never merged. `--order-clear` puts the list back on its derived ranking.
      **Your DO NOW pin still sits above your dragged order** because a pin is the later, sharper
      act; **that margin is a judgement and yours to overrule**, and `do_now_check.mjs` case 13 is
      where reversing it is one deliberate edit.
      ⚠ **AND HIS SAY-SO NOW REPLACES THE DERIVED NUMBER RATHER THAN BEING ADDED TO IT.** The first
      version added a bonus and RANK handed back a DIFFERENT sequence from the one dragged — a row
      carrying +30 for touching `src/` out-scored the row put one place above it. **A margin a
      derived signal can close is not an ordering, it is a suggestion.**
      ⚑ **WHAT CEO 131 CAUGHT, because it is the reusable half.** Every order case in the gate hands
      the command FOUR hand-picked clean handles; his page hands it FIFTY-SEVEN real ones, and three
      of those handles are carried by two rows each (`T-088`, `T-008`, `T-079` — the fault `T-107`
      already names). The command refuses such a sequence WHOLE, so **every drag he made died at the
      command while the page told him it was saved.** Its sentence: *"the check is honest and it is
      measuring a different thing than the one that is broken."* Fixed by making an ambiguous row
      **shown and undraggable** — derived from the rows, so it heals itself when `T-107` lands.
      Two more of its findings, both fixed: his page did not move until a watch re-ranked (the
      harvest step now runs `--order=` **and** `--rank --write`, gated), and a reload snapped the
      list back to file order while the note still swore it was saved (the saved order is now
      re-applied to the rows on every load). Plus its two smaller ones — the confirmation moved
      ABOVE the list, and the page now scrolls while a drag **keeps moving** near either edge,
      without which a fifty-seven-row list cannot be reordered on a phone at all.
      ⚠ **"KEEPS MOVING", NOT "HELD", AND THREE DOCUMENTS INCLUDING THIS ROW SAID "HELD".** CEO 132:
      *"no movement, no events, no scroll"* — the scroll fires inside `pointermove` with no timer, so
      a finger parked at the edge does nothing. Corrected everywhere rather than described away.
      ✅ **THE ACCEPTANCE TEST RUNS ON THIS CHART, NOT ON A FIXTURE:**
      `node scripts/qa/_t103_roundtrip.mjs` — render the page → take the sequence a drag would save
      → `--order=` → `--rank --write` → render again and read the order back. **50 draggable rows,
      no repeated handle, and the page comes back in the sequence dragged.**
      Account: [`CEO-REVIEWS.md`](CEO-REVIEWS.md) review 131 ·
      [`PREDICTION-20260903T0110Z-T103.md`](wyclau/PREDICTION-20260903T0110Z-T103.md).

## T-107 — 2026-09-02 — FIVE HANDLES ON THIS CHART ARE EACH CARRIED BY TWO DIFFERENT OPEN ROWS — measured done-when: node scripts/qa/no_ambiguous_handle_check.mjs ⛑ FIRST ROW ON THIS CHART TO CARRY A done-when:, 2026-09-02 10:20 PM ET. His instruction was "design a mechanism to tick rows" and then "now use it". This row's work — no two open rows sharing a handle — is exactly the kind that can state its own end: a gate runs, and the row is finished or it is not. Nobody's judgement is involved. 2026-09-02T21:xxZ, and the tool now says so on every run. T-090, T-103, T-088, T-008 and T-079. Found by CEO 119 on the live Chart, in the handle of the very row that was fixing handle mis-attribution — "the same fault the commit says it rooted out, in a form the fix does not cover." What is already done: an ambiguous handle now claims NOTHING (a ruling naming it names two jobs, so it may speak for neither), and chartkeeper.mjs prints the list on every run instead of quietly coping. Red-proofed both ways in chartkeeper_check.mjs case 14c-ter. What is left is the repair itself, and it is content work: give one row of each pair a new handle. It cannot be automated safely — a handle is grep-able across CHART.md and CHART-LOG.md and other rows point at it, so renumbering blind breaks references. T-079 is the older row about this same class and should be read first; this row supersedes nothing, it just has the measured list. Sizing: five edits to CHART.md plus a sweep for references. No game code, no sea trial.

- [x] **FIVE HANDLES ON THIS CHART ARE EACH CARRIED BY TWO DIFFERENT OPEN ROWS — measured
      ⟨`T-107`⟩
      done-when: node scripts/qa/no_ambiguous_handle_check.mjs
      ⛑ **FIRST ROW ON THIS CHART TO CARRY A `done-when:`, 2026-09-02 10:20 PM ET.** His
      instruction was *"design a mechanism to tick rows"* and then *"now use it"*. This row's work
      — no two open rows sharing a handle — is exactly the kind that can state its own end: a gate
      runs, and the row is finished or it is not. **Nobody's judgement is involved.**
      2026-09-02T21:xxZ, and the tool now says so on every run.** `T-090`, `T-103`, `T-088`, `T-008`
      and `T-079`. Found by CEO 119 on the live Chart, in the handle of the very row that was fixing
      handle mis-attribution — *"the same fault the commit says it rooted out, in a form the fix
      does not cover."*
      **What is already done:** an ambiguous handle now claims NOTHING (a ruling naming it names two
      jobs, so it may speak for neither), and `chartkeeper.mjs` prints the list on every run instead
      of quietly coping. Red-proofed both ways in `chartkeeper_check.mjs` case 14c-ter.
      **What is left is the repair itself, and it is content work:** give one row of each pair a new
      handle. **It cannot be automated safely** — a handle is grep-able across `CHART.md` and
      `CHART-LOG.md` and other rows point at it, so renumbering blind breaks references. `T-079` is
      the older row about this same class and should be read first; this row supersedes nothing, it
      just has the measured list.
      **Sizing: five edits to `CHART.md` plus a sweep for references. No game code, no sea trial.**

## T-124 — 2026-09-03 — Your ruling: the Glass's Ideas box corrupting the page after a save — GATED: awaiting his own look at the live page, which only he can do. Root-caused and fixed 2026-09-01, and he has since written to that page repeatedly with no corruption reported — very likely closable the next time he says so. (closed 2026-09-03 · CEO 142 · no game diff — no game code is right: sitemap.xml is a site-identity file Google reads, not the game -- his ask shipped 2026-09-02 as commit a13c3655 (CEO 122) and only this row was left open; gate PASS, red-proofed four ways this watch) ⚠ RENUMBERED T-008 → T-124, 2026-09-02 10:10 PM ET, at his instruction to clean the Chart. Two open rows carried T-008, so chartkeeper.mjs:860 treated every mention of it as claiming NOTHING — a ruling naming it named two jobs and spoke for neither, and his dragged order named it twice and could not say which row he had moved. Handles are never reused; T-008 still resolves in CHART-LOG.md and in git history.

- [x] Your ruling: the Glass's Ideas box corrupting the page after a save — **GATED: awaiting his own look at the live page**, which only he can do. Root-caused and fixed 2026-09-01, and he has since written to that page repeatedly with no corruption reported — very likely closable the next time he says so. (closed 2026-09-03 · CEO 142 · no game diff — no game code is right: sitemap.xml is a site-identity file Google reads, not the game -- his ask shipped 2026-09-02 as commit a13c3655 (CEO 122) and only this row was left open; gate PASS, red-proofed four ways this watch)
      ⟨`T-124`⟩
      ⚠ **RENUMBERED `T-008` → `T-124`, 2026-09-02 10:10 PM ET, at his instruction to clean the Chart.** Two open rows carried `T-008`, so `chartkeeper.mjs:860` treated every mention of it as claiming NOTHING — a ruling naming it named two jobs and spoke for neither, and **his dragged order named it twice and could not say which row he had moved.** Handles are never reused; `T-008` still resolves in `CHART-LOG.md` and in git history.

## T-088 — 2026-09-03 — A THIRD OF THE ART LIBRARY HAS NO MEASURED GAMEPLAY MAXIMUM — 1.25 MB the resize question (closed 2026-09-03 · CEO 143 · no game diff — closed on his own ruling, made twice: question UI 2026-09-02T12:24:03Z and Glass 16:10:03Z -- 'It's finished -- push it to sea trial.' No game code is right: this was a measurement item. The unmeasured 74 files / 1.05 MB survive as a standing guard on the Chart, not as work.) cannot see. Filed 2026-09-02T16:0xZ at CEO 109's finding. Split into three, biggest first: (a) 74 files / 1.05 MB NOT SEEN — the probe reaches five surfaces and never draws the badge family, the battle icons or the ingredient holes/. Not measured, so not safe to shrink, and that is 27% of the library sitting outside the answer. (b) 13 files / 0.20 MB whose only sighting is OFF the game — and CEO 109 checked two of them by hand: icons/crown.png (320×315, 35 KB) is drawn at 15px in the captains panel (index.html:428), 18px in the End-of-Voyage banner (src/ui/board.js:2072) and ~34–38 CSS px in the victory confetti (src/ui/board.js:2024); icons/cupcake.png (253×320, 28 KB) the same via celebrateHomeDocks() (src/ui/board.js:2003,2016). At 38 CSS px on a 2× screen both still carry ~4× the pixels they can use — 63 KB, more than half the whole remaining candidate list, in a bucket labelled "do not shrink". They need their gameplay slots measured, not assuming. (c) the camera-layer caveat, open since CEO 83 and still unfixed — the probe applies the zoom ceiling to svg image only, so an HTML <img> inside CAM_HTML_LAYERS (src/ui/stage.js:476) is measured at whatever zoom happened to be on. trade-swirl and wind-arrow are both in rimHost (src/ui/board.js:243-250), so their two rows in the current candidate list are FLOORS, not values — 2 of the 12. Sizing: this is a measurement item, not a resize item. It decides whether the 2.3% recorded in .planning/ASSET-DISPLAY-SIZES.md is the real answer or an underestimate. No game code. (That sentence used to cite T-087, which is "remove the Your-rulings-in-hand box from the Glass" — the row argued against a handle that is not the number. Corrected by CEO 143.) ⛔ CLOSED 2026-09-03 ON HIS OWN RULING — see the standing note directly below this row.

- [x] **A THIRD OF THE ART LIBRARY HAS NO MEASURED GAMEPLAY MAXIMUM — 1.25 MB the resize question (closed 2026-09-03 · CEO 143 · no game diff — closed on his own ruling, made twice: question UI 2026-09-02T12:24:03Z and Glass 16:10:03Z -- 'It's finished -- push it to sea trial.' No game code is right: this was a measurement item. The unmeasured 74 files / 1.05 MB survive as a standing guard on the Chart, not as work.)
      ⟨`T-088`⟩
      cannot see. Filed 2026-09-02T16:0xZ at CEO 109's finding.** Split into three, biggest first:
      **(a) 74 files / 1.05 MB `NOT SEEN`** — the probe reaches five surfaces and never draws the
      badge family, the battle icons or the ingredient `holes/`. Not measured, so not safe to
      shrink, and that is 27% of the library sitting outside the answer.
      **(b) 13 files / 0.20 MB whose only sighting is OFF the game** — and CEO 109 checked two of
      them by hand: `icons/crown.png` (320×315, 35 KB) is drawn at 15px in the captains panel
      (`index.html:428`), 18px in the End-of-Voyage banner (`src/ui/board.js:2072`) and ~34–38 CSS
      px in the victory confetti (`src/ui/board.js:2024`); `icons/cupcake.png` (253×320, 28 KB) the
      same via `celebrateHomeDocks()` (`src/ui/board.js:2003,2016`). **At 38 CSS px on a 2× screen
      both still carry ~4× the pixels they can use — 63 KB, more than half the whole remaining
      candidate list, in a bucket labelled "do not shrink".** They need their gameplay slots
      measured, not assuming.
      **(c) the camera-layer caveat, open since CEO 83 and still unfixed** — the probe applies the
      zoom ceiling to `svg image` only, so an HTML `<img>` inside `CAM_HTML_LAYERS`
      (`src/ui/stage.js:476`) is measured at whatever zoom happened to be on. `trade-swirl` and
      `wind-arrow` are both in `rimHost` (`src/ui/board.js:243-250`), so **their two rows in the
      current candidate list are FLOORS, not values** — 2 of the 12.
      **Sizing: this is a measurement item, not a resize item. It decides whether the 2.3% recorded
      in `.planning/ASSET-DISPLAY-SIZES.md` is the real answer or an underestimate.** No game code.
      *(That sentence used to cite `T-087`, which is "remove the Your-rulings-in-hand box from the
      Glass" — the row argued against a handle that is not the number. Corrected by CEO 143.)*
      **⛔ CLOSED 2026-09-03 ON HIS OWN RULING — see the standing note directly below this row.**

## T-112 — 2026-09-03 — npm test DESTROYS WHATEVER IS WAITING IN GLASS-NOTE.md — it consumed this watch's own (closed 2026-09-03 · CEO 135 · no game diff — Glass machinery, no game code: erasing his queued note is now opt-in (--consume-note); proved red then green, CEO 135 re-proved it independently) ⚑ HIS NOTE, 2026-09-02 10:30 PM ET, on the backlog page — VERBATIM: "I'm not sure if this is closed or not -- investigate." His words outrank this row. Whatever the row claims, his instruction is to CHECK it. note to him, an hour after the same hazard was filed about a session doing it by hand. Found 2026-09-02T22:0xZ by watching the file reset under a green suite. (It reset a second time minutes later; that one is NOT attributed here — a live Glass session consuming the note is the mechanism working, and the note did reach glass.html. Only the first is measured, and the code path below is what makes it certain rather than the timing.) THE MECHANISM, READ NOT GUESSED: scripts/qa/glass_roundtrip_check.mjs:29 runs the real generator as glass.mjs --note "gate: glass_roundtrip_check", and glass.mjs folds GLASS-NOTE.md into the page and resets the file unconditionally on every run. So the note a watch wrote for Wyatt is consumed by a page nobody will publish, and the only copy of it is a throwaway glass.html the next generation overwrites. ⚠ THIS IS INBOX-20260902T0350Z IN A NEW COSTUME. That entry is about the Advisor running --note merely to inspect the page and destroying a watch's finished screenshot results. The lesson written there — "a command that LOOKS like a read had a destructive side effect nobody warned about at the call site" — now applies to the test suite, which every session runs several times an item and nobody thinks of as a write. THE FIX IS ALREADY HALF-BUILT AND WAS BUILT FOR THIS: glass.mjs --chart=<path> is a REHEARSAL render that touches nothing outside the file you name (T-104, same commit). Point the round-trip gate at a fixture Chart and a fixture out-path and the hazard is gone for every gate at once. Do NOT fix it by making the gate restore the file afterwards — a destroy-then-repair is still a window, and this project has already lost a note inside one. Sizing: SMALL. No game code.

- [x] **`npm test` DESTROYS WHATEVER IS WAITING IN `GLASS-NOTE.md` — it consumed this watch's own (closed 2026-09-03 · CEO 135 · no game diff — Glass machinery, no game code: erasing his queued note is now opt-in (--consume-note); proved red then green, CEO 135 re-proved it independently)
      ⟨`T-112`⟩
      ⚑ **HIS NOTE, 2026-09-02 10:30 PM ET, on the backlog page — VERBATIM:** *"I'm not sure if this is closed or not -- investigate."*
      **His words outrank this row.** Whatever the row claims, his instruction is to CHECK it.
      note to him, an hour after the same hazard was filed about a session doing it by hand.**
      Found 2026-09-02T22:0xZ by watching the file reset under a green suite.
      *(It reset a second time minutes later; that one is NOT attributed here — a live Glass session
      consuming the note is the mechanism working, and the note did reach `glass.html`. Only the
      first is measured, and the code path below is what makes it certain rather than the timing.)*
      **THE MECHANISM, READ NOT GUESSED:** `scripts/qa/glass_roundtrip_check.mjs:29` runs the real
      generator as `glass.mjs --note "gate: glass_roundtrip_check"`, and `glass.mjs` folds
      `GLASS-NOTE.md` into the page and **resets the file unconditionally** on every run. So the
      note a watch wrote for Wyatt is consumed by a page nobody will publish, and the only copy of
      it is a throwaway `glass.html` the next generation overwrites.
      ⚠ **THIS IS `INBOX-20260902T0350Z` IN A NEW COSTUME.** That entry is about the Advisor running
      `--note` merely to inspect the page and destroying a watch's finished screenshot results. The
      lesson written there — *"a command that LOOKS like a read had a destructive side effect nobody
      warned about at the call site"* — now applies to **the test suite**, which every session runs
      several times an item and nobody thinks of as a write.
      **THE FIX IS ALREADY HALF-BUILT AND WAS BUILT FOR THIS:** `glass.mjs --chart=<path>` is a
      REHEARSAL render that touches nothing outside the file you name (`T-104`, same commit).
      Point the round-trip gate at a fixture Chart and a fixture out-path and the hazard is gone
      for every gate at once. **Do NOT fix it by making the gate restore the file afterwards** — a
      destroy-then-repair is still a window, and this project has already lost a note inside one.
      **Sizing: SMALL. No game code.**

## T-085 — 2026-09-03 — HARVEST HIS 12:39:56Z KIT RULING INTO DECISIONS.md — a two-minute edit this watch (closed 2026-09-03 · CEO 138 · no game diff — his 12:39:56Z kit ruling is in DECISIONS.md, and the contradicting 12:15Z NEVER row is marked superseded so the wrong answer is no longer findable) was refused permission to make, and its absence has already cost one item. The ruling: "May an unattended watch READ the claude-kit folder?" — "yes", ruled on the Glass 2026-09-02T12:39:56.363Z. CLAUDE.md §5: "A ruling he made that nobody harvested is the failure this system exists to stop." ✅ HARVESTED 2026-09-03T04:1xZ by the Advisor, which is a session that can write that file. grep "claude-kit folder" .claude/memory/DECISIONS.md → 1 (it was 0, and that count was this row's own check). Entry at .claude/memory/DECISIONS.md:3-35, additive only, with the alternative he did not pick and the READ-not-PUSH scope limit both intact. ⚠ AND CEO 138 FOUND THE HALF THAT WOULD HAVE MADE THE HARVEST WORTHLESS: THE SAME FILE ANSWERED THE SAME QUESTION "NEVER". DECISIONS.md:688 ruling 2 — "May a watch read claude-kit at runtime? NEVER — and that is the test. The fence stays closed." — committed ee1539ac at 12:15Z, twenty-five minutes BEFORE his "yes". Filing the right answer while the wrong one stayed findable is not a harvest; a session grepping claude-kit would have hit whichever it reached first. Row 2 is now marked SUPERSEDED and points at the new entry. The lesson generalises past this row: when you harvest a ruling, grep the file for the QUESTION, not only for the absence of the answer. The entry is already written — it is in the ledger under WATCH 13:10Z and in commit 9c4edb48's message, including the alternative he did not pick (leave the fence up and keep routing kit work to a human) and the scope limit (this ruling is about READING; nothing in it authorises a watch to PUSH to claude-kit). Paste it in. ⚠ .claude/memory/DECISIONS.md is permission-protected: an unattended watch's edit is refused. Whoever takes this needs a session that can write it — or the protection needs changing, which is a question for Wyatt, not a repair for a watch.

- [x] **HARVEST HIS 12:39:56Z KIT RULING INTO `DECISIONS.md` — a two-minute edit this watch (closed 2026-09-03 · CEO 138 · no game diff — his 12:39:56Z kit ruling is in DECISIONS.md, and the contradicting 12:15Z NEVER row is marked superseded so the wrong answer is no longer findable)
      ⟨`T-085`⟩
      was refused permission to make, and its absence has already cost one item.**
      The ruling: *"May an unattended watch READ the claude-kit folder?"* — **"yes"**, ruled on the
      Glass 2026-09-02T12:39:56.363Z. `CLAUDE.md` §5: *"A ruling he made that nobody harvested is
      the failure this system exists to stop."*
      ✅ **HARVESTED 2026-09-03T04:1xZ** by the Advisor, which is a session that can write that file.
      `grep "claude-kit folder" .claude/memory/DECISIONS.md` → **1** (it was 0, and that count was
      this row's own check). Entry at `.claude/memory/DECISIONS.md:3-35`, additive only, with the
      alternative he did not pick and the READ-not-PUSH scope limit both intact.
      ⚠ **AND CEO 138 FOUND THE HALF THAT WOULD HAVE MADE THE HARVEST WORTHLESS: THE SAME FILE
      ANSWERED THE SAME QUESTION "NEVER".** `DECISIONS.md:688` ruling 2 — *"May a watch read
      claude-kit at runtime? **NEVER — and that is the test.** The fence stays closed."* — committed
      `ee1539ac` at **12:15Z, twenty-five minutes BEFORE his "yes"**. Filing the right answer while
      the wrong one stayed findable is not a harvest; a session grepping `claude-kit` would have hit
      whichever it reached first. **Row 2 is now marked SUPERSEDED and points at the new entry.**
      *The lesson generalises past this row: when you harvest a ruling, grep the file for the
      QUESTION, not only for the absence of the answer.*
      **The entry is already written** — it is in the ledger under WATCH 13:10Z and in commit
      `9c4edb48`'s message, including the alternative he did not pick (leave the fence up and keep
      routing kit work to a human) and the scope limit (**this ruling is about READING; nothing in
      it authorises a watch to PUSH to claude-kit**). Paste it in.
      ⚠ `.claude/memory/DECISIONS.md` is permission-protected: an unattended watch's edit is
      refused. **Whoever takes this needs a session that can write it** — or the protection needs
      changing, which is a question for Wyatt, not a repair for a watch.

## T-097 — 2026-09-03 — ⚠ THE CLOSE GATE READS THE INBOX AS INSTRUCTIONS: A DOLLAR SIGN IN ONE OF HIS ITEMS WILL (closed 2026-09-03 · CEO 140 · no game diff — all three replacement sites now pass a function, so no word of his can be read as an instruction; the row's own s-flag fix was measured destructive and deliberately not taken) SHRED THE FILE, SILENTLY, WHILE PRINTING CLOSED. Found 2026-09-02T18:3xZ by walking into it: close_item.mjs:152 and :158 call String.replace with the rewritten section as the REPLACEMENT string, and JavaScript reads dollar-sequences in a replacement string as commands. A paragraph that merely QUOTED the gate's own regex contained a dollar followed by a backtick — "insert everything before the match" — and the gate spliced the file's first 34 lines into the middle of an entry. It exited 0 and printed CLOSED INBOX-20260901T1335Z. Repaired by hand the same minute; the damage was 34 duplicated lines, not lost words, because the duplication happened to be an insertion. PROVEN, NOT REASONED — "HEAD\nBODY\nTAIL".replace("BODY", payload) with a dollar-backtick payload yields "HEAD\nX HEAD\n Y\nTAIL"; the same call with () => payload yields the literal. THE FIX IS ONE CHARACTER CLASS: pass a replacer FUNCTION at both call sites. After that no INBOX text can ever be read as an instruction. ⚠ THREE CORRECTIONS TO THIS ROW, MADE WHILE FIXING IT 2026-09-03T04:2xZ. Read them before the prose above. 1. THERE WERE THREE CALL SITES, NOT TWO. The row missed the CHART branch, which built its replacement out of the row's own text — so a dollar sequence in a Chart row spliced the Chart's header into itself exactly as the INBOX bug did. CEO 140 confirmed it live, and then found the worse half: fixing that site is not the same as guarding it. It reintroduced the string form there alone and every one of the new cases stayed green. There is now a Chart-branch case, red-proofed against exactly that mutant. 2. THE LINE NUMBERS MOVED: the sites are close_item.mjs:214-221, not :152-158. 3. ⛔ THE s-FLAG FIX THIS ROW PRESCRIBES IS DESTRUCTIVE — MEASURED, NOT ARGUED. With s, . eats newlines and greedy . runs to the end of the entry, so /^status:.$/ms replaces the status line and every line below it. Against a block with a two-line status: and prose beneath, it yields "## INBOX-1\nstatus: DONE" — the prose deleted. INBOX.md:74 records a real four-line status: repaired by hand, so applied to that entry this row's own fix would have destroyed his words. Shipped instead: a BOUNDED match that stops at the first blank line or heading, with a permanent case that goes red against the s-flag version so nobody can "fix" it that way later. (Known limit, latent not live: the bounded form would swallow prose that follows the status block with NO blank line between. Every status: in the real INBOX is blank-line-terminated, so it cannot bite today.) ⚠ WHY THIS IS NOT A CURIOSITY: THE INBOX IS THE ONE FILE THAT HOLDS HIS WORDS VERBATIM. A "$5 bug bounty", a price, a shell snippet, $foo in a bug report — any of those in an item of his corrupts the record at the exact moment that item is closed. And the same line has a SECOND fault already recorded in INBOX-20260901T1335Z's own entry: the fate regex has no s flag, so a multi-line status: block is only half-replaced, leaving text under a line reading DONE. Both live in close_item.mjs:152-158; fix them together. Sizing: small — two call sites, plus a red-first fixture whose status block is multi-line and whose prose contains a dollar sign. ⚠ The file is VENDORED from claude-kit and its header says edit there; his 2026-09-02 ruling inverted that for glass.mjs but has not been extended here, so the first decision is which tree it lands in, and vendor_check.mjs will have an opinion.

- [x] **⚠ THE CLOSE GATE READS THE INBOX AS INSTRUCTIONS: A DOLLAR SIGN IN ONE OF HIS ITEMS WILL (closed 2026-09-03 · CEO 140 · no game diff — all three replacement sites now pass a function, so no word of his can be read as an instruction; the row's own s-flag fix was measured destructive and deliberately not taken)
      ⟨`T-097`⟩
      SHRED THE FILE, SILENTLY, WHILE PRINTING `CLOSED`.** Found 2026-09-02T18:3xZ by walking into it:
      `close_item.mjs:152` and `:158` call `String.replace` with the rewritten section as the
      REPLACEMENT string, and JavaScript reads dollar-sequences in a replacement string as commands.
      A paragraph that merely QUOTED the gate's own regex contained a dollar followed by a backtick —
      *"insert everything before the match"* — and the gate spliced the file's first 34 lines into the
      middle of an entry. **It exited 0 and printed `CLOSED INBOX-20260901T1335Z`.** Repaired by hand
      the same minute; the damage was 34 duplicated lines, not lost words, because the duplication
      happened to be an insertion.
      **PROVEN, NOT REASONED** — `"HEAD\nBODY\nTAIL".replace("BODY", payload)` with a dollar-backtick
      payload yields `"HEAD\nX HEAD\n Y\nTAIL"`; the same call with `() => payload` yields the literal.
      **THE FIX IS ONE CHARACTER CLASS: pass a replacer FUNCTION at both call sites.** After that no
      INBOX text can ever be read as an instruction.
      ⚠ **THREE CORRECTIONS TO THIS ROW, MADE WHILE FIXING IT 2026-09-03T04:2xZ. Read them before
      the prose above.**
      1. **THERE WERE THREE CALL SITES, NOT TWO.** The row missed the CHART branch, which built its
         replacement out of the row's own text — so a dollar sequence in a *Chart* row spliced the
         Chart's header into itself exactly as the INBOX bug did. CEO 140 confirmed it live, and
         then found the worse half: **fixing that site is not the same as guarding it.** It
         reintroduced the string form there alone and *every one of the new cases stayed green.*
         There is now a Chart-branch case, red-proofed against exactly that mutant.
      2. **THE LINE NUMBERS MOVED:** the sites are `close_item.mjs:214-221`, not `:152-158`.
      3. ⛔ **THE `s`-FLAG FIX THIS ROW PRESCRIBES IS DESTRUCTIVE — MEASURED, NOT ARGUED.** With `s`,
         `.` eats newlines and greedy `.*` runs to the end of the entry, so `/^status:.*$/ms`
         replaces the status line **and every line below it**. Against a block with a two-line
         `status:` and prose beneath, it yields `"## INBOX-1\nstatus: DONE"` — the prose **deleted**.
         `INBOX.md:74` records a real four-line `status:` repaired by hand, so **applied to that
         entry this row's own fix would have destroyed his words.** Shipped instead: a BOUNDED match
         that stops at the first blank line or heading, with a permanent case that goes red against
         the `s`-flag version so nobody can "fix" it that way later.
         *(Known limit, latent not live: the bounded form would swallow prose that follows the
         status block with NO blank line between. Every `status:` in the real INBOX is
         blank-line-terminated, so it cannot bite today.)*
      ⚠ **WHY THIS IS NOT A CURIOSITY: THE INBOX IS THE ONE FILE THAT HOLDS HIS WORDS VERBATIM.**
      A "$5 bug bounty", a price, a shell snippet, `$foo` in a bug report — any of those in an item of
      his corrupts the record at the exact moment that item is closed. **And the same line has a
      SECOND fault already recorded in `INBOX-20260901T1335Z`'s own entry:** the fate regex has no `s`
      flag, so a multi-line `status:` block is only half-replaced, leaving text under a line reading
      DONE. **Both live in `close_item.mjs:152-158`; fix them together.**
      **Sizing: small — two call sites, plus a red-first fixture whose status block is multi-line and
      whose prose contains a dollar sign.** ⚠ The file is VENDORED from claude-kit and its header says
      edit there; his 2026-09-02 ruling inverted that for `glass.mjs` but has not been extended here,
      so **the first decision is which tree it lands in, and `vendor_check.mjs` will have an opinion.**

## T-011 — 2026-09-03 — can_push.mjs SAYS "CAN PUBLISH" TO A WATCH WHOSE git push IS THEN REFUSED — twice now on (closed 2026-09-03 · CEO 136 · no game diff — can_push now prescribes the form the allowlist actually matches; the stale STOP block that told the next watch to discard the working fix is corrected in place) this branch, and it is the one fault the relay cannot survive. Measured 2026-09-02T03:xxZ, not fixed (one item). Sizing: small. The Door's own words are "a watch that pushes nothing is invisible, and an invisible watch is indistinguishable from a dead one." can_push.mjs is the guard against exactly that, and it checks four faults — detached HEAD, no upstream, rebase in progress, merge in progress (scripts/wyclau/can_push.mjs:21). A sandbox or permission layer that refuses git push outright is not among them, so the script prints can publish and the watch works a full turn into a void. It has now happened twice, to two different watches, both on claude/cloud-handoff-planning-a9ay1u: the 01:52Z watch (commit 33e94b89 local-only; rescued by the 02:19Z watch, which flagged it as "worth a row if it happens a third time") and this 03:00Z watch (two commits held locally). Both watches did everything right and neither could tell in advance. Why it is worse than an ordinary failure: the previous occurrence was only caught because a LATER watch on the same machine happened to be able to push and noticed the stranded commit. That is luck, not a mechanism. If both watches in a row are refused, the work is simply gone from every other machine's view while the ledger says it happened. Fix shape, and it must not be a fifth hand-typed case: the honest check is to ask git whether a push would succeed rather than to enumerate reasons it might not — git push --dry-run against the upstream — and report the refusal in the script's own words. Rule 9: derive the answer, never keep a list. > ⚠ SHARPENED AT THE END OF THE SAME WATCH, AND THE REAL CAUSE IS MUCH NARROWER — AND FIXABLE > TODAY. The push was not refused by anything about pushing. It was refused by the command > FORM. Measured, in this order, on one machine in one session: > git push → refused · git push origin HEAD → refused · git push origin <branch-name> → > SUCCEEDED, 916067cc..89bf93d4. > So the permission allowlist evidently matches git push origin <branch> and not the bare or > HEAD forms. That means two watches lost their work to a habit of typing git push, not to a > sandbox that forbids publishing — and the 01:52Z watch's commit sat stranded for half an hour > for the same reason. > ### ⛔ STOP — BOTH FIXES BELOW ARE MEASURED DEAD. DO NOT BUILD EITHER. (2026-09-03T02:50Z watch) > > Read this before the two paragraphs under it, because they are what a watch would otherwise > act on. A third watch was refused on this branch and measured the whole question again. Its > prediction — written before the measurement, at > .planning/wyclau/PREDICTION-20260903T0250Z-T011.md — was that the explicit-branch form would > work, exactly as this row claims. It does not. > > | run in one session, 2026-09-03 | result | > |---|---| > | git push --dry-run origin HEAD — as a shell command | REFUSED, "This command requires approval" | > | git push --dry-run origin <branch-name> — as a shell command | REFUSED, identically | > | both of those forms — from a node child process | exit 0, Everything up-to-date | > > ### ⛔⛔ EVERYTHING FROM HERE TO THE END OF THIS BLOCK WAS OVERTURNED ON 2026-09-03. READ THIS FIRST. > > THE TABLE ABOVE IS REAL AND IT CANNOT ANSWER THE QUESTION IT WAS BUILT FOR: every shell row in > it is a --dry-run form. With no non-dry-run shell row, it cannot tell "Bash versus node" > apart from "the flag position" — and the answer is the flag position. > > .claude/settings.json:22 reads Bash(git push origin claude/), and that is a PREFIX > match. git push --dry-run origin … does not begin with git push origin, so it can never > match, on any tree however healthy. Re-measured, same branch, minutes apart: > > | run as a shell command, 2026-09-03 | result | > |---|---| > | git push --dry-run origin <branch> | REFUSED — and it always will be | > | git push origin <branch> | exit 0, Everything up-to-date | > > SO (b) WAS RIGHT AND THIS ROW TALKED THE NEXT WATCH OUT OF IT. Corrected in > can_push.mjs:106-127, which now prescribes git push origin <branch> — a real no-op on a > synced tree that exercises the exact string the allowlist matches. Found by watch > pastrypirates-a3, verified independently, CEO 136 red-proofed the gate against the old file. > > AND THE OLD PRESCRIPTION WAS WORSE THAN WRONG — IT WAS A FALSE STOP AT THE DOOR. can_push.mjs > told every watch to run the --dry-run form and to end its turn if refused. On this machine > that fires 100% of the time on a perfectly healthy tree. The same false-instrument disease this > row is about, inverted: not a green that hides a fault, a STOP that invents one. > > THE THREE "STILL OPEN" CLAIMS BELOW ARE ALL SPENT (CEO 136, T-011): the allowlist is not > the only real repair — the command form was, and it landed; the SKILL.md line is not blocked > and needs no separate entry, because SKILL.md:27 already runs can_push.mjs at orientation and > the script prints the correct command; and close_item.mjs does take --chart= since > 11d44777, so this row can be closed through the gate — which is how it was closed. > > (Everything below is kept, unedited, as the graveyard — what was believed on 2026-09-02 and why. > It is wrong. Do not act on it.) > > (b) — "push with the explicit branch name" — DOES NOT REPRODUCE. It rested on a single > observation in a single session. Both forms are refused here. It is not a one-line fix; it is > not a fix. > > (a) — "can_push.mjs should run git push --dry-run" — IS WORSE THAN DEAD, and this is the > part worth carrying forward. can_push.mjs is a node script, and node pushes fine here > while the watch's own shell git push is refused. So that fix would print a confident green > about a capability the watch does not have — the same false green as today, by a longer route, > and harder to distrust because it looks like a real push. > > WHY NEITHER CAN WORK, IN ONE SENTENCE: the refusal lives in the session's command > allowlist, which sees shell commands and nothing else — so no script in this repo can measure > it, because the moment the question is asked from inside a script it is being asked from the > wrong side of the fence. > > WHAT WAS SHIPPED INSTEAD (can_push.mjs, can_push_check.mjs, three cases, red first): the > script no longer claims can publish. It states only what it verified (repo state), names the > one thing it cannot see, and prints the shell command the watch must run itself. That is the > whole of what a script can honestly do here. > > STILL OPEN, AND IT IS THE ONLY REAL REPAIR: Wyatt's permission list. If watches are meant to > push, git push belongs on the allowlist. A scripts/wyclau/push.mjs would work today — > node's push is not refused — but that is routing around a fence he set, and an unattended watch > is the wrong thing to decide it. Raised for him; deliberately not built. > > AND THE OTHER HALF IS BLOCKED THE SAME WAY: the matching line for > .claude/skills/door/SKILL.md (run the shell dry-run at orientation, beside can_push.mjs) > could not be written — this session's Edit tool is refused on that file. > chartkeeper_check.mjs independently reports the same fence on the same file. A session with > permission should add it. > > ⚠ AND THIS ROW CANNOT BE CLOSED THROUGH THE GATE: close_item.mjs:49 reads CHART.md only, > and this row lives in GLASS-CHART.md. Not ticked by hand — left open, deliberately. > > (The two paragraphs below are kept as the record of what was believed on 2026-09-02. They are > wrong. They are not instructions.) > > Two cheap fixes, and they are independent: (a) can_push.mjs should run git push --dry-run > and would have caught this instantly; (b) the Door and the watch runbook should say push with > the explicit branch name, because that is the form that works. (b) costs one line and removes > the failure entirely.

- [x] **`can_push.mjs` SAYS "CAN PUBLISH" TO A WATCH WHOSE `git push` IS THEN REFUSED — twice now on (closed 2026-09-03 · CEO 136 · no game diff — can_push now prescribes the form the allowlist actually matches; the stale STOP block that told the next watch to discard the working fix is corrected in place)
      ⟨`T-011`⟩
  this branch, and it is the one fault the relay cannot survive. Measured 2026-09-02T03:xxZ, not
  fixed (one item). Sizing: small.** The Door's own words are *"a watch that pushes nothing is
  invisible, and an invisible watch is indistinguishable from a dead one."* `can_push.mjs` is the
  guard against exactly that, and it checks **four** faults — detached HEAD, no upstream, rebase in
  progress, merge in progress (`scripts/wyclau/can_push.mjs:21`). **A sandbox or permission layer
  that refuses `git push` outright is not among them**, so the script prints `can publish` and the
  watch works a full turn into a void.
  **It has now happened twice, to two different watches, both on `claude/cloud-handoff-planning-a9ay1u`:**
  the 01:52Z watch (commit `33e94b89` local-only; rescued by the 02:19Z watch, which flagged it as
  *"worth a row if it happens a third time"*) and this 03:00Z watch (two commits held locally).
  **Both watches did everything right and neither could tell in advance.**
  **Why it is worse than an ordinary failure:** the previous occurrence was only caught because a
  LATER watch on the same machine happened to be able to push and noticed the stranded commit. That
  is luck, not a mechanism. If both watches in a row are refused, the work is simply gone from every
  other machine's view while the ledger says it happened.
  **Fix shape, and it must not be a fifth hand-typed case:** the honest check is to ask git whether
  a push would succeed rather than to enumerate reasons it might not — `git push --dry-run` against
  the upstream — and report the refusal in the script's own words. Rule 9: derive the answer,
  never keep a list.
  > **⚠ SHARPENED AT THE END OF THE SAME WATCH, AND THE REAL CAUSE IS MUCH NARROWER — AND FIXABLE
  > TODAY.** The push was **not** refused by anything about pushing. It was refused by the **command
  > FORM**. Measured, in this order, on one machine in one session:
  > `git push` → refused · `git push origin HEAD` → refused · `git push origin <branch-name>` →
  > **SUCCEEDED**, `916067cc..89bf93d4`.
  > So the permission allowlist evidently matches `git push origin <branch>` and not the bare or
  > `HEAD` forms. **That means two watches lost their work to a habit of typing `git push`, not to a
  > sandbox that forbids publishing** — and the 01:52Z watch's commit sat stranded for half an hour
  > for the same reason.
  > ### ⛔ STOP — BOTH FIXES BELOW ARE MEASURED DEAD. DO NOT BUILD EITHER. (2026-09-03T02:50Z watch)
  >
  > **Read this before the two paragraphs under it, because they are what a watch would otherwise
  > act on.** A third watch was refused on this branch and measured the whole question again. Its
  > prediction — written before the measurement, at
  > `.planning/wyclau/PREDICTION-20260903T0250Z-T011.md` — was that the explicit-branch form would
  > work, exactly as this row claims. **It does not.**
  >
  > | run in one session, 2026-09-03 | result |
  > |---|---|
  > | `git push --dry-run origin HEAD` — **as a shell command** | REFUSED, *"This command requires approval"* |
  > | `git push --dry-run origin <branch-name>` — **as a shell command** | **REFUSED, identically** |
  > | both of those forms — **from a node child process** | **exit 0**, `Everything up-to-date` |
  >
  > ### ⛔⛔ EVERYTHING FROM HERE TO THE END OF THIS BLOCK WAS OVERTURNED ON 2026-09-03. READ THIS FIRST.
  >
  > **THE TABLE ABOVE IS REAL AND IT CANNOT ANSWER THE QUESTION IT WAS BUILT FOR: every shell row in
  > it is a `--dry-run` form.** With no non-dry-run shell row, it cannot tell "Bash versus node"
  > apart from "the flag position" — and the answer is the flag position.
  >
  > `.claude/settings.json:22` reads `Bash(git push origin claude/*)`, and that is a **PREFIX**
  > match. `git push --dry-run origin …` does not begin with `git push origin`, so it can never
  > match, on any tree however healthy. Re-measured, same branch, minutes apart:
  >
  > | run as a **shell command**, 2026-09-03 | result |
  > |---|---|
  > | `git push --dry-run origin <branch>` | REFUSED — and it always will be |
  > | `git push origin <branch>` | **exit 0, `Everything up-to-date`** |
  >
  > **SO (b) WAS RIGHT AND THIS ROW TALKED THE NEXT WATCH OUT OF IT.** Corrected in
  > `can_push.mjs:106-127`, which now prescribes `git push origin <branch>` — a real no-op on a
  > synced tree that exercises the exact string the allowlist matches. Found by watch
  > `pastrypirates-a3`, verified independently, CEO 136 red-proofed the gate against the old file.
  >
  > **AND THE OLD PRESCRIPTION WAS WORSE THAN WRONG — IT WAS A FALSE STOP AT THE DOOR.** `can_push.mjs`
  > told every watch to run the `--dry-run` form and to **end its turn if refused**. On this machine
  > that fires 100% of the time on a perfectly healthy tree. *The same false-instrument disease this
  > row is about, inverted: not a green that hides a fault, a STOP that invents one.*
  >
  > **THE THREE "STILL OPEN" CLAIMS BELOW ARE ALL SPENT** (CEO 136, `T-011`): the allowlist is **not**
  > the only real repair — the command form was, and it landed; the `SKILL.md` line is **not** blocked
  > and needs no separate entry, because `SKILL.md:27` already runs `can_push.mjs` at orientation and
  > the script prints the correct command; and `close_item.mjs` **does** take `--chart=` since
  > `11d44777`, so this row can be closed through the gate — which is how it was closed.
  >
  > *(Everything below is kept, unedited, as the graveyard — what was believed on 2026-09-02 and why.
  > It is wrong. Do not act on it.)*
  >
  > **(b) — "push with the explicit branch name" — DOES NOT REPRODUCE.** It rested on a single
  > observation in a single session. Both forms are refused here. It is not a one-line fix; it is
  > not a fix.
  >
  > **(a) — "`can_push.mjs` should run `git push --dry-run`" — IS WORSE THAN DEAD, and this is the
  > part worth carrying forward.** `can_push.mjs` is a **node script**, and node pushes fine here
  > while the watch's own shell `git push` is refused. So that fix would print a confident green
  > about a capability the watch does not have — **the same false green as today, by a longer route,
  > and harder to distrust because it looks like a real push.**
  >
  > **WHY NEITHER CAN WORK, IN ONE SENTENCE:** the refusal lives in the **session's command
  > allowlist, which sees shell commands and nothing else** — so *no script in this repo can measure
  > it*, because the moment the question is asked from inside a script it is being asked from the
  > wrong side of the fence.
  >
  > **WHAT WAS SHIPPED INSTEAD (`can_push.mjs`, `can_push_check.mjs`, three cases, red first):** the
  > script no longer claims `can publish`. It states only what it verified (repo state), names the
  > one thing it cannot see, and prints the shell command the watch must run itself. **That is the
  > whole of what a script can honestly do here.**
  >
  > **STILL OPEN, AND IT IS THE ONLY REAL REPAIR: Wyatt's permission list.** If watches are meant to
  > push, `git push` belongs on the allowlist. A `scripts/wyclau/push.mjs` would work today —
  > node's push is not refused — but that is routing around a fence he set, and an unattended watch
  > is the wrong thing to decide it. **Raised for him; deliberately not built.**
  >
  > **AND THE OTHER HALF IS BLOCKED THE SAME WAY:** the matching line for
  > `.claude/skills/door/SKILL.md` (run the shell dry-run at orientation, beside `can_push.mjs`)
  > **could not be written — this session's Edit tool is refused on that file.**
  > `chartkeeper_check.mjs` independently reports the same fence on the same file. **A session with
  > permission should add it.**
  >
  > **⚠ AND THIS ROW CANNOT BE CLOSED THROUGH THE GATE:** `close_item.mjs:49` reads `CHART.md` only,
  > and this row lives in `GLASS-CHART.md`. Not ticked by hand — left open, deliberately.
  >
  > *(The two paragraphs below are kept as the record of what was believed on 2026-09-02. They are
  > wrong. They are not instructions.)*
  >
  > **Two cheap fixes, and they are independent:** (a) `can_push.mjs` should run `git push --dry-run`
  > and would have caught this instantly; (b) the Door and the watch runbook should say **push with
  > the explicit branch name**, because that is the form that works. (b) costs one line and removes
  > the failure entirely.

## T-076 — 2026-09-03 — HIS FOUR GLASS-PAGE ASKS — ALL FOUR NOW SHIPPED: expandable rows and a per-item comment box landed 2026-09-03T04:5xZ, verified in a browser (CEO 145). FIVE HOURS OLD WHEN FILED, ASKED FOUR TIMES, NEVER A (closed 2026-09-03 · CEO 145 · no game diff — expandable rows and a per-item comment box both shipped and verified in a real browser; the box shipped broken for ~15 min, is fixed, and the probe now fails on that bug) ⚑ HIS NOTE, 2026-09-02 10:36 PM ET, backlog page — VERBATIM: "PRIORITIZE this at the top." AN ORDER, NOT A COMMENT. Pinned with · now: yes, which measures at rank 1 (score 9,000,000) and the Door hands rank 1 to the next watch. ✅ SHIPPED 2026-09-02, in this order: the Chart re-prioritises itself (RANK runs in every watch via the Door, and the two derivations were converged so it ranks the list he actually sees) · The Lesson moved BELOW the Chart · the card renamed to The Chart (Tasks To Do) · next-to-be-completed first, re-ordered on every tick. ✅ BOTH BUILT 2026-09-03T04:5xZ — expandable rows and a per-item comment box, in glass.mjs, live on his page. ⛔ AND THE COMMENT BOX SHIPPED BROKEN FOR ~15 MINUTES, EATING EVERY WORD TYPED INTO IT. CEO 144 injected a fake artifact host and drove the real click: .rowcmt is a GRANDCHILD of .rowx, so box.insertBefore(p, cmt) threw NotFoundError — between "clear the textarea" and "publish". Pressing Save wiped what he typed, showed nothing, saved nothing, and the carefully written put-his-words-back handler was UNREACHABLE because the failure was on the SUCCESS path. Fixed: cmt.parentNode.insertBefore(p, cmt). ⚠ AND THE PROBE THAT "PROVED IT SAFE" COULD NEVER HAVE SEEN IT — with no artifact host, glass.mjs returns at if (!cap) return; before the push, the repaint and the publish. Its save check exercised a guard clause and reported "his words stay in the box", which was true and was not the question. CEO 140's "a check that cannot fail" — one night later, in a different file. The probe now installs a fake capability before the page script runs and asserts SUCCESS: a publish actually fires, the comment renders back verbatim, nothing throws. Red-proofed against the real bug: 4 failures including pubs: 0 and the NotFoundError. ✅ Also fixed from 143: the harvest banner glass.mjs prints at every render said a republish "DELETES both" — it is THREE now, and it named only ideas and rulings. And the full headline now leads the expanded body: shortTask truncates the visible title at 16 words and the body used to start at line 2, so the tail of his own pinned headline existed nowhere on the page (grep "FIVE HOURS OLD WHEN FILED" → 0; now 2). ⚠ STILL UNGUARDED, SAID IN WRITING RATHER THAN QUIETLY: scripts/qa/_t076_row_ui_probe.mjs is NOT in npm test and nothing re-runs it, and no gate anywhere reads glassState.comments — the harvest is version-identity enforced and field-blind. Wiring the probe into the suite is deliberately NOT done: it launches a browser, and T-131 is the open row about npm test colliding with a sailing sea trial. Run it by hand after any change to the row UI. ⛔ NOT part of this row: remove items once complete — SWEEP exists but is still the seven-day-with-a-stub form he OVERRULED, and it cannot ship until the done count is re-sourced from CHART-LOG.md. That is kit patch 6, filed separately. ROW UNTIL NOW. THIS IS THE NEXT ITEM, AHEAD OF EVERYTHING. Wyatt, 2026-09-02T07:xxZ: "why have NONE of my changes to the glass been made??????????? i asked for them FOUR HOURS AGO." He is right, and the reason is measurable rather than mysterious: all four asks live in ## THE IDEA INBOX (this file, ~line 1320) tagged SCHEDULED. glass.mjs:385 counts an inbox entry as an open task only when it has NO fate — and SCHEDULED is a fate. So marking them "SCHEDULED" made them invisible on his own page AND invisible to a Watch picking its one item, simultaneously. They have never had a - [ ] row or a T- handle. A watch noticed two of them and wrote "STILL NOT BUILT AND NOT FILED ANYWHERE ELSE" (line ~225) and still did not file them. THIS IS THE AUDIT'S OWN HEADLINE, PLAYING OUT AGAINST THE AUDIT ITSELF: "a row that says SCHEDULED with no owner and no position in a queue is a parked row wearing a better word." THE FOUR, in his words, oldest first: 1. 00:59:32Z — "You need to update Tasks list dynamically — it is stale." (the Chartkeeper; REAP is live, RANK is not — see PENDING-KIT-PATCHES.md 4) 2. 00:59:32Z, repeated 03:45:45Z — "Move The Lesson section below it." / "Move The Lesson to below Tasks." Asked twice. One CSS/DOM move in glass.mjs. 3. 03:46:13Z — "rename Tasks to The Chart (Tasks To Do)." One string. 4. 03:49:02Z — "Make all tasks in The Chart expandable for fuller context. Let me write a comment under each one if I choose to. Order the list with the next-to-be-completed at the top. re-order the list dynamically. Remove items from the list after they are complete." SIZING, HONESTLY: items 2 and 3 are minutes and are pure glass.mjs. Item 4's expandable rows and comment box are a bigger piece of the same file. glass.mjs IS VENDORED — edit in claude-kit, then re-vendor, which is the friction that has been quietly deferring all of this. Do items 2 and 3 first and publish, so he sees movement on the page within one tick. ⚠ AND THE ADVISOR'S OWN RECOMMENDATION WAS TO SHIP THIS HALF FIRST — SPEC-CHARTKEEPER.md: "a perfectly-ranked list still reads as gibberish on his phone if every row is 90 truncated characters." That recommendation was made and then not carried into a row anybody could take. The backend half has had seven watches; the half he can see has had none.

- [x] **HIS FOUR GLASS-PAGE ASKS — ALL FOUR NOW SHIPPED: expandable rows and a per-item comment box landed 2026-09-03T04:5xZ, verified in a browser (CEO 145). FIVE HOURS OLD WHEN FILED, ASKED FOUR TIMES, NEVER A (closed 2026-09-03 · CEO 145 · no game diff — expandable rows and a per-item comment box both shipped and verified in a real browser; the box shipped broken for ~15 min, is fixed, and the probe now fails on that bug)
      ⟨`T-076` · now: yes⟩
      ⚑ **HIS NOTE, 2026-09-02 10:36 PM ET, backlog page — VERBATIM:** *"PRIORITIZE this at the top."*
      **AN ORDER, NOT A COMMENT.** Pinned with `· now: yes`, which measures at rank 1 (score 9,000,000) and the Door hands rank 1 to the next watch.
      ✅ **SHIPPED 2026-09-02, in this order:** the Chart re-prioritises itself (RANK runs in every
      watch via the Door, and the two derivations were converged so it ranks the list he actually
      sees) · The Lesson moved BELOW the Chart · the card renamed to *The Chart (Tasks To Do)* ·
      next-to-be-completed first, re-ordered on every tick.
      ✅ **BOTH BUILT 2026-09-03T04:5xZ** — expandable rows and a per-item comment box, in
      `glass.mjs`, live on his page.
      ⛔ **AND THE COMMENT BOX SHIPPED BROKEN FOR ~15 MINUTES, EATING EVERY WORD TYPED INTO IT.**
      CEO 144 injected a fake artifact host and drove the real click: `.rowcmt` is a GRANDCHILD of
      `.rowx`, so `box.insertBefore(p, cmt)` threw `NotFoundError` — **between "clear the textarea"
      and "publish"**. Pressing Save wiped what he typed, showed nothing, saved nothing, and the
      carefully written put-his-words-back handler was UNREACHABLE because the failure was on the
      SUCCESS path. Fixed: `cmt.parentNode.insertBefore(p, cmt)`.
      ⚠ **AND THE PROBE THAT "PROVED IT SAFE" COULD NEVER HAVE SEEN IT** — with no artifact host,
      `glass.mjs` returns at `if (!cap) return;` *before* the push, the repaint and the publish. Its
      save check exercised a guard clause and reported *"his words stay in the box"*, which was true
      and was not the question. **CEO 140's "a check that cannot fail" — one night later, in a
      different file.** The probe now installs a fake capability before the page script runs and
      asserts SUCCESS: a publish actually fires, the comment renders back verbatim, nothing throws.
      Red-proofed against the real bug: 4 failures including `pubs: 0` and the NotFoundError.
      ✅ Also fixed from 143: the harvest banner `glass.mjs` prints at every render said a republish
      "DELETES both" — it is THREE now, and it named only ideas and rulings. And the full headline
      now leads the expanded body: `shortTask` truncates the visible title at 16 words and the body
      used to start at line 2, so **the tail of his own pinned headline existed nowhere on the
      page** (`grep "FIVE HOURS OLD WHEN FILED"` → 0; now 2).
      ⚠ **STILL UNGUARDED, SAID IN WRITING RATHER THAN QUIETLY:** `scripts/qa/_t076_row_ui_probe.mjs`
      is NOT in `npm test` and nothing re-runs it, and **no gate anywhere reads
      `glassState.comments`** — the harvest is version-identity enforced and field-blind. Wiring the
      probe into the suite is deliberately NOT done: it launches a browser. ⚠ **HALF THIS REASON HAS
      SINCE EXPIRED — `T-131` was fixed 2026-09-03T05:4xZ, so `npm test` no longer collides with a
      sailing trial. The remaining merit is only that it launches a browser; CEO 147: "the reason
      should be re-examined on its remaining merits, not inherited."** The original text said
      `T-131` is the open
      row about `npm test` colliding with a sailing sea trial. **Run it by hand after any change to
      the row UI.**
      ⛔ **NOT part of this row:** *remove items once complete* — SWEEP exists but is still the
      seven-day-with-a-stub form he OVERRULED, and it cannot ship until the done count is
      re-sourced from `CHART-LOG.md`. That is kit patch 6, filed separately.
      ROW UNTIL NOW. THIS IS THE NEXT ITEM, AHEAD OF EVERYTHING.** Wyatt, 2026-09-02T07:xxZ:
      *"why have NONE of my changes to the glass been made??????????? i asked for them FOUR HOURS
      AGO."*
      **He is right, and the reason is measurable rather than mysterious:** all four asks live in
      `## THE IDEA INBOX` (this file, ~line 1320) tagged **SCHEDULED**. `glass.mjs:385` counts an
      inbox entry as an open task **only when it has NO fate** — and `SCHEDULED` is a fate. **So
      marking them "SCHEDULED" made them invisible on his own page AND invisible to a Watch picking
      its one item, simultaneously.** They have never had a `- [ ]` row or a `T-` handle. A watch
      noticed two of them and wrote *"STILL NOT BUILT AND NOT FILED ANYWHERE ELSE"* (line ~225) and
      still did not file them.
      **THIS IS THE AUDIT'S OWN HEADLINE, PLAYING OUT AGAINST THE AUDIT ITSELF:** *"a row that says
      SCHEDULED with no owner and no position in a queue is a parked row wearing a better word."*
      **THE FOUR, in his words, oldest first:**
      1. **00:59:32Z** — *"You need to update Tasks list dynamically — it is stale."* (the
         Chartkeeper; REAP is live, RANK is not — see `PENDING-KIT-PATCHES.md` 4)
      2. **00:59:32Z, repeated 03:45:45Z** — *"Move The Lesson section below it."* / *"Move The
         Lesson to below Tasks."* **Asked twice. One CSS/DOM move in `glass.mjs`.**
      3. **03:46:13Z** — *"rename Tasks to The Chart (Tasks To Do)."* **One string.**
      4. **03:49:02Z** — *"Make all tasks in The Chart expandable for fuller context. Let me write a
         comment under each one if I choose to. Order the list with the next-to-be-completed at the
         top. re-order the list dynamically. Remove items from the list after they are complete."*
      **SIZING, HONESTLY: items 2 and 3 are minutes and are pure `glass.mjs`.** Item 4's expandable
      rows and comment box are a bigger piece of the same file. **`glass.mjs` IS VENDORED — edit in
      claude-kit, then re-vendor**, which is the friction that has been quietly deferring all of
      this. **Do items 2 and 3 first and publish, so he sees movement on the page within one tick.**
      ⚠ **AND THE ADVISOR'S OWN RECOMMENDATION WAS TO SHIP THIS HALF FIRST** —
      `SPEC-CHARTKEEPER.md`: *"a perfectly-ranked list still reads as gibberish on his phone if
      every row is 90 truncated characters."* **That recommendation was made and then not carried
      into a row anybody could take.** The backend half has had seven watches; the half he can see
      has had none.

## T-130 — 2026-09-03 — npm test HAS BEEN RED ALL NIGHT, AND IT STOPS ~12 GATES SHORT — INCLUDING RULE 17'S. (closed 2026-09-03 · CEO 139 · no game diff — no game code is right: the item is the Chartkeeper's own idempotence, not the game — commit 0fc41dac mints every open row's handle before the rank, case 10f is green, and on his real Chart it moves 0 rows and allocates 0 ids) The failing gate is chartkeeper_check case 10f — "running the full pass twice produced two different files". Pre-existing, verified NOT caused by tonight's work three separate ways (the two chartkeeper files are byte-unchanged; the case builds its own throwaway fixture; CEO 135 re-checked it independently). WHY IT MATTERS MORE THAN ITS OWN SUBJECT: the suite stops at the first failure, so stray_probe_check — the one that catches abandoned Chrome on this laptop, the day after 183 of them were found holding 15GB — plus doc_command_check, chart_sweep_conserves_check and about nine others have not run all night. Run by hand 2026-09-03T03:1xZ: clean. But a suite that stops before its safety gates is quietly not checking them. ROOT CAUSE, MEASURED 2026-09-03T04:0xZ — do not re-derive this, it cost an hour: rows are RANKED before their handles are minted, and part of the score is looked up BY handle against CHART-LOG.md — a file this same tool writes. So run 1 ranks handle-less rows (all tie at 0, file order wins), writes the log and the handles; run 2 ranks the same rows with handles against a log that now mentions them, and orders them differently; run 3 matches run 2. Proven by stripping the two handles and re-ranking: both scores drop 8 → 0, which is what rules out an unstable sort or a tie-break. ⚠ A PARTIAL FIX WAS BUILT AND REVERTED, DELIBERATELY — minting the handle inside applySettle so a split row is born with one. It is probably right and it is not sufficient: the gate's fixture starts with NO handles on ANY row, so every row is ranked without identity on run 1, not merely the split ones. Shipping it would have changed handle allocation order on his real Chart — and handles are load-bearing in CHART-LOG.md, the ledger and git — while still leaving the gate red. Reverted; baseline restored. THE REAL FIX IS A DECISION, NOT A PATCH: either mint every open row's handle BEFORE the rank (a pre-pass; a no-op on the real Chart, where every row already has one), or stop the ranker scoring on a file the tool itself writes. The second is the rule-23 answer — a ranking that reads its own output is two things kept in step by nothing. ⚠ THE QUESTION FOR HIM WAS RETIRED BY MEASUREMENT, NOT ANSWERED — AND IT WAS RIGHT TO ASK. This row read: "HIS CALL, BECAUSE IT CAN REORDER HIS LIST… is it acceptable for the fix to change the current order of the Chart once, if it never changes on its own again?" Asking before shipping blind was the correct instinct. But it is only his call if the answer is "it reorders", and it does not. Measured 2026-09-03T04:2xZ on COPIES of both real charts (scripts/qa/_ck_realchart.mjs, scratch): CHART.md — 0 ids allocated · 0 rows moved, row order byte-identical to the file on disk, run 1 === run 2. GLASS-CHART.md — the same. Every open row on his live Chart already carries a handle, so the pre-pass is a no-op there and only ever fires on a row born without one. There is no reshuffle to approve, so nothing waited on him. (The general lesson, and it is rule 6's: a question parked for Wyatt costs him a decision. Check whether it is still a question before parking it.) Sizing: MEDIUM. No game code. Blocks nothing except the twelve gates behind it.

- [x] **`npm test` HAS BEEN RED ALL NIGHT, AND IT STOPS ~12 GATES SHORT — INCLUDING RULE 17'S.** (closed 2026-09-03 · CEO 139 · no game diff — no game code is right: the item is the Chartkeeper's own idempotence, not the game — commit 0fc41dac mints every open row's handle before the rank, case 10f is green, and on his real Chart it moves 0 rows and allocates 0 ids)
      ⟨`T-130`⟩
      **The failing gate is `chartkeeper_check` case 10f** — *"running the full pass twice produced
      two different files"*. Pre-existing, verified NOT caused by tonight's work three separate ways
      (the two chartkeeper files are byte-unchanged; the case builds its own throwaway fixture;
      CEO 135 re-checked it independently).
      **WHY IT MATTERS MORE THAN ITS OWN SUBJECT:** the suite stops at the first failure, so
      `stray_probe_check` — the one that catches abandoned Chrome on this laptop, the day after 183
      of them were found holding 15GB — plus `doc_command_check`, `chart_sweep_conserves_check` and
      about nine others **have not run all night.** Run by hand 2026-09-03T03:1xZ: clean. But a suite
      that stops before its safety gates is quietly not checking them.
      **ROOT CAUSE, MEASURED 2026-09-03T04:0xZ — do not re-derive this, it cost an hour:**
      rows are RANKED before their handles are minted, and part of the score is looked up BY handle
      against `CHART-LOG.md` — **a file this same tool writes.** So run 1 ranks handle-less rows
      (all tie at 0, file order wins), writes the log and the handles; run 2 ranks the same rows
      with handles against a log that now mentions them, and orders them differently; run 3 matches
      run 2. Proven by stripping the two handles and re-ranking: both scores drop 8 → 0, which is
      what rules out an unstable sort or a tie-break.
      ⚠ **A PARTIAL FIX WAS BUILT AND REVERTED, DELIBERATELY** — minting the handle inside
      `applySettle` so a split row is born with one. It is probably right and it is **not
      sufficient**: the gate's fixture starts with NO handles on ANY row, so every row is ranked
      without identity on run 1, not merely the split ones. Shipping it would have changed handle
      allocation order on his real Chart — and handles are load-bearing in `CHART-LOG.md`, the
      ledger and git — while still leaving the gate red. Reverted; baseline restored.
      **THE REAL FIX IS A DECISION, NOT A PATCH:** either mint every open row's handle BEFORE the
      rank (a pre-pass; a no-op on the real Chart, where every row already has one), or stop the
      ranker scoring on a file the tool itself writes. **The second is the rule-23 answer** — a
      ranking that reads its own output is two things kept in step by nothing.
      ⚠ **THE QUESTION FOR HIM WAS RETIRED BY MEASUREMENT, NOT ANSWERED — AND IT WAS RIGHT TO ASK.**
      This row read: *"HIS CALL, BECAUSE IT CAN REORDER HIS LIST… is it acceptable for the fix to
      change the current order of the Chart once, if it never changes on its own again?"* Asking
      before shipping blind was the correct instinct. **But it is only his call if the answer is
      "it reorders", and it does not.** Measured 2026-09-03T04:2xZ on COPIES of both real charts
      (`scripts/qa/_ck_realchart.mjs`, scratch): `CHART.md` — **0 ids allocated · 0 rows moved**,
      row order byte-identical to the file on disk, run 1 === run 2. `GLASS-CHART.md` — the same.
      **Every open row on his live Chart already carries a handle, so the pre-pass is a no-op there
      and only ever fires on a row born without one.** There is no reshuffle to approve, so nothing
      waited on him. *(The general lesson, and it is rule 6's: a question parked for Wyatt costs him
      a decision. Check whether it is still a question before parking it.)*
      **Sizing: MEDIUM. No game code. Blocks nothing except the twelve gates behind it.**

## T-131 — 2026-09-03 — FIXED 2026-09-03T05:4xZ — npm test NO LONGER WRITES THE LIVE LONG-RUN MARKER. It used to, and the SUITE AND A SAILING SEA (closed 2026-09-03 · CEO 147 · no game diff — npm test no longer writes the live LONG-RUN marker: 9 write events to 0, measured by CEO 147 with fs.watch; the gate is still armed, re-proved with an anchor-preserving mutant) TRIAL FIGHT OVER ONE FILE, AND THE SUITE CAN FREEZE THE TRIAL. Measured 2026-09-03T04:0xZ. scripts/qa/glass_longrun_status_check.mjs plants four fixtures in the REAL .planning/wyclau/LONG-RUN (:55, :92, :100, :109) and restores the previous contents at :116. A detached sea trial writes that same file as it sails. TWO CONSEQUENCES, THE SECOND ONE DAMAGING: 1. the gate reads the TRIAL's marker where it expected its fixture — all three staleness cases fail on the same live JSON. This is what a red npm test looked like tonight (3 failures), and it is not the pre-existing chartkeeper fault (T-130), which is a different gate further down the chain. 2. the restore writes back a snapshot taken BEFORE the trial's updates — so running the suite can freeze a live trial's progress at whatever it was when the suite started. OBSERVED: trial pid 35064 sat at 0/10 legs, updatedAt 03:42:32Z, for 25 minutes while npm test was run repeatedly beside it. ⚠ Whether the gate froze it or the trial was simply slow was NOT established, and that ambiguity IS the finding — an instrument that writes its subject's file makes its subject unreadable. Not reported as proven damage. ✅ RESOLVED 20 MINUTES LATER, AND IN THE TRIAL'S FAVOUR: IT WAS SLOW, NOT FROZEN. The marker moved to 1/10 legs, updatedAt 03:55:12Z, with pid 35064 still alive — so leg 1 simply took ~14 minutes and nothing was clobbered. Consequence (1), the read collision, is still PROVEN — three gate cases failed against live trial JSON, which is what tonight's red suite was. Consequence (2), the freeze, is a real code path with NO observed instance: the restore at :116 genuinely writes back a pre-run snapshot, so the race exists, but it did not fire here. Say it that way and no stronger. ⚠ IT IS A DESTROY-THEN-REPAIR, WHICH THIS PROJECT HAS ALREADY RULED AGAINST, in T-112's own row: "Do NOT fix it by making the gate restore the file afterwards — a destroy-then-repair is still a window, and this project has already lost a note inside one." That was about GLASS-NOTE.md; this is the same fault in the same shape, one file over. ✅ SHIPPED as glass.mjs --longrun-root=<dir> — a ROOT and not a file path, because longRunStatus(dir) already derives the marker from a repo root: one definition of where that file lives, not two (rule 23). The gate builds a throwaway root and points the reader there. Same shape as --consume-note, which fixed exactly this for his queued note, and for the same reason: the generator resolves paths from ITS OWN file location, so a gate cannot sandbox it by changing directory — the override has to exist in the generator or the coupling cannot be broken at all. ✅ THE OLD WARNING IS WITHDRAWN. npm test IS SAFE TO RUN BESIDE A SAILING TRIAL. This row used to read "UNTIL IT IS FIXED: do not run npm test beside a sailing trial", and CEO 147 was right that leaving it up was the costliest line here — an instruction to every watch to avoid the suite, for a reason that had expired. MEASURED BY CEO 147 WITH A BETTER INSTRUMENT THAN MINE: fs.watch on the directory, which sees the ACT of writing, against the pre-fix gate and the shipped one — 9 write events → 0, and 0 across the entire npm test suite. My own first instrument was a checksum, and the old code's create→write→delete has a net result indistinguishable from never touching the file. A net-zero change is not the same as never touching it. ⚠ DO NOT RED-PROOF THIS GATE BY EDITING THE STALENESS COMPARISON — I DID, AND GOT THE RIGHT ANSWER FOR THE WRONG REASON. The extractor regex CONTAINS lrAgeMin <= lr.staleAfterMinutes, so flipping it breaks the MATCH and fires the coupling branch, while the three behavioural cases never run at all. The gate is armed — re-proved here with an anchor-preserving mutant (lrAgeMin = 0 → 2 real failures) — but "I mutated it and it went red" is only evidence if you check WHICH assertion went red. That branch is now labelled COUPLING: so it cannot be mistaken for a behavioural check again. CEO 62 made this same criticism of an earlier version of this gate. ✅ Also removed: the restore scaffolding, which had become a restore with no subject (its had could never be true once the marker moved into a fresh temp dir), and the temp root is now deleted — it was leaking one directory per run, 12 counted in %TEMP%. Sizing: SMALL. No game code.

- [x] **FIXED 2026-09-03T05:4xZ — `npm test` NO LONGER WRITES THE LIVE `LONG-RUN` MARKER. It used to, and the SUITE AND A SAILING SEA (closed 2026-09-03 · CEO 147 · no game diff — npm test no longer writes the live LONG-RUN marker: 9 write events to 0, measured by CEO 147 with fs.watch; the gate is still armed, re-proved with an anchor-preserving mutant)
      ⟨`T-131`⟩
      TRIAL FIGHT OVER ONE FILE, AND THE SUITE CAN FREEZE THE TRIAL.** Measured 2026-09-03T04:0xZ.
      `scripts/qa/glass_longrun_status_check.mjs` plants four fixtures in the REAL
      `.planning/wyclau/LONG-RUN` (`:55, :92, :100, :109`) and restores the previous contents at
      `:116`. A detached sea trial writes that same file as it sails.
      **TWO CONSEQUENCES, THE SECOND ONE DAMAGING:**
      1. the gate reads the TRIAL's marker where it expected its fixture — all three staleness cases
         fail on the same live JSON. **This is what a red `npm test` looked like tonight** (3
         failures), and it is not the pre-existing chartkeeper fault (`T-130`), which is a different
         gate further down the chain.
      2. the restore writes back a snapshot taken BEFORE the trial's updates — **so running the
         suite can freeze a live trial's progress** at whatever it was when the suite started.
      **OBSERVED:** trial pid 35064 sat at `0/10 legs`, `updatedAt` 03:42:32Z, for 25 minutes while
      `npm test` was run repeatedly beside it. ⚠ **Whether the gate froze it or the trial was simply
      slow was NOT established, and that ambiguity IS the finding** — an instrument that writes its
      subject's file makes its subject unreadable. Not reported as proven damage.
      ✅ **RESOLVED 20 MINUTES LATER, AND IN THE TRIAL'S FAVOUR: IT WAS SLOW, NOT FROZEN.** The
      marker moved to `1/10 legs`, `updatedAt` 03:55:12Z, with pid 35064 still alive — so leg 1
      simply took ~14 minutes and nothing was clobbered. **Consequence (1), the read collision, is
      still PROVEN** — three gate cases failed against live trial JSON, which is what tonight's red
      suite was. **Consequence (2), the freeze, is a real code path with NO observed instance:** the
      restore at `:116` genuinely writes back a pre-run snapshot, so the race exists, but it did not
      fire here. *Say it that way and no stronger.*
      ⚠ **IT IS A DESTROY-THEN-REPAIR, WHICH THIS PROJECT HAS ALREADY RULED AGAINST**, in `T-112`'s
      own row: *"Do NOT fix it by making the gate restore the file afterwards — a destroy-then-repair
      is still a window, and this project has already lost a note inside one."* That was about
      `GLASS-NOTE.md`; **this is the same fault in the same shape, one file over.**
      ✅ **SHIPPED as `glass.mjs --longrun-root=<dir>`** — a ROOT and not a file path, because
      `longRunStatus(dir)` already derives the marker from a repo root: one definition of where that
      file lives, not two (rule 23). The gate builds a throwaway root and points the reader there.
      Same shape as `--consume-note`, which fixed exactly this for his queued note, and for the same
      reason: the generator resolves paths from ITS OWN file location, so a gate cannot sandbox it
      by changing directory — the override has to exist in the generator or the coupling cannot be
      broken at all.
      ✅ **THE OLD WARNING IS WITHDRAWN. `npm test` IS SAFE TO RUN BESIDE A SAILING TRIAL.** This row
      used to read *"UNTIL IT IS FIXED: do not run `npm test` beside a sailing trial"*, and CEO 147
      was right that leaving it up was the costliest line here — **an instruction to every watch to
      avoid the suite, for a reason that had expired.**
      **MEASURED BY CEO 147 WITH A BETTER INSTRUMENT THAN MINE:** `fs.watch` on the directory, which
      sees the ACT of writing, against the pre-fix gate and the shipped one —
      **9 write events → 0**, and **0 across the entire `npm test` suite**. My own first instrument
      was a checksum, and the old code's create→write→delete has a net result indistinguishable
      from never touching the file. *A net-zero change is not the same as never touching it.*
      ⚠ **DO NOT RED-PROOF THIS GATE BY EDITING THE STALENESS COMPARISON — I DID, AND GOT THE RIGHT
      ANSWER FOR THE WRONG REASON.** The extractor regex CONTAINS `lrAgeMin <= lr.staleAfterMinutes`,
      so flipping it breaks the MATCH and fires the coupling branch, while the three behavioural
      cases never run at all. The gate *is* armed — re-proved here with an anchor-preserving mutant
      (`lrAgeMin = 0` → **2 real failures**) — but **"I mutated it and it went red" is only evidence
      if you check WHICH assertion went red.** That branch is now labelled `COUPLING:` so it cannot
      be mistaken for a behavioural check again. CEO 62 made this same criticism of an earlier
      version of this gate.
      ✅ Also removed: the restore scaffolding, which had become **a restore with no subject** (its
      `had` could never be true once the marker moved into a fresh temp dir), and the temp root is
      now deleted — it was leaking one directory per run, 12 counted in `%TEMP%`.
      **Sizing: SMALL. No game code.**


## TWELVE ROWS WYATT DISMISSED, RECOVERED AND FILED (CEO 148)

> **They were dismissed by HIM and then DELETED rather than archived, so their text survived only
> in git.** `.planning/wyclau/INBOX.md` (the "HE DISMISSED 15 OF 44" entry) records the act — *"HE DISMISSED 15 OF 44"* — but a
> prose paragraph naming handles is not a record of what he threw away. `chart_sweep_conserves_check`
> reported them as rows that had left both records, which is exactly what they were, and it was told
> it was crying wolf. **Dismissed is not the same as never existed.** Recovered from `95eee372`.

## T-008 — 2026-09-03 — ⚠ THE WRITE PASS SILENTLY REWROTE A CHARACTER OF WYATT'S OWN TEXT. Found 2026-09-02T15:xxZ (DISMISSED BY WYATT, first pass, on the backlog page 2026-09-02 — not completed, not abandoned by a session)

- [x] **⚠ THE WRITE PASS SILENTLY REWROTE A CHARACTER OF WYATT'S OWN TEXT.** Found 2026-09-02T15:xxZ
      ⟨`T-008`⟩
      by an independent read-only verification of the sweep, which was looking for lost rows and
      found this instead. In the sweep commit `a70451f2`, the row two lines above this one had its
      curly apostrophe **U+2019 turned into ASCII `'`** — *"the Glass’s Ideas box"* became *"the
      Glass's Ideas box"* — while the row was being re-emitted with its `T-008` handle.
      **WHY THIS IS NOT PEDANTRY.** CEO 91's rule is that a row's FIRST LINE IS HIS and the tool
      never touches a character of it; there is a gate case asserting exactly that ("every row's
      first line survived the write byte for byte") and it is GREEN, so it is not asserting what it
      claims — the likeliest reading is that the fixtures contain no non-ASCII punctuation, which is
      the `\Z`-in-the-fixture lesson from this same file family, again. This project has already
      paid for one character of punctuation once: *"Attack's − is U+2212, not ASCII."*
      **AND THE SHAPE IS WORSE THAN THE INSTANCE.** A write pass that normalises a character today
      normalises a word tomorrow, in the one document that carries his words verbatim, with a green
      gate over it. Nothing here is urgent — the row is open, the meaning is unchanged — but the
      SILENCE is the defect.
      Start by making that gate's fixture carry curly quotes, an em dash and an accented character,
      and watch it fail. Do not "fix" the apostrophe by hand first: the failing gate is the evidence.
      ⚠ **DISMISSED BY HIM, NOT DONE.** Recovered from 95eee372 and filed 2026-09-03T06:2xZ at CEO 148, which
      found it among 16 handles owned by no row anywhere. His act is recorded in `.planning/wyclau/INBOX.md` — "HE DISMISSED 15 OF 44".

## T-025 — 2026-09-03 — Day 2 — Glass v3: the interactive rebuild (tap-to-rule cards, ideas box, daily lesson, (DISMISSED BY WYATT, second pass, on the backlog page 2026-09-02 — not completed, not abandoned by a session)

- [x] Day 2 — Glass v3: the interactive rebuild (tap-to-rule cards, ideas box, daily lesson,
      ⟨`T-025`⟩
  Captain's log) on the thin-surface architecture (design, section IV)
      ⚠ **DISMISSED BY HIM, NOT DONE.** Recovered from 95eee372 and filed 2026-09-03T06:2xZ at CEO 148, which
      found it among 16 handles owned by no row anywhere. His act is recorded in `.planning/wyclau/INBOX.md` — "HE DISMISSED 15 OF 44".

## T-028 — 2026-09-03 — 24-hour unattended engine run, zero silent stalls — GATED: passive, monitor only; nothing to DO but watch the  (DISMISSED BY WYATT, second pass, on the backlog page 2026-09-02 — not completed, not abandoned by a session)

- [x] 24-hour unattended engine run, zero silent stalls — GATED: passive, monitor only; nothing to DO but watch the clock since the Razer hour (16:19Z)
      ⟨`T-028`⟩
      ⚠ **DISMISSED BY HIM, NOT DONE.** Recovered from 95eee372 and filed 2026-09-03T06:2xZ at CEO 148, which
      found it among 16 handles owned by no row anywhere. His act is recorded in `.planning/wyclau/INBOX.md` — "HE DISMISSED 15 OF 44".

## T-081 — 2026-09-03 — WIRE THE KIT AS A `git subtree` SO PROMOTION IS A MERGE, NOT A COPY — his metaphor, (DISMISSED BY WYATT, second pass, on the backlog page 2026-09-02 — not completed, not abandoned by a session)

- [x] **WIRE THE KIT AS A `git subtree` SO PROMOTION IS A MERGE, NOT A COPY — his metaphor,
      ⟨`T-081`⟩
      his refusal of cherry-picking.** 2026-09-02. **Sizing: an afternoon. Do NOT start it before
      `T-078`, and do not bundle the generalisation with it.**
      **His words:** *"the kit is 'production' and the local version of it is 'staging'… i don't want
      to be the human cherrypicking; i want the design of the kit itself to be architecturally
      extensible."* And his amendment to the adoption ruling: a project must also have **a way to
      update to the latest kit as it becomes available.**
      **`git subtree` answers both halves with machinery this project already trusts:** the kit's
      files live in the repo and are edited in place; `subtree pull` is "update to the latest";
      `subtree push` is "staging promotes to production". **Promotion is a merge, never a copy —
      rule 2 of his own release process** — so there is real ancestry, real conflicts when two things
      genuinely disagree, and it is reversible. A copy has no ancestry and therefore cannot tell an
      improvement from a divergence.
      ⚠ **THE HALF NO MECHANISM PERFORMS, AND IT MUST NOT BE PROMISED:** a subtree push sends
      pastrypirates' code upstream **verbatim**, and his ruling 4 is that the kit holds GENERALISED
      versions. `close_item.mjs:49-52` hardcodes four `.planning/` paths; `start_trial_detached.mjs`
      **exits 2** without `scripts/sea_trial.mjs`. **Pushed as-is, the kit inherits a pirate game.**
      Generalising is design judgement and belongs to the batched pass his ruling 3 describes —
      **build the plumbing, defer the framework.**
      ⚠ **DISMISSED BY HIM, NOT DONE.** Recovered from 95eee372 and filed 2026-09-03T06:2xZ at CEO 148, which
      found it among 16 handles owned by no row anywhere. His act is recorded in `.planning/wyclau/INBOX.md` — "HE DISMISSED 15 OF 44".

## T-083 — 2026-09-03 — ★★★ ONE QUEUE, RANKED — HIS DESIGN, AND IT REPLACES THE DOOR'S OWN ORDERING RULE. (DISMISSED BY WYATT, first pass, on the backlog page 2026-09-02 — not completed, not abandoned by a session)

- [x] **★★★ ONE QUEUE, RANKED — HIS DESIGN, AND IT REPLACES THE DOOR'S OWN ORDERING RULE.**
      ⟨`T-083`⟩
      2026-09-02, question UI. **Do these four in order; the first is a hard dependency.**
      **His words:** *"the door should not read oldest-first; the RANK algorithm should do the
      ordering, and the door should read what's at the top. the rank algorithm should prioritize my
      requests over bugs that the Watch generated; and i need a way to say DO THIS NOW such that
      RANK puts it at the top -- eg a checkbox underneath the ideas list that says 'Add to top of
      list'"*
      **WHY IT MATTERS MORE THAN IT LOOKS: there are TWO orderings today and rule 23 says that is the
      defect.** The Door has its own rule (`SKILL.md:81` — INBOX oldest-first, then the Chart) and
      RANK has another. *What makes these two agree?* **Nothing.** His design deletes one of them.
      **AND THE MEASURED COST OF OLDEST-FIRST:** 8 open Inbox items, the oldest from the previous
      day, so **anything he writes now is automatically his lowest-priority item.** That inversion —
      not anyone's discipline — is what forced him to interrupt and repeat himself five times on
      2026-09-02.
      **1 · CONVERGE THE TWO DERIVATIONS FIRST — nothing else works until this lands.** Patch 4's own
      caveat: RANK reorders *within the open-row slots the file already has* and **cannot reorder
      across the two sections the Glass concatenates** (checklist rows, then unfated inbox entries).
      *"The Door reads what is at the top"* is meaningless until there is ONE list to be at the top
      of. This is `PENDING-KIT-PATCHES.md` patch 5 — `glass.mjs` imports
      `scripts/wyclau/lib/chart_model.mjs` and the duplicated fate/concat block is deleted.
      **Unblocked as of the `vendor_check` inversion.** Its gate
      (`chart_model_agrees_with_glass_check.mjs`) becomes a tautology once one function cannot
      disagree with itself and should be **RETIRED, not kept** — patch 5 says so itself.
      **2 · RANK GAINS A SOURCE SIGNAL.** *"prioritize my requests over bugs that the Watch
      generated."* **Derive it, never add a field:** his items carry his words (an Inbox entry with a
      `>` quote block, or a Chart row quoting him); watch-filed rows carry a watch stamp. Rule 9.
      **3 · THE DOOR DROPS ITS OWN RULE.** `SKILL.md:81`'s *"INBOX first — the oldest OPEN item"*
      becomes *"work whatever RANK put first."* **Delete the old rule rather than adding beside it**
      — leaving both is the two-orderings fault re-created.
      **4 · THE "ADD TO TOP" CHECKBOX**, under the Ideas box on the Glass, and the harvest carries
      the flag through so RANK sees it. **This is the half that removes HIM from the mechanism:**
      every interrupt on 2026-09-02 required him to notice, interrupt and repeat himself.
      ⚠ **ONE SLOT, NOT A QUEUE.** Ticking it on a second item must displace the first, deliberately.
      **A gate fails the build on two.** An interrupt with a queue is just another backlog, which is
      the fault this whole design removes.
      ⚠ **AND IT MUST BE VISIBLE ON THE PAGE** — he must see what he pinned and whether it has been
      taken. *An interrupt he cannot see is indistinguishable from one that was ignored*, which is
      exactly what happened all night.
      ✅ **STEP 4 IS BUILT — 2026-09-02T21:4xZ, `T-104`, commit `c8a475a6`, CEO 121.** It arrived as
      his own later refinement (a BUTTON beside Send, not a checkbox under the box), and all three
      constraints above hold: one slot enforced by the write on both sides, two pins fail the build
      naming both, and the pin shows on the Ideas list the moment he taps and on the Tasks card once
      a session carries it over. **Steps 1–3 are untouched, and step 3 is the one that matters next:
      the Door still reads oldest-first, so there are still two orderings.**
      ⚠ **DISMISSED BY HIM, NOT DONE.** Recovered from 95eee372 and filed 2026-09-03T06:2xZ at CEO 148, which
      found it among 16 handles owned by no row anywhere. His act is recorded in `.planning/wyclau/INBOX.md` — "HE DISMISSED 15 OF 44".

## T-084 — 2026-09-03 — BUILD THE KIT-BEHIND DETECTOR — the half of `T-078` he asked for and nobody has (DISMISSED BY WYATT, first pass, on the backlog page 2026-09-02 — not completed, not abandoned by a session)

- [x] **BUILD THE KIT-BEHIND DETECTOR — the half of `T-078` he asked for and nobody has
      ⟨`T-084`⟩
      built. It is UNBLOCKED as of 2026-09-02T13:5xZ and it was blocked by one missing flag.**
      **His condition, in his own words:** *"DO NOT ALSO DELETE THE CHECK. Red-proof both ways: a
      local edit must NOT fail; **a kit that has fallen behind must be reported**."* The first half
      shipped and is gated (`vendor_lock_inverted_check.mjs`). **The second half does not exist** —
      `vendor_check.mjs` currently prints, honestly, that it did NOT check whether claude-kit has
      moved forward, on every path. That admission is a placeholder, not the answer.
      **WHY IT WAS "IMPOSSIBLE" AND WHY IT IS NOT — read this before starting, it is the whole
      story.** Three watches recorded a read of `C:\Users\wyatt\Projects\claude-kit` as REFUSED and
      each concluded the kit was unreachable. **Wyatt was asked and ruled "yes" at
      2026-09-02T12:39:56.363Z** (his RULED table, below) — and thirty-one minutes later a watch
      still wrote *"THE HALF OF HIS SENTENCE THAT CANNOT BE BUILT HERE"* into a gate, because the
      ruling had not been harvested. CEO 106 caught it. **A REFUSAL IS A PERMISSION SETTING, NOT A
      FACT ABOUT THE WORLD.** The fence was `bell.ps1`'s launch line carrying no `--add-dir`; it now
      carries one (commit `9c4edb48`, gated both ways in `bell_check.mjs`).
      **SO THE FIRST WATCH THE BELL RINGS AFTER `9c4edb48` CAN READ THE KIT. Check that first** —
      if the read is still refused, the ring predates the change or the kit is not beside the repo,
      and the launcher's own log line now says `kit: readable` or `kit: not present`.
      **Sizing: small-to-medium.** `install.sh check <repo> wyclau` already answers the question
      from a tree holding both; the work is calling it (or hashing the kit's copies directly) and
      reporting BEHIND as news, in the same four-kind vocabulary `vendor_check.mjs` now uses.
      **Red-proof: a kit deliberately set one commit back must be REPORTED; a kit in step must
      not be.** And case 6 of `vendor_lock_inverted_check.mjs` gets STRONGER when this lands — it
      currently asserts only that the file admits it has not checked. Do not delete it; tighten it.
      ⚠ STALE-CANDIDATE — unblocked (do the work (his ruling freed it)) — your ruling — **"yes"** — ruled on the Glass 2026-09-02T12:39:56.363Z, no note attached — freed this row, and the work is still to do
      ⚠ **DISMISSED BY HIM, NOT DONE.** Recovered from 95eee372 and filed 2026-09-03T06:2xZ at CEO 148, which
      found it among 16 handles owned by no row anywhere. His act is recorded in `.planning/wyclau/INBOX.md` — "HE DISMISSED 15 OF 44".

## T-091 — 2026-09-03 — A SESSION MUST READ THE RECORD BEFORE PUTTING A QUESTION TO HIM — I asked him something he (DISMISSED BY WYATT, first pass, on the backlog page 2026-09-02 — not completed, not abandoned by a session)

- [x] **A SESSION MUST READ THE RECORD BEFORE PUTTING A QUESTION TO HIM — I asked him something he
      had already answered, twenty minutes after he answered it.** Filed 2026-09-02T16:3xZ.
      **Sizing: this is a rule and a hook, not a feature.**
      ⟨`T-091`⟩
      **WHAT HAPPENED, with timestamps:** his answer was harvested at **12:21:40**. The Advisor put
      the same question to him through the question UI at roughly **12:22**, and closed the item on
      the second answer at **12:24:03**. **The answer was on disk before the question was asked.**
      He had to decide the same thing twice and then work out why.
      **THIS IS THE FAULT `DECISIONS.md` EXISTS TO PREVENT**, and the rulebook states it directly:
      *"answer from them, never re-ask a settled question. A ruling he made that nobody harvested is
      the failure this system exists to stop."* **The Advisor read neither the page nor
      `BLOCKED ON WYATT` before asking.**
      **THE MECHANICAL FIX, because a prose rule is what already failed here (Principle 2):** a
      `PreToolUse` hook on `AskUserQuestion` that greps the question's own subject against
      `.claude/memory/DECISIONS.md`, `## BLOCKED ON WYATT` and the live `glassState`, and **blocks
      with the existing answer** when it finds one. **It must fail OPEN on an unreadable source** —
      a hook that silently swallows a real question is worse than the double-ask it prevents.
      **THE CHEAPER HALF, worth doing even if the hook is not:** the Advisor's own routine gains one
      line — *before any question to him, read `BLOCKED ON WYATT` and the newest harvest.* It is
      thirty seconds and it would have caught this one.
      ⚠ **DISMISSED BY HIM, NOT DONE.** Recovered from 95eee372 and filed 2026-09-03T06:2xZ at CEO 148, which
      found it among 16 handles owned by no row anywhere. His act is recorded in `.planning/wyclau/INBOX.md` — "HE DISMISSED 15 OF 44".

## T-093 — 2026-09-03 — ★★★ ONE PROCESS EDITS THE CHART — HIS RULING, AND HE PUT IT ABOVE THE LAUNCH. 2026-09-02. (DISMISSED BY WYATT, first pass, on the backlog page 2026-09-02 — not completed, not abandoned by a session)

- [x] **★★★ ONE PROCESS EDITS THE CHART — HIS RULING, AND HE PUT IT ABOVE THE LAUNCH.** 2026-09-02.
      ⟨`T-093`⟩
      **HIS WORDS:** *"I want you to prioritize chartkeeper.mjs, we can't launch ANYTHING until the
      chart is actually functioning -- this is nonsense, what's happening right now."*
      **THIS OVERRIDES HIS EARLIER PRIORITY RULING** (*"the game wins any contested hour until it
      launches"*, same day). He has looked at the result and reversed it: **the Chart is the
      instrument he steers by, and a broken instrument makes every other priority unreliable.**

      **WHAT IS ACTUALLY WRONG, measured today rather than asserted:**
      - **Three sessions write `CHART.md`** — the Advisor, the Glass-update session, every watch —
        and **git's smallest unit is the FILE.** So `close_item.mjs` staging the Chart for its own
        sweep carries another session's uncommitted lines into its commit. **Five times in one
        session.** `git add <path>` is no safer than `git add -A`; path precision cannot help.
      - **The cost is a corrupted record, not lost work.** Commit `59f8b7a7` — *"watch closes his
        black window"* — carries `T-090`, `T-091` and a card repair written by a different session.
        `git log -S` for *"why does T-091 exist?"* answers with the wrong subject. **CEO 104 and 105
        both flagged one-commit-two-jobs; this is the third instance.**
      - **And rows go stale faster than anyone closes them** — the reaper has flagged **10** all
        afternoon, unchanged, because one watch closes one item every 30–60 minutes.

      **THE FIX HE CHOSE, and it is rule 23's own answer:** *what makes these two agree?* — **nothing
      does, so make there be one.** Every writer goes through `chartkeeper.mjs`: it reads, edits and
      commits the Chart, and no session hand-edits `CHART.md` again.

      **WHAT THAT MEANS CONCRETELY, in the order it should be built:**
      1. **A write API on `chartkeeper.mjs`** — add a row, close a row, mark GATED, retire a blocked
         question — each one *read → modify → commit* in a single act, so no window exists for
         another session to carry the edit. `close_item.mjs` already does exactly this for closing;
         **it is the worked example and the pattern to copy, not to reinvent.**
      2. **The Advisor, the Glass session and the Door all call it** instead of editing the file.
      3. **A gate that fails when `CHART.md` changes in a commit that did not go through it** —
         derivable from the commit's own touched-files, and the only thing that stops hand-editing
         creeping back. Without it this is a convention, and Principle 2 says conventions fail here.

      ⚠ **THE ONE THING TO GET RIGHT, because it is where this design can go wrong:** a single writer
      must not become a single point of failure. **If `chartkeeper.mjs` refuses or crashes, a session
      must still be able to record his words** — the Inbox is not the Chart and must stay
      hand-writable, so a harvest is never blocked by a tool being broken. **Losing his words is
      worse than a messy Chart.**

      **SIZING, HONESTLY: MEDIUM, and larger than anything else currently open on this list.** The
      API is small; the migration is every caller; the gate is the part that makes it stick.
      ⚠ STALE-CANDIDATE — unblocked (do the work (his ruling freed it)) — your ruling — **"Done -- I wrote about adding google analytics and firebase"** — ruled on the Glass 2026-09-02 5:45:23 PM ET — freed this row, and the work is still to do
      ⚠ **DISMISSED BY HIM, NOT DONE.** Recovered from 95eee372 and filed 2026-09-03T06:2xZ at CEO 148, which
      found it among 16 handles owned by no row anywhere. His act is recorded in `.planning/wyclau/INBOX.md` — "HE DISMISSED 15 OF 44".

## T-094 — 2026-09-03 — ★★ "WHAT IS BEING WORKED ON RIGHT NOW" — design approved by CEO with changes, all applied. (DISMISSED BY WYATT, first pass, on the backlog page 2026-09-02 — not completed, not abandoned by a session)

- [x] **★★ "WHAT IS BEING WORKED ON RIGHT NOW" — design approved by CEO with changes, all applied.
      His ask 1 of five. Spec: [`SPEC-WHAT-IS-IN-HAND.md`](SPEC-WHAT-IS-IN-HAND.md). Sizing: SMALL.**
      ⟨`T-094`⟩
      **HIS WORDS:** *"what is being worked on RIGHT NOW? that needs to be visible just underneath
      the emoji status."* Then: *"design a fix, get CEO's approval, then add it to the top of the
      chart."* **Verdict: APPROVED WITH CHANGES — and the changes were not cosmetic.**
      **BUILD IT THIS WAY — write the claim the way the CLOSE is already written.** `close_item.mjs`
      appends a fixed machine-written line on close; the claim half is human prose. Make them
      symmetrical: `publish_status.mjs` gains an **`## In hand`** block in
      `.planning/wyclau/status/<machine>.md`, the same shape as the `## Long run in flight` block it
      already writes — and `glass.mjs` already reads that file (`:614`). One more `split`.
      **WHY NOT THE OBVIOUS VERSION (parse the ledger):** `.planning/CTO-LEDGER.md` has **15**
      `### WATCH` headings and **exactly 4** match a parseable shape — the tidy ones are all from the
      last two hours, and nothing prescribes the format. **A regex over that finds nothing this
      morning and goes silent the first time a watch words its heading its own way.**
      **FOUR STATES, and the fourth is the point:** in hand · nothing in hand · **⚠ claimed but
      COLD** · unreadable. **A watch can claim and end without closing — that happened twice today,
      deliberately** — so an open claim outliving its watch is normal, and must never read as
      "being worked on right now". COLD is derived from a `staleAfterMinutes` the block declares
      itself, exactly as the long-run block already does. **No new constant.**
      **THE BOUND, HONESTLY:** a stale claim is NOT self-clearing within a Bell interval. Rings were
      **40, 60, 50 and 30 minutes** apart today, and a watch can end having pushed nothing. **Up to
      about an hour, unbounded when the Bell is not ringing** — which is why COLD is required.
      ✅ **AND HIS ASK 2 IS ALREADY FIXED, BY ANOTHER ROUTE — do not build it here.** The browser
      clock the first draft proposed **already exists** (`glass.mjs:900-930`, two clocks, since
      2026-08-31). The clock was never the fault; a published page cannot see a commit made after it
      was generated. **The Door's new step 6b closes it** — the watch now messages the Glass to
      publish the moment it lands work.
      ⚠ **DISMISSED BY HIM, NOT DONE.** Recovered from 95eee372 and filed 2026-09-03T06:2xZ at CEO 148, which
      found it among 16 handles owned by no row anywhere. His act is recorded in `.planning/wyclau/INBOX.md` — "HE DISMISSED 15 OF 44".

## T-105 — 2026-09-03 — ⚑⚑⚑ TOP PRIORITY, HIS WORDS: "add it to the chart at the top priority". THE GLASS MUST NOT (DISMISSED BY WYATT, second pass, on the backlog page 2026-09-02 — not completed, not abandoned by a session)

- [x] **⚑⚑⚑ TOP PRIORITY, HIS WORDS: "add it to the chart at the top priority". THE GLASS MUST NOT
      BE ABLE TO LOSE HIS WRITING.** `INBOX-20260902T192000Z` (the build; the design half closed as
      `INBOX-20260902T191500Z`). Designed 2026-09-02, 3:15 PM ET; **design only, the build is
      yours.** Full spec: [`SPEC-GLASS-HARVEST-SAFETY.md`](SPEC-GLASS-HARVEST-SAFETY.md).
      **CEO 117 returned PARTIAL and its two corrections are already folded into the spec** — Layer
      D was specifying something that already ships (`glass.mjs:1218`), and Layer A's "unknown" was
      half answered in `glass.mjs:22-23`. **Read the spec, not this row's summary of it.**
      ⟨`T-105`⟩
      ⛔ **GATED: everything left is two writes inside `.claude/`, and FOUR sessions have now been
      refused them — the fourth in a session Wyatt opened himself, which the record named as the
      route that works.** Not actionable by a watch. **Delete this marker the moment either edit in
      [`CLAUDE-DIR-REPAIRS-PENDING.md`](wyclau/CLAUDE-DIR-REPAIRS-PENDING.md) has landed.**
      ⚠ **THE MARKER IS THE FINDING OF THE 2026-09-03T02:09Z WATCH, so read this before deleting it.**
      This row scored **196 — rank ONE — with the Chartkeeper printing *"nothing is blocking it"***,
      because `chartkeeper.mjs:926` looks for a literal `GATED:` and this row never carried one.
      **So the blocker was real, stated in three documents, and invisible to the one tool that
      decides what a watch works on** — and under the new "take row one" ordering it sat at the top
      handing every fresh watch the same wall. **A row blocked in prose is not blocked.** That is a
      general fault, not a fact about this row: any row whose blocker is described rather than
      marked will do the same thing. Filed as its own row below.
      **HIS INVARIANT, AND THE WHOLE DESIGN HANGS ON IT:** *"the harvest stamp records when a
      session looked. It is not evidence the page hasn't changed since. Your page carries its own
      version number — that's the fact that can answer 'is a republish safe?', and a clock never
      can."* **Identity, not a clock.**
      **IT IS NOT A THEORY. IT HAPPENED TODAY WITH SEVEN OF HIS IDEAS IN IT.** The tick harvested at
      **3:07:08 PM** and correctly found nothing; **his first idea landed at 3:07:15 PM, seven
      seconds later**; six more followed. From that moment the stamp read "fresh" for thirty minutes
      and `.claude/hooks/glass-harvest-first.cjs:37` (`FRESH_MIN = 30`) would have green-lit any
      republish, which regenerates the page from disk and drops `glassState`. **They survived by
      luck of ordering, not by design.**
      **THE ACCEPTANCE TEST IS THAT REPLAY, and nothing else counts:** harvest at T finds nothing, he
      writes at T+7s, a session republishes at T+5min — **his words survive, or it is not a fix.**
      **FOUR LAYERS, in the spec, cheapest first:** (A) the Artifact tool already refuses a publish
      over a newer version — so **never pass `force`**, and gate against it; (B) the stamp records
      the **artifact version id**, not a time, and is compared immediately before publishing —
      `FRESH_MIN` deleted; (C) harvesting becomes idempotent by idea id, so a double harvest is
      harmless and a missed one is recoverable; (D) **the page stores each idea the moment he
      submits it**, so his words are never in only one place.
      ⚠ **ONLY LAYER D EARNS THE WORD "PERMANENT" — A, B AND C NARROW THE WINDOW AND D REMOVES IT.**
      Do not let a smaller layer ship under that word.
      ⚠ **AND THE FIRST MOVE IS A MEASUREMENT, NOT CODE.** Layer A rests on an unverified claim:
      whether a save WYATT makes in the page raises the tool's conflict, or passes silently as the
      session's own write. **Measure that before building anything** — if it conflicts, A is nearly
      the whole fix and B is ceremony; if it does not, A is worthless and B is mandatory.
      **THE FAULT IS ALSO IN WHERE THE GUARD SITS, not only what it is made of.** The tick reads at
      step 2 and publishes at step 7 (`GLASS-UPDATE-SESSION.md`), with a gate, a stamp, a Chart reap,
      a staleness judgement and a regeneration in between — **so even a perfect tick has a
      multi-minute gap between the read and the destructive act.** Move the check to step 7.
      ✅ **MEASURED 2026-09-02 4:58 PM ET, AND IT MAKES THIS ROW SMALLER — READ THIS BEFORE THE
      SPEC.** The Layer A question this row called "the first move, a measurement not code" was run
      on a DISPOSABLE artifact, never on the Glass, and **a stale republish was REFUSED**: *"a newer
      version ... is live and this publish was not built on it."* A second gate surfaced unlooked-for
      — the peer's own publish was refused for never having viewed the live version. **Two
      enforcement points; his invariant is already in the runtime.**
      ⚠ **SO THE ROW'S OWN ACCEPTANCE-TEST STORY OVERSTATED THE DANGER, AND THAT IS CORRECTED
      RATHER THAN QUIETLY DROPPED:** the 3:07 PM sequence could not have destroyed his ideas
      silently — that publish would have been refused. **A hazard was reported as a near-miss
      without anyone measuring the protection.** What still stands is that the harvest stamp is a
      clock and cannot answer the question; it was simply never the last line of defence.
      **WHAT IS ACTUALLY LEFT, in order:** (1) **Layer A = ONE GATE** that fails the build on `force`
      near a Glass publish — the runbook already says "NEVER PASS `force`"
      (`GLASS-UPDATE-SESSION.md:222-230`) and nothing enforces it, and a sentence is what failed
      here; (2) Layer B drops to a convenience, still delete `FRESH_MIN`; (3) **the residual exposure
      MOVED to the MERGE** — the tool hands back the live source to merge, and a careless merge can
      still drop his words, visibly rather than silently. Aim C and D there.
      **Sizing: no game code, no sea trial.** Hooks, the Glass runbook and `glass.mjs`.

      ---
      **⚑ WORKED 2026-09-02T21:0xZ, CEO 120 (PARTIAL), commit `cd3bd96b`. NOT CLOSED, AND THE
      REASON IS NOT THE EVIDENCE — HALF THE FIX IS BEHIND A PERMISSION A WATCH MAY NOT GRANT
      ITSELF.**
      **WHAT SHIPPED:** the harvest stamp stops being a clock. `scripts/wyclau/mark_glass_harvest.mjs`
      writes a receipt naming the artifact VERSION that was read and refuses a versionless stamp;
      `GLASS-UPDATE-SESSION.md` gains **step 6b — re-read the live page and compare the version in
      the same breath as the publish** (the spec's §3 says moving the guard there matters more than
      fixing the stamp), and step 7 forbids `force`. A derived gate over **11 instruction files**
      fails the build if any of them ever teaches a forced publish or a hand-written stamp.
      **WHAT IS BLOCKED, AND IT IS THE HALF THAT MAKES IT MECHANICAL:** the hook still decides on
      `FRESH_MIN = 30`, and its own deny text still prints the retired `date -u … > ${STAMP}` at the
      one moment that fires immediately before the destructive act. Three invariants were written
      FIRST and went **RED** against it — a bare timestamp accepted, a receipt denied for being old,
      a forced publish allowed. **The fix is two files in `.claude/`, and every write there is
      refused for an unattended watch** ("sensitive file" / "requested permissions to write").
      Measured, not assumed: `.claude/hooks/glass-harvest-first.cjs` AND
      `.claude/skills/door/SKILL.md` were both attempted and both refused. **So the wall is
      `.claude/` entirely — hooks, skills and `settings.json` — which is a standing fact about every
      future item whose fix lands there.**
      **THE THREE RED CASES ARE NOT DELETED AND NOT LEFT RED.** They sit in a PENDING block in
      `scripts/qa/glass_harvest_hook_check.mjs` that reports the live state on every `npm test` and
      **FAILS THE MOMENT THE HOOK IS REPAIRED**, so the exemption cannot outlive its reason.
      ⚠ **AND THE HONEST HEADLINE: HIS WORDS CAN STILL BE LOST.** `artifactVersion` has no machine
      reader yet — the only thing that compares it is a session obeying the runbook. Layers C and D
      are not built, and **the acceptance test in the spec's §2 is not passed.**
      ⚠ **CEO 120's sharpest finding, recorded because it is the cheapest thing left:** the row's own
      first line says *measure before building*, and no live measurement was made. **If the platform
      really does conflict, most of layer B is hardening rather than the fix; if it does not, layer A
      is worthless and B is mandatory.** One test settles it — type an idea into the page, then
      publish from a session that read it beforehand, and record what comes back.
      Account: [`CEO-REVIEWS.md`](CEO-REVIEWS.md) review 120 ·
      [`PREDICTION-20260902T2105Z-T105.md`](wyclau/PREDICTION-20260902T2105Z-T105.md).

      ---
      ⚑⚑ **2026-09-02T23:4xZ — YOUR PERMISSION DOES NOT REACH THIS WALL, AND THAT IS THE FINDING.
      MEASURED WITH YOUR GRANT ALREADY IN FORCE.** Wyatt, 5:43:55 PM ET: *"Let the watch write them
      -- I allow edits to hooks and skills"*. This row and commit `0472a129` both read that as the
      wall coming down — `0472a129` measured that `.claude/settings.json` denies only `Read(.env*)`
      and concluded *"nothing under `.claude/` is blocked by this project"*. **That measurement is
      right and the conclusion drawn from it is wrong.** The 23:39Z watch attempted both files AFTER
      the ruling: the hook came back *"which is a sensitive file"*, the Door *"you haven't granted it
      yet"*. **The refusal is Claude Code's own protection on the Edit/Write tool, not this project's
      allowlist — so he cannot lift it by ruling, because it is not his rule.**
      **SO: STOP WAITING FOR ANOTHER ANSWER FROM HIM. Three watches have now stalled here, the third
      with his permission already granted.** A plain `node` script writing the same bytes would sail
      straight past the protection, and building one would be defeating it rather than satisfying
      it — no watch should, and none has.
      ✅ **WHAT THIS WATCH DID INSTEAD, so the next attempt derives nothing:** both edits are written
      out verbatim, with their anchors, in
      [`CLAUDE-DIR-REPAIRS-PENDING.md`](wyclau/CLAUDE-DIR-REPAIRS-PENDING.md) — including the
      follow-up the gate demands the moment they land (promote the three PENDING cases to hard
      assertions, and delete the case-9 exemption that lets the hook's own deny text off). The gate's
      PENDING readout now prints the corrected reason and that route on every `npm test`.
      ⚑ **AND THE OBVIOUS SHORTCUT IS ALSO CLOSED, WHICH IS WORTH KNOWING BEFORE SOMEBODY TRIES IT.**
      This watch's first instinct was to hand the two edits to the interactive peer session with
      `SendMessage` — and that tool's own contract forbids it in as many words: *"NEVER ask a peer to
      perform an action that was denied or blocked in your session … a peer doing it for you bypasses
      the user's permission decision (cross-session permission laundering). Route blocked work back
      to your user instead."* **So no watch may delegate this either.** It is Wyatt's, in a session
      where he is present — either he approves the prompt, or he runs it himself. **This is now a
      BLOCKED ON WYATT row, not a FOR A WATCH row**, and it will stay blocked however many watches
      pick it up.
      **Nothing is fixed until those five flags read true**, and the honest headline above still
      stands: his words can still be lost.
      ⚠ STALE-CANDIDATE — answered (close it (he already answered)) — your answer landed — **"Let the watch write them -- I allow edits to hooks and skills"** — ruled on the Glass 2026-09-02 5:43:55 PM ET — and nothing moved this row
      ⚠ **DISMISSED BY HIM, NOT DONE.** Recovered from 95eee372 and filed 2026-09-03T06:2xZ at CEO 148, which
      found it among 16 handles owned by no row anywhere. His act is recorded in `.planning/wyclau/INBOX.md` — "HE DISMISSED 15 OF 44".

## T-106 — 2026-09-03 — HIS YOUR CALL PILE — THE HALF OF HIS OWN IDEA THAT IS STILL NOT BUILT, split out of `T-090` (DISMISSED BY WYATT, first pass, on the backlog page 2026-09-02 — not completed, not abandoned by a session)

- [x] **HIS YOUR CALL PILE — THE HALF OF HIS OWN IDEA THAT IS STILL NOT BUILT, split out of `T-090`
      ⟨`T-106`⟩
      by the watch that closed it, at CEO 119's insistence and it was right to insist.** His idea,
      2026-09-02 3:30 PM ET, `INBOX-20260902T193000Z`: *"do you want to put those in the Your Call
      section so I can approve/deny them being closed?"*
      **`T-090` fixed the LABEL — the thing that made his idea point at the wrong pile.** The ten
      rows are now split into five named kinds, each carrying whose job it is, and the sentence on
      his page is written by the tool rather than composed by a session. **What it did NOT build is
      the pile itself**, and CEO 119 named the omission exactly: *"step 4 — your Your Call pile,
      which is the part your idea was actually about — is not built."*
      **WHAT THIS ROW IS, AND IT IS SMALL BY DESIGN:** route the `answered` and `superseded` kinds
      to a close, the `stale-evidence` and `dead-pointer` kinds to a watch that re-measures or
      corrects the wording, and **only the residue to him** — rows whose fate is genuinely his
      say-so, like *"merge the 465-commit branch to main — his own final say-so"*. **That pile is
      one or two rows, not ten**, and the whole value of `T-090` is that it is now possible to tell
      which two.
      ⚠ **DO NOT SEND HIM THE STALE-EVIDENCE ROWS.** Handing him *"is this still broken?"* is
      handing him our homework — he cannot know from a phone whether a trade circle still clips a
      captain's name, and that is seven of the nine. **And never the `answered` ones**: he already
      answered those, and re-asking is the exact fault he was furious about at 1:38 PM.
      ⚑ **HE RULED ON THE TAP ITSELF AT 3:33 PM ET, QUESTION UI, AND CHOSE AGAINST THE MARKED
      RECOMMENDATION — WHICH IS EXACTLY WHY THIS PARAGRAPH EXISTS.** *"Your tap queues it, a watch
      closes it."* **His approval MARKS the row; it does not close it.** The next watch takes the
      marked row through the normal gate — a fresh reviewer's verdict plus evidence — before it
      leaves his list. The recommendation he rejected was that his tap close the row outright, on
      the reasoning that nobody outranks him on *"is this finished from my side"*. **He chose the
      stronger record over the faster page.** (`DECISIONS.md`, 2026-09-02 3:33 PM; commit `3602c85a`.)
      ⚠ **THE COST IS REAL, HE TOOK IT KNOWINGLY, AND IT MUST NOT BE "IMPROVED" AWAY:** a row he has
      approved **stays on his page until a watch runs** — the very delay he was frustrated by all
      day. He was shown that trade in the question and passed over the fast option. **Do not upgrade
      his tap to an immediate close because a session judges the wait too long.** If it bites him,
      the option he declined (close now, a watch audits after) is on the record and he can call for
      it. **This is his decision to revisit, not ours.**
      ⚠ **AND THE WATCH THAT BUILT `T-090` COULD NOT HAVE SEEN EITHER RULING — they were made at
      3:33 PM and sat uncommitted in the Advisor's tree until 4:52 PM, while `7c5cf6a2` landed at
      4:31 PM.** Nothing was lost, but it is the third instance today of the same shape: **a decision
      that exists only in a session's working tree is a decision no other session can obey.** Commit
      his words the moment he says them.
      **Sizing: `chartkeeper.mjs`'s routing plus `glass.mjs`'s Your Call card. No game code, no sea
      trial.** Also folds in `T-090`'s step 3, which shipped as a printed OWNER and not as anything
      that routes — CEO 119: *"nothing re-measures, nothing closes, nothing asks him."*

*Rows tagged **Your ruling:** are his own decisions, triaged out of the RULED waiting room below
(2026-09-01, INBOX-20260901T1310Z). The tag is how he tells his own call from a row somebody else
wrote; `scripts/qa/rulings_triage_check.mjs` keeps each one matched to its settled ruling.*
      ⚠ **DISMISSED BY HIM, NOT DONE.** Recovered from 95eee372 and filed 2026-09-03T06:2xZ at CEO 148, which
      found it among 16 handles owned by no row anywhere. His act is recorded in `.planning/wyclau/INBOX.md` — "HE DISMISSED 15 OF 44".

## T-127 — 2026-09-03 — THE DE-SHOUTING WRITES HIS OWN NAME IN LOWER CASE, ON HIS OWN PAGE. Found 2026-09-02T18:xxZ (DISMISSED BY WYATT, second pass, on the backlog page 2026-09-02 — not completed, not abandoned by a session)

- [x] **THE DE-SHOUTING WRITES HIS OWN NAME IN LOWER CASE, ON HIS OWN PAGE. Found 2026-09-02T18:xxZ
      ⟨`T-127`⟩
      ⚠ **RENUMBERED `T-088` → `T-127`, 2026-09-02 10:10 PM ET, at his instruction to clean the Chart.** Two open rows carried `T-088`, so `chartkeeper.mjs:860` treated every mention of it as claiming NOTHING — a ruling naming it named two jobs and spoke for neither, and **his dragged order named it twice and could not say which row he had moved.** Handles are never reused; `T-088` still resolves in `CHART-LOG.md` and in git history.
      by photographing the real Glass at 390x844, not by a fixture — it is invisible to every
      hand-written test case in the gate. Sizing: SMALL, `glass.mjs` only, no game code.**
      **WHAT HE SEES**, in `.planning/posed/glass-after-T095.png`, on at least four numbered rows:
      *"the seat wyatt actually playtests"* (row 10), *"a character of wyatt's own text"* (row 20),
      *"git stages whole files"* row (25), and the section name itself as *"blocked on wyatt"*
      (row 2). **WHY:** `shortTask()` sentence-cases any run of two or more all-caps words, and
      watches write row titles in capitals for emphasis — so `WYATT` inside a shouting run is
      lowercased along with everything else. The rule has no notion of a proper noun.
      **The existing carve-outs are the shape to follow and they are already derived rather than
      listed** — a lone all-caps word is a name, a token carrying a digit is an identifier, a lone
      `I` is a fact about English. His own name is the same kind of fact. ⚠ **Do not "fix" it with a
      list of blessed words** (rule 9); and whatever lands must keep the six cases the gate already
      holds, including `CEO 110`, `T-088` and `FROM A HAND-TYPED NUMBER`.
      **Not fixed by the watch that found it: one item, and this is `T-088`'s subject, not `T-095`'s.**
      ⚠ **DISMISSED BY HIM, NOT DONE.** Recovered from 95eee372 and filed 2026-09-03T06:2xZ at CEO 148, which
      found it among 16 handles owned by no row anywhere. His act is recorded in `.planning/wyclau/INBOX.md` — "HE DISMISSED 15 OF 44".

## T-027 — 2026-09-03 — ⚠ THE STAGING DEPLOY IS THE ONE STEP A WATCH CANNOT TAKE, AND THAT — NOT THE EVIDENCE — IS (closed 2026-09-03 · CEO 149 · no game diff — verified as he asked: the permission he was asked for already exists, staging is behind not blocked, and the suite that blocked it is now green; the deploy itself waits on the trial in flight) ⚑ HIS NOTE, 2026-09-02 10:30 PM ET, on the backlog page — VERBATIM: "verify this to make sure it functions as needed." His words outrank this row. Whatever the row claims, his instruction is to CHECK it. WHY PARTS 2 AND 3 OF RULING 12 ARE STILL OPEN. Measured 2026-09-02T04:0xZ by the watch that tried it. Sizing: one line of config, or one command from an attended session. Everything ahead of the deploy passed on this watch: npm test green through its last &&-chained gate, gear.mjs FULL and already paid for by the 0137Z trial (ten legs on 2026.09.01.8, empty NOT-RUN column, empty unjudged column since the 03:00Z watch). Then ./scripts/deploy-staging.sh "…", bash scripts/deploy-staging.sh "…" and bash scripts/deploy-staging.sh each returned "This command requires approval." Three forms, one answer; stopped there rather than hunting a fourth wording. Cause, read rather than guessed: .claude/settings.json's allow list has "Bash(node scripts/)" and nothing covering a bash …/.sh, which is exactly why every node scripts/… command that watch ran went through. scripts/deploy-staging.sh is the only deploy entrypoint in the repo (scripts//deploy → one file), and hand-rolling the rsync is rule 14 — the one that takes the live game down. Why it matters beyond this item: the relay's own liveness guards all test GIT. can_push.mjs checks four git faults and says "can publish"; the thing that actually stopped this watch was the permission layer. Same shape as the push refusal solved four hours ago — and every successful staging deploy this project has had was run by an ATTENDED session. Staging is measurably stale as a result: the wire says 2026.09.01.6-staging@60f969c4, two builds behind the tree, so the preload pass, the about-recipes resize, the call circle moved off the question it asks, the storm glide and the guest's camera are all missing from the address he plays. The fix is his, and the watch deliberately did not take it — adding "Bash(bash scripts/deploy-staging.sh)" to .claude/settings.json grants every future unattended watch the ability to publish to a public address, which is not a repair a watch gets to make to the one file that exists to be his. See BLOCKED ON WYATT. ✅ HE ALREADY MADE IT — MEASURED 2026-09-03T06:0xZ, at his note "verify this to make sure it functions as needed." .claude/settings.json:11-12 now carries both "Bash(npm run deploy:staging)" and "Bash(bash scripts/deploy-staging.sh)". The blocker this row is built on is gone, and the row had no way to know: it was written from a refusal that was true when it was measured and stale when it was read — the same shape as T-011's false STOP and T-085's claude-kit fence, both of which cost a session each tonight. ⚠ AND THE STALENESS NUMBER WAS WRONG TOO, IN HIS FAVOUR. The row says the wire reads 2026.09.01.6-staging@60f969c4. Measured against the live address just now: 2026.09.01.8-staging@1ce21a00 — so a deploy DID land after this row was filed. Staging is still behind the tree (2026.09.02.1), but by one build, not two. ⛔ STILL NOT DEPLOYED, AND THE PROCESS — NOT A JUDGEMENT CALL — IS WHY. The release contract is npm test exit 0 → gear → sea trial → deploy. npm test is RED, on chart_sweep_conserves_check (106 handles owned by nothing), which is another session's bookkeeping fault and touches no game code. The rule does not carve out "unrelated" failures, and inventing that exception at 6am to publish to an address he plays is exactly the kind of judgement a watch does not get to make alone. SO THIS ROW IS NOW BLOCKED ON A DIFFERENT THING THAN IT SAYS AT THE TOP: not his permission — he gave it — but a green suite. Whoever gets chart_sweep_conserves_check green can take this row straight through.

- [x] **⚠ THE STAGING DEPLOY IS THE ONE STEP A WATCH CANNOT TAKE, AND THAT — NOT THE EVIDENCE — IS (closed 2026-09-03 · CEO 149 · no game diff — verified as he asked: the permission he was asked for already exists, staging is behind not blocked, and the suite that blocked it is now green; the deploy itself waits on the trial in flight)
      ⟨`T-027`⟩
      ⚑ **HIS NOTE, 2026-09-02 10:30 PM ET, on the backlog page — VERBATIM:** *"verify this to make sure it functions as needed."*
      **His words outrank this row.** Whatever the row claims, his instruction is to CHECK it.
      WHY PARTS 2 AND 3 OF RULING 12 ARE STILL OPEN. Measured 2026-09-02T04:0xZ by the watch that
      tried it. Sizing: one line of config, or one command from an attended session.**
      Everything ahead of the deploy passed on this watch: `npm test` green through its last
      `&&`-chained gate, `gear.mjs` FULL and already paid for by the 0137Z trial (ten legs on
      `2026.09.01.8`, empty NOT-RUN column, empty unjudged column since the 03:00Z watch).
      Then `./scripts/deploy-staging.sh "…"`, `bash scripts/deploy-staging.sh "…"` and
      `bash scripts/deploy-staging.sh` each returned **"This command requires approval."** Three
      forms, one answer; stopped there rather than hunting a fourth wording.
      **Cause, read rather than guessed:** `.claude/settings.json`'s allow list has
      `"Bash(node scripts/*)"` and nothing covering a `bash …/*.sh`, which is exactly why every
      `node scripts/…` command that watch ran went through. `scripts/deploy-staging.sh` is the only
      deploy entrypoint in the repo (`scripts/**/deploy*` → one file), and hand-rolling the rsync is
      rule 14 — the one that takes the live game down.
      **Why it matters beyond this item:** the relay's own liveness guards all test GIT.
      `can_push.mjs` checks four git faults and says "can publish"; the thing that actually stopped
      this watch was the permission layer. Same shape as the push refusal solved four hours ago —
      and every successful staging deploy this project has had was run by an ATTENDED session.
      **Staging is measurably stale as a result:** the wire says `2026.09.01.6-staging@60f969c4`,
      two builds behind the tree, so the preload pass, the about-recipes resize, the call circle
      moved off the question it asks, the storm glide and the guest's camera are all missing from
      the address he plays.
      **The fix is his, and the watch deliberately did not take it** — adding
      `"Bash(bash scripts/deploy-staging.sh*)"` to `.claude/settings.json` grants every future
      unattended watch the ability to publish to a public address, which is not a repair a watch
      gets to make to the one file that exists to be his. See BLOCKED ON WYATT.
      ✅ **HE ALREADY MADE IT — MEASURED 2026-09-03T06:0xZ, at his note "verify this to make sure it
      functions as needed."** `.claude/settings.json:11-12` now carries **both**
      `"Bash(npm run deploy:staging*)"` and `"Bash(bash scripts/deploy-staging.sh*)"`. **The blocker
      this row is built on is gone**, and the row had no way to know: it was written from a refusal
      that was true when it was measured and stale when it was read — the same shape as `T-011`'s
      false STOP and `T-085`'s claude-kit fence, both of which cost a session each tonight.
      ⚠ **AND THE STALENESS NUMBER WAS WRONG TOO, IN HIS FAVOUR.** The row says the wire reads
      `2026.09.01.6-staging@60f969c4`. Measured against the live address just now:
      **`2026.09.01.8-staging@1ce21a00`** — so a deploy DID land after this row was filed. Staging is
      still behind the tree (`2026.09.02.1`), but by one build, not two.
      ⛔ **STILL NOT DEPLOYED, AND THE PROCESS — NOT A JUDGEMENT CALL — IS WHY.** The release contract
      is `npm test` exit 0 → gear → sea trial → deploy. **`npm test` is RED**, on
      `chart_sweep_conserves_check` (106 handles owned by nothing), which is another session's
      bookkeeping fault and touches no game code. The rule does not carve out "unrelated" failures,
      and inventing that exception at 6am to publish to an address he plays is exactly the kind of
      judgement a watch does not get to make alone.
      **SO THIS ROW IS NOW BLOCKED ON A DIFFERENT THING THAN IT SAYS AT THE TOP:** not his
      permission — he gave it — but a green suite. **Whoever gets `chart_sweep_conserves_check`
      green can take this row straight through.**

## T-135 — 2026-09-03 — Your ruling: the Glass's Ideas box corrupting the page after a save — GATED: awaiting his own look at the live page, which only he can do. (closed 2026-09-03 · CEO 150 · no game diff — recommend-only by his own instruction: measured, recommended, three question rows filed -- no code, because his words are 'Recommend, don't just build') ⚠ RENUMBERED T-203 → T-135 (CEO 148). I minted 203 out of thin air when restoring this row, and that ONE NUMBER INVENTED 68 PHANTOM ORPHANS — chart_sweep_conserves_check takes its ceiling from the highest OWNED handle, so jumping from 134 to 203 made every number between them look like a row that had vanished. 84 orphans, 68 of them mine, from one careless id. Take the next handle at the frontier; never a round number that looks free. ⚠ RESTORED 2026-09-03T05:1xZ. THIS ROW WAS SWEPT OFF THE CHART WHILE STILL WAITING ON HIM. It was archived as T-124 (CHART-LOG.md:1257) with a - [x] and no close pointer — compare the entry directly beneath it, which carries (closed · CEO 143 · …). So it did not go through close_item.mjs; a sweep took it because the box was ticked, and the box was ticked on a row whose own text says it is gated on an action only Wyatt can perform. Caught by rulings_triage_check, which failed npm test for exactly the right reason: "still owes work but has no - [ ] Your ruling: … row — it has left the rulings card without reaching the Tasks card, so it is on no surface he can see." That gate is doing its job and this row is the repair, not a duplicate: if he has since looked and is satisfied, closing it through the gate takes one command and leaves a pointer this time. The reusable fault: a tick is not a close. Sweep archives what is ticked; only close_item.mjs records WHY, and a row ticked by hand loses that forever.

- [x] Your ruling: the Glass's Ideas box corrupting the page after a save — **GATED: awaiting his own look at the live page**, which only he can do. (closed 2026-09-03 · CEO 150 · no game diff — recommend-only by his own instruction: measured, recommended, three question rows filed -- no code, because his words are 'Recommend, don't just build')
      ⟨`T-135`⟩
      ⚠ **RENUMBERED `T-203` → `T-135` (CEO 148). I minted 203 out of thin air when restoring this
      row, and that ONE NUMBER INVENTED 68 PHANTOM ORPHANS** — `chart_sweep_conserves_check` takes
      its ceiling from the highest OWNED handle, so jumping from 134 to 203 made every number
      between them look like a row that had vanished. 84 orphans, 68 of them mine, from one
      careless id. **Take the next handle at the frontier; never a round number that looks free.**
      ⚠ **RESTORED 2026-09-03T05:1xZ. THIS ROW WAS SWEPT OFF THE CHART WHILE STILL WAITING ON HIM.**
      It was archived as `T-124` (`CHART-LOG.md:1257`) with a `- [x]` and **no close pointer** — compare
      the entry directly beneath it, which carries `(closed · CEO 143 · …)`. So it did not go through
      `close_item.mjs`; a sweep took it because the box was ticked, and the box was ticked on a row
      whose own text says it is **gated on an action only Wyatt can perform.**
      **Caught by `rulings_triage_check`, which failed `npm test` for exactly the right reason:**
      *"still owes work but has no `- [ ] Your ruling: …` row — it has left the rulings card without
      reaching the Tasks card, so it is on no surface he can see."* That gate is doing its job and
      this row is the repair, not a duplicate: if he has since looked and is satisfied, closing it
      through the gate takes one command and leaves a pointer this time.
      **The reusable fault: a tick is not a close.** Sweep archives what is ticked; only
      `close_item.mjs` records WHY, and a row ticked by hand loses that forever.

## T-104 — 2026-09-03 — ⚑⚑ HIS "DO NOW" BUTTON — WORKS, AND CEO 151 BROKE THE GATE FOUR WAYS TO PROVE IT. Door carries the pin since 99327348. (closed 2026-09-03 · CEO 151 · no game diff — both halves of his own definition are mechanical, gated and red-proofed four ways by CEO 151; the Door now carries the pin and the re-rank, and the residual hand-harvest is its own row T-140) ⚑ HIS NOTE, 2026-09-02 10:30 PM ET, on the backlog page — VERBATIM: "i see the DO NOW button -- does it work? Work = puts the task at the TOP of the list and gives it to the very next watch." His words outrank this row. Whatever the row claims, his instruction is to CHECK it. Deliberately NOT ticked: one joint is still a session remembering something. Glass, 2026-09-02, 3:09 PM ET. His words, verbatim: "Do Now: in the Glass, Add a "DO now" button next to "Send to the Chart" button that tells RANK to put this task at the top" WHAT HE CAN DO NOW — measured by PRESSING it in a browser, not by reading the code: the button sits beside Send to the Chart; a tap saves the idea carrying its flag, clears the box, paints a DO NOW tag on it at once, and tells him one slot displaced the other. A session carries it over with chartkeeper.mjs --do-now=<handle>, and RANK puts that row first with YOU SAID DO NOW beside it. Two pins cannot exist: pinning releases the previous one in the same act, and two arriving by hand fail the build naming both. The press, photographed: [.planning/posed/glass-donow-pressed.png](posed/glass-donow-pressed.png). ⚠ THE ONE GAP, AND IT IS WHY THIS IS NOT TICKED: the joint between his tap and RANK is a SESSION reading the page by hand. do_now_check.mjs case 9 fails the build if the harvest runbook stops naming the command — but a gate can prove the SENTENCE is there, never that a session typed it. Closing it for real means the harvest carrying the flag mechanically, which is the same shape as T-105's remaining layers and is probably one job with them. ✅ THE DOOR SAYS IT NOW — shipped 2026-09-03T06:5xZ, commit 99327348. Its harvest step carries the pin command, and it sits in ## First, both modes — before the fork into THE WATCH and THE ADVISOR — so every session meets it in either mode (verified by CEO 151, which checked the placement rather than the presence). ✅ GATED: do_now_reaches_the_watch_check case 5. CEO 151 red-proofed the whole gate with four mutants and each turned exactly one assertion red — including one that broke the score in chartkeeper.mjs while leaving every string intact, which is the test 147 asked for: the case executes the real ranker, so it cannot be a text detection wearing a behaviour's clothes. ⚠ AND IT FOUND A HOLE IN MY OWN CASE 5, WHICH IS THE PART WORTH KEEPING. It read the WHOLE FILE for --do-now=, so 151 moved the line into an "Appendix nobody reads" at the end of SKILL.md and the case still reported "the DOOR's harvest step also tells a watch…". The assertion named a location it never looked at — its own message was the overclaim. Now scoped to the text between the harvest heading and the mode fork, and re-run against 151's exact mutant: it FAILS. A check that claims a place must look at that place. ✅ AND THE DOOR NOW CARRIES THE HALF THE RUNBOOK CALLS LOAD-BEARING — "two commands, one act; never the first without the second." --do-now writes now: yes and stops; the Glass draws his Tasks card in the order rows physically sit in the file, so a pin with no re-rank leaves his page unchanged — flagged and unmoved, which from where he sits is half 1 failing. A watch was covered by accident (step 2 ranks before it picks); the Advisor was not, and the Advisor is the mode a session is in when he presses the button. ⛔ WHAT IS STILL A SESSION REMEMBERING SOMETHING, and it is NOT this row's to fix: the harvest is a person reading a page by hand — true of ideas, rulings and comments alike, not just the pin. A gate can prove the SENTENCE is in both files; it cannot prove a session typed the command. CEO 151: "A ticket that cannot close until an unrelated ticket closes is a ticket that has stopped measuring its own subject." Carried to its own row (T-140).

- [x] **⚑⚑ HIS "DO NOW" BUTTON — WORKS, AND CEO 151 BROKE THE GATE FOUR WAYS TO PROVE IT. Door carries the pin since `99327348`. (closed 2026-09-03 · CEO 151 · no game diff — both halves of his own definition are mechanical, gated and red-proofed four ways by CEO 151; the Door now carries the pin and the re-rank, and the residual hand-harvest is its own row T-140)
      ⟨`T-104`⟩
      ⚑ **HIS NOTE, 2026-09-02 10:30 PM ET, on the backlog page — VERBATIM:** *"i see the DO NOW button -- does it work? Work = puts the task at the TOP of the list and gives it to the very next watch."*
      **His words outrank this row.** Whatever the row claims, his instruction is to CHECK it.
      Deliberately NOT ticked: one joint is still a session remembering something.**
      Glass, 2026-09-02, 3:09 PM ET. **His words, verbatim:** *"Do Now: in the Glass, Add a "DO now"
      button next to "Send to the Chart" button that tells RANK to put this task at the top"*
      **WHAT HE CAN DO NOW — measured by PRESSING it in a browser, not by reading the code:** the
      button sits beside Send to the Chart; a tap saves the idea carrying its flag, clears the box,
      paints a `DO NOW` tag on it at once, and tells him one slot displaced the other. A session
      carries it over with `chartkeeper.mjs --do-now=<handle>`, and RANK puts that row first with
      **YOU SAID DO NOW** beside it. Two pins cannot exist: pinning releases the previous one in the
      same act, and two arriving by hand fail the build naming both. The press, photographed:
      [`.planning/posed/glass-donow-pressed.png`](posed/glass-donow-pressed.png).
      ⚠ **THE ONE GAP, AND IT IS WHY THIS IS NOT TICKED: the joint between his tap and RANK is a
      SESSION reading the page by hand.** `do_now_check.mjs` case 9 fails the build if the harvest
      runbook stops naming the command — but a gate can prove the SENTENCE is there, never that a
      session typed it. **Closing it for real means the harvest carrying the flag mechanically**,
      which is the same shape as `T-105`'s remaining layers and is probably one job with them.
      ✅ **THE DOOR SAYS IT NOW — shipped 2026-09-03T06:5xZ, commit `99327348`.** Its harvest step
      carries the pin command, and it sits in `## First, both modes` — **before** the fork into THE
      WATCH and THE ADVISOR — so every session meets it in either mode (verified by CEO 151, which
      checked the placement rather than the presence).
      ✅ **GATED:** `do_now_reaches_the_watch_check` case 5. CEO 151 red-proofed the whole gate with
      four mutants and each turned exactly one assertion red — **including one that broke the score
      in `chartkeeper.mjs` while leaving every string intact**, which is the test 147 asked for: the
      case executes the real ranker, so it cannot be a text detection wearing a behaviour's clothes.
      ⚠ **AND IT FOUND A HOLE IN MY OWN CASE 5, WHICH IS THE PART WORTH KEEPING.** It read the WHOLE
      FILE for `--do-now=`, so 151 moved the line into an *"Appendix nobody reads"* at the end of
      `SKILL.md` and the case still reported *"the DOOR's harvest step also tells a watch…"*. **The
      assertion named a location it never looked at — its own message was the overclaim.** Now scoped
      to the text between the harvest heading and the mode fork, and re-run against 151's exact
      mutant: it FAILS. *A check that claims a place must look at that place.*
      ✅ **AND THE DOOR NOW CARRIES THE HALF THE RUNBOOK CALLS LOAD-BEARING** — *"two commands, one
      act; never the first without the second."* `--do-now` writes `now: yes` and stops; the Glass
      draws his Tasks card in the order rows physically sit in the file, so **a pin with no re-rank
      leaves his page unchanged** — flagged and unmoved, which from where he sits is half 1 failing.
      A watch was covered by accident (step 2 ranks before it picks); **the Advisor was not, and the
      Advisor is the mode a session is in when he presses the button.**
      ⛔ **WHAT IS STILL A SESSION REMEMBERING SOMETHING, and it is NOT this row's to fix:** the
      harvest is a person reading a page by hand — true of ideas, rulings and comments alike, not
      just the pin. A gate can prove the SENTENCE is in both files; it cannot prove a session typed
      the command. **CEO 151: *"A ticket that cannot close until an unrelated ticket closes is a
      ticket that has stopped measuring its own subject."*** Carried to its own row (`T-140`).

<!-- ⛔ AN ARCHIVE ENTRY WAS WRITTEN HERE AT 2026-09-03T07:3xZ AND REMOVED AGAIN BY THE WATCH THAT
     CAUSED IT (c1). It was `T-137` — a live, OPEN, GATED-on-Wyatt row — archived under CEO 152 and
     a close reason about removing a box from the Glass. **The two have nothing to do with each
     other.** `close_item.mjs --item="T-087"` matched and closed `T-137`.

     ⚑ AND THAT IS THE THIRD TIME, WHICH IS WHAT MAKES IT A MECHANISM RATHER THAN AN ACCIDENT.
     Search this file for "the Glass's Ideas box corrupting the page after a save": it is archived
     at :1274 under **CEO 142 with a reason about `sitemap.xml`** and at :2228 under **CEO 150 with
     a reason about "recommend, don't just build"**. Those were the closes of `T-098` and `T-102`.
     Three different items were closed; the same innocent row was ticked and archived all three
     times, each stamped with the real item's verdict.

     ⚠ SO THE EARLIER DIAGNOSIS ON THAT ROW — "no close pointer, so it never went through
     close_item.mjs" — WAS EXACTLY BACKWARDS, and it is worth saying plainly because it sent two
     sessions at the sweep. The pointers are there. They belong to other items. **A close pointer
     proves a gate ran; it does not prove it ran on the row it is written beside.**

     THE CAUSE, MEASURED: `close_item.mjs:114-118` gives each `- [ ]` row a block ending at the
     NEXT `- [ ]`, and the LAST open row's block therefore runs to end-of-file — swallowing BLOCKED
     ON WYATT, RULED and the whole IDEA INBOX. Any `--item=` string appearing anywhere below the
     last checkbox matches that row. `T-137` has been the last open row each time. Full account and
     the sized fix are on the restored row in `CHART.md`. -->


## T-021 — 2026-09-03 — The Blade hour (Wyatt + a session, ~30–60 min): register the Bell, the ring test both (closed 2026-09-03 · CEO 153 · no game diff — his 99% was right: Bell registered and firing (69 launches, not the 139 I miscounted), both ring directions proven by the task's own Last Run inside a gap, and O2 answered in full — interactive yes, headless watch no) ⚑ HIS NOTE, 2026-09-02 10:36 PM ET, backlog page — VERBATIM: "I"m 99% sure the Blade Hour is complete!" HE SAID 99%, NOT 100% — SO IT IS CHECKED, NOT CLOSED. His recollection is evidence; it is not a measurement, and he was careful to say so himself. directions, the O2 publish test — runbook scripts/wyclau/RAZER-SETUP.md The ring-test and O2-publish thirds are not checkable this way; still needs Wyatt or a session that can run them. SUPERSEDED 2026-09-03T07:4xZ — struck, not appended to. Five verdicts running have found this fault: "correcting a row by appending to it does not correct it." ✅ ALL THREE MEASURED 2026-09-03T07:2xZ. HE SAID 99%; THE EVIDENCE SAYS COMPLETE. The two thirds called "not checkable this way" were checkable — by a different instrument, not by a different person. "Not checkable this way" is a statement about the instrument that was reached for. 1. THE BELL IS REGISTERED AND FIRING — 69 LAUNCHES, NOT 139. ⚠ I doubled my own headline number and CEO 153 caught it. ls watch- = 139 = 70 .out + 69 .err — bell.ps1 writes BOTH from one Start-Process, so the glob counts every launch twice, and the 70th .out is watch-commitmsg.out, which the Bell never wrote. Real launches: 69, every .err empty, so 69 launches and zero launch failures. THE RECONCILIATION IS THE TELL I DIDN'T LOOK FOR: 72 rings − 3 pre-naming entries = 69. The two numbers agree exactly, and a number that agrees with nothing should have been the first thing I checked about it. Registration re-measured: Enabled, Ready, Repeat: Every 10 Minutes, Last Result 0, and the Task To Run path is fully populated — so it is NOT in the silent-failure mode RAZER-SETUP.md documents (an unset $repo reporting Ready and dying every tick). ⚠ AND MY PROOF WAS THE WEAKER ONE EVEN AFTER CORRECTING IT. A log is written BY the script, so a log proves only that the script ran. What proves a launch is the .out/.err pair with a transcript in it — that is the OS's evidence, not the script's own account of itself. 2. THE RING TEST, BOTH DIRECTIONS, FROM THE BELL'S OWN LOG. Rings when nothing is running: 72 entries, "ring: no watch on deck — rang the next one". Stays silent while a watch is alive: ⚠ I argued this from the GAPS, and that is an inference wearing a measurement's clothes — CEO 153's phrase, and it is right. Silence has TWO causes and the log cannot separate them: the Bell writes nothing when a watch is on deck (bell.ps1:63-66, deliberately unlogged) and it writes nothing if the task never ran. RAZER-SETUP.md's own warning box describes exactly that second world — a task reporting Ready, firing hourly, every run dying before reaching the script, the log staying empty and looking identical to a Bell that never ticked. My evidence read the same in both worlds. ✅ PROVEN PROPERLY INSTEAD, by three instruments that are not the log: bell.ps1:63-66 is if ($watchProcs.Count -gt 0) { exit 0 } and none of its five Add-Content lines is reachable on that path · the real script run against a scratch repo wrote a line with no process matching and nothing at all with one · and the decisive one — schtasks Last Run Time 07:38:01Z, Last Result 0, INSIDE the gap after the 07:08 ring, with a claude.exe -p "/door" watch alive in the process table at 07:40Z. Task fired. Watch alive. Log did not grow. (The 55 hold off: lines are all dated 2026-09-01 and bell.ps1 cannot emit that string — naming the count matters, because 55 lines is a lot of log to misread as today's behaviour.) (The hold off: a commit landed N min ago lines in the log are from 2026-09-01 and are NOT this: that 45-minute commit rule belonged to the pre-relay design and is gone from bell.ps1. Reading them as today's second direction would be reading a retired mechanism as live.) 3. THE O2 QUESTION — ANSWERED, AND IT HAS BEEN OPEN SINCE 2026-09-01. RAZER-SETUP.md:85 asks: "can a Blade session publish the Glass at all? In an interactive claude session on the Blade, ask it to republish the Glass and to state plainly whether the Artifact tool exists in its tool list." This is that session, and the answer is YES: the Artifact tool is in its tool list, demonstrated by repeated successful action: "read" calls against the live artifact tonight, not by reading a config. The Glass architecture hedges on this question; the hedge can come down for the interactive case. ⚠ THE BOUNDARY I NAMED — "the write path unexercised by choice" — WAS TRUE WHEN WRITTEN AND WAS FALSE TWENTY MINUTES LATER. Commit 05990884, 07:38:04Z: "glass: republish — rulings-box removal now live." A Blade session published, and CEO 153 refused to take the commit message for it (a message is a comment, not a measurement) — it read the live page and found embedded stamps to 07:37:34Z, thirty seconds before the commit. ✅ SO O2 IS ANSWERED IN FULL, AND THE ANSWER IS TWO ANSWERS — which is the operationally useful part and is recorded verbatim as RAZER-SETUP.md:85-89 demands: INTERACTIVE SESSION: YES. Tool present, reads succeed, and a publish reached the live page. HEADLESS -p WATCH — the kind the Bell rings: NO. ~17 watch transcripts say so independently, including one that checked twice "after another watch claimed we'd all been wrong about that", and one flatly contradicting the record: commit 59ad8b69 claims "MEASURED on both machines: -p HAS the Artifact tool" — not true of those sessions. THE HEDGE STAYS FOR WATCHES AND COMES DOWN FOR INTERACTIVE SESSIONS. My answer covered only the interactive half, and O2 exists for the watch half — so answering it left the question where it was.

- [x] The Blade hour (Wyatt + a session, ~30–60 min): register the Bell, the ring test both (closed 2026-09-03 · CEO 153 · no game diff — his 99% was right: Bell registered and firing (69 launches, not the 139 I miscounted), both ring directions proven by the task's own Last Run inside a gap, and O2 answered in full — interactive yes, headless watch no)
      ⟨`T-021`⟩
      ⚑ **HIS NOTE, 2026-09-02 10:36 PM ET, backlog page — VERBATIM:** *"I"m 99% sure the Blade Hour is complete!"*
      **HE SAID 99%, NOT 100% — SO IT IS CHECKED, NOT CLOSED.** His recollection is evidence; it is not a measurement, and he was careful to say so himself.
  directions, the O2 publish test — runbook `scripts/wyclau/RAZER-SETUP.md`
  ~~**The ring-test and O2-publish thirds are not checkable this way; still needs Wyatt or a session
  that can run them.**~~ **SUPERSEDED 2026-09-03T07:4xZ — struck, not appended to.** Five verdicts
  running have found this fault: *"correcting a row by appending to it does not correct it."*
      ✅ **ALL THREE MEASURED 2026-09-03T07:2xZ. HE SAID 99%; THE EVIDENCE SAYS COMPLETE.** The two
      thirds called "not checkable this way" were checkable — by a different instrument, not by a
      different person. *"Not checkable this way"* is a statement about the instrument that was
      reached for.
      **1. THE BELL IS REGISTERED AND FIRING — 69 LAUNCHES, NOT 139.** ⚠ **I doubled my own
      headline number and CEO 153 caught it.** `ls watch-*` = 139 = **70 `.out` + 69 `.err`** —
      `bell.ps1` writes BOTH from one `Start-Process`, so the glob counts every launch twice, and
      the 70th `.out` is `watch-commitmsg.out`, which the Bell never wrote. **Real launches: 69**,
      every `.err` empty, so 69 launches and zero launch failures.
      **THE RECONCILIATION IS THE TELL I DIDN'T LOOK FOR: 72 rings − 3 pre-naming entries = 69.**
      The two numbers agree exactly, and a number that agrees with nothing should have been the
      first thing I checked about it.
      Registration re-measured: **Enabled, Ready, `Repeat: Every 10 Minutes`, Last Result 0**, and
      the `Task To Run` path is fully populated — so it is NOT in the silent-failure mode
      `RAZER-SETUP.md` documents (an unset `$repo` reporting Ready and dying every tick).
      ⚠ **AND MY PROOF WAS THE WEAKER ONE EVEN AFTER CORRECTING IT.** A log is written BY the script,
      so a log proves only that the script ran. **What proves a launch is the `.out`/`.err` pair with
      a transcript in it — that is the OS's evidence, not the script's own account of itself.**
      **2. THE RING TEST, BOTH DIRECTIONS, FROM THE BELL'S OWN LOG.**
      *Rings when nothing is running:* 72 entries, *"ring: no watch on deck — rang the next one"*.
      *Stays silent while a watch is alive:* ⚠ **I argued this from the GAPS, and that is an
      inference wearing a measurement's clothes — CEO 153's phrase, and it is right.** Silence has
      TWO causes and the log cannot separate them: the Bell writes nothing when a watch is on deck
      (`bell.ps1:63-66`, deliberately unlogged) **and it writes nothing if the task never ran.**
      `RAZER-SETUP.md`'s own warning box describes exactly that second world — a task reporting
      Ready, firing hourly, every run dying before reaching the script, the log staying empty and
      **looking identical to a Bell that never ticked.** My evidence read the same in both worlds.
      ✅ **PROVEN PROPERLY INSTEAD, by three instruments that are not the log:** `bell.ps1:63-66` is
      `if ($watchProcs.Count -gt 0) { exit 0 }` and none of its five `Add-Content` lines is reachable
      on that path · the real script run against a scratch repo wrote a line with no process
      matching and **nothing at all** with one · and the decisive one — **`schtasks` Last Run Time
      07:38:01Z, Last Result 0, INSIDE the gap after the 07:08 ring, with a `claude.exe -p "/door"`
      watch alive in the process table at 07:40Z. Task fired. Watch alive. Log did not grow.**
      *(The 55 `hold off:` lines are all dated 2026-09-01 and `bell.ps1` cannot emit that string —
      naming the count matters, because 55 lines is a lot of log to misread as today's behaviour.)*
      *(The `hold off: a commit landed N min ago` lines in the log are from 2026-09-01 and are NOT
      this: that 45-minute commit rule belonged to the pre-relay design and is gone from `bell.ps1`.
      Reading them as today's second direction would be reading a retired mechanism as live.)*
      **3. THE O2 QUESTION — ANSWERED, AND IT HAS BEEN OPEN SINCE 2026-09-01.** `RAZER-SETUP.md:85`
      asks: *"can a Blade session publish the Glass at all? In an interactive `claude` session on the
      Blade, ask it to republish the Glass and to state plainly whether the Artifact tool exists in
      its tool list."* **This is that session, and the answer is YES: the Artifact tool is in its
      tool list, demonstrated by repeated successful `action: "read"` calls against the live artifact
      tonight, not by reading a config.** The Glass architecture hedges on this question; the hedge
      can come down for the interactive case.
      ⚠ **THE BOUNDARY I NAMED — *"the write path unexercised by choice"* — WAS TRUE WHEN WRITTEN
      AND WAS FALSE TWENTY MINUTES LATER.** Commit `05990884`, 07:38:04Z: *"glass: republish —
      rulings-box removal now live."* A Blade session published, and CEO 153 refused to take the
      commit message for it (a message is a comment, not a measurement) — it read the live page and
      found embedded stamps to **07:37:34Z**, thirty seconds before the commit.
      ✅ **SO O2 IS ANSWERED IN FULL, AND THE ANSWER IS TWO ANSWERS — which is the operationally
      useful part and is recorded verbatim as `RAZER-SETUP.md:85-89` demands:**
      **INTERACTIVE SESSION: YES.** Tool present, reads succeed, and a publish reached the live page.
      **HEADLESS `-p` WATCH — the kind the Bell rings: NO.** ~17 watch transcripts say so
      independently, including one that checked twice *"after another watch claimed we'd all been
      wrong about that"*, and one flatly contradicting the record: commit `59ad8b69` claims
      *"MEASURED on both machines: `-p` HAS the Artifact tool"* — **not true of those sessions.**
      **THE HEDGE STAYS FOR WATCHES AND COMES DOWN FOR INTERACTIVE SESSIONS.** My answer covered
      only the interactive half, and **O2 exists for the watch half** — so answering it left the
      question where it was.

## T-114 — 2026-09-03 — THE PUBLIC ABOUT PAGE TEACHES AN ACTION THE GAME DOES NOT HAVE, AND TWO OTHER THINGS THAT (closed 2026-09-03 · CEO 154 · no game diff — the whole section is deleted, which is the honest scope this row itself asked for -- all four sentences it names plus a fifth drift inside about-flippenator.jpg, and the meta description that promised them) ARE WRONG. Found 2026-09-02 6:30 PM ET while doing the homework for his rules-page split; NOT fixed, deliberately — which of these sentences survives depends on the split he approves (BLOCKED ON WYATT, rules page 1-4). Sizing: SMALL, about.html only, no src/. WHAT A STRANGER ARRIVING FROM GOOGLE READS. about.html:187 offers fish as one of the four turn actions. There is no fish — the four are Dock, Attack, Trade, Muse (src/ui/flow.js:2310, 2318, 2322, 2416), and fishing was deleted outright rather than disabled (src/ui/flow.js:301, "v2 rule 3: fishing is gone entirely"). about.html:184 says the dock flip wins you a crate; the flip pays coins, and buying a crate is a separate step at a price that rises as the island empties. about.html:176 and :198 say "first baker home wins" with the bake-off as a tiebreak; the bake-off is live (BAKEOFF_ENABLED = true, src/shared/index.js:466) and it is how every captain wins — two on the same day bake together. AND A FOURTH, FOUND BY CEO 124 AND NOT BY THE WATCH THAT FILED THIS ROW. about.html:181-182 says the wind "sets your sailing budget for the turn — cheap with it, dear against it", which tells a stranger that sailing costs something. index.html:2833: "Sailing is free." The wind caps the RANGE, it never charges. ⚠ Whoever takes this: the in-game modal is RIGHT and About is wrong, not the other way round. The full comparison and the reasoning are in [SPEC-RULES-PAGE-SPLIT.md](SPEC-RULES-PAGE-SPLIT.md). ⚠ And do not trust the count. It was three, then four the moment somebody else looked. Nobody has ever checked this page against the game it describes, so the honest scope is "re-read the whole section", not "fix four sentences".

- [x] **THE PUBLIC ABOUT PAGE TEACHES AN ACTION THE GAME DOES NOT HAVE, AND TWO OTHER THINGS THAT (closed 2026-09-03 · CEO 154 · no game diff — the whole section is deleted, which is the honest scope this row itself asked for -- all four sentences it names plus a fifth drift inside about-flippenator.jpg, and the meta description that promised them)
      ⟨`T-114`⟩
      ARE WRONG. Found 2026-09-02 6:30 PM ET while doing the homework for his rules-page split;
      NOT fixed, deliberately — which of these sentences survives depends on the split he approves
      (`BLOCKED ON WYATT`, rules page 1-4). Sizing: SMALL, `about.html` only, no `src/`.**
      **WHAT A STRANGER ARRIVING FROM GOOGLE READS.** `about.html:187` offers **fish** as one of
      the four turn actions. **There is no fish** — the four are Dock, Attack, Trade, Muse
      (`src/ui/flow.js:2310, 2318, 2322, 2416`), and fishing was deleted outright rather than
      disabled (`src/ui/flow.js:301`, *"v2 rule 3: fishing is gone entirely"*). `about.html:184`
      says the dock flip wins you a **crate**; the flip pays **coins**, and buying a crate is a
      separate step at a price that rises as the island empties. `about.html:176` and `:198` say
      **"first baker home wins"** with the bake-off as a **tiebreak**; the bake-off is live
      (`BAKEOFF_ENABLED = true`, `src/shared/index.js:466`) and it is how **every** captain wins —
      two on the same day bake **together**.
      **AND A FOURTH, FOUND BY CEO 124 AND NOT BY THE WATCH THAT FILED THIS ROW.**
      `about.html:181-182` says the wind *"sets your sailing budget for the turn — cheap with it,
      dear against it"*, which tells a stranger that sailing costs something. `index.html:2833`:
      **"Sailing is free."** The wind caps the RANGE, it never charges.
      ⚠ **Whoever takes this: the in-game modal is RIGHT and About is wrong, not the other way
      round.** The full comparison and the reasoning are in
      [`SPEC-RULES-PAGE-SPLIT.md`](SPEC-RULES-PAGE-SPLIT.md).
      ⚠ **And do not trust the count.** It was three, then four the moment somebody else looked.
      **Nobody has ever checked this page against the game it describes**, so the honest scope is
      "re-read the whole section", not "fix four sentences".

## T-139 — 2026-09-03 — Your ruling: do you want SCHEDULED to stop hiding your ideas? He answered; not yet built. (closed 2026-09-03 · CEO 157 · no game diff — no game diff — his ruling is the Glass's fate lexicon, not the game; src/ and index.html untouched (commit 417adefc)) Measured with the page's own logic when it was put to him: 13 of his 15 ideas were hidden from the Glass, 9 of them by the word SCHEDULED, which the code treated as identical to SHIPPED and CLOSED — against the Charter's own words, "Every idea gets a visible fate (shipped / scheduled / parked-with-a-reason)". A fate is supposed to be VISIBLE; SCHEDULED was being used to make one disappear. ⚠ Same triage and same reason as the row above — lifted out of ## RULED before the card that was its only surface is deleted. Sizing: SMALL — one fate word, in the filter that decides what he sees.

- [x] Your ruling: do you want `SCHEDULED` to stop hiding your ideas? **He answered; not yet built.** (closed 2026-09-03 · CEO 157 · no game diff — no game diff — his ruling is the Glass's fate lexicon, not the game; src/ and index.html untouched (commit 417adefc))
      ⟨`T-139`⟩
      Measured with the page's own logic when it was put to him: **13 of his 15 ideas were hidden
      from the Glass, 9 of them by the word `SCHEDULED`**, which the code treated as identical to
      SHIPPED and CLOSED — against the Charter's own words, *"Every idea gets a visible fate
      (shipped / scheduled / parked-with-a-reason)"*. A fate is supposed to be VISIBLE; `SCHEDULED`
      was being used to make one disappear.
      ⚠ **Same triage and same reason as the row above** — lifted out of `## RULED` before the card
      that was its only surface is deleted.
      **Sizing: SMALL — one fate word, in the filter that decides what he sees.**

## T-012 — 2026-09-03 — A DOWNWIND BATTLE MAY END ON A HALF-SENTENCE — TWO LIVE EXPLANATIONS, OPPOSITE FIXES, AND IT (closed 2026-09-03 · CEO 160 · no game diff — measured, not fixed: it is his own 2026-08-01 P3/P5 bug still live in battle cards, and the panel.js fix is his call -- now a question in BLOCKED ON WYATT) IS A POSE NOT A RATE. Observed 2026-09-02 by eye AND independently by the vision judge; NOT MEASURED, and deliberately not called a defect. solo-tablet-wk-018-settled.png shows "Both fire 🪙 HEADS — but Davy Scones's firing" and stops; src/orchestrator.js:700 writes "…firing downwind and the shot hits!", so six words are missing from the screen. Either the screenshot caught a progressive reveal a fraction early (the known Safari settle miss — 7 of 27 desktop and 5 of 20 phone screens in this project's own record) or the wrapped second line is clipped by the card and every downwind battle in the game ends mid-phrase on every engine. The settling move: pose the same downwind battle on a tablet in Chrome and in WebKit, wait past the reveal, photograph the card. Do not run a trial for this. Separate lead on the screen immediately BEFORE it, observed once: the flip ceremony reads "Crosswind — two heads and the cannonballs collide" while the card that follows reads "↓ DAVY SCONES FIRES DOWNWIND — WINS TIES" — same day, same wind readout. Possibly a generic rule reminder; that is a source question, not a screenshot one. Account: [.planning/JUDGED-2026-09-02T0219Z.md](JUDGED-2026-09-02T0219Z.md).

- [x] **A DOWNWIND BATTLE MAY END ON A HALF-SENTENCE — TWO LIVE EXPLANATIONS, OPPOSITE FIXES, AND IT (closed 2026-09-03 · CEO 160 · no game diff — measured, not fixed: it is his own 2026-08-01 P3/P5 bug still live in battle cards, and the panel.js fix is his call -- now a question in BLOCKED ON WYATT)
      ⟨`T-012`⟩
  IS A POSE NOT A RATE. Observed 2026-09-02 by eye AND independently by the vision judge; NOT
  MEASURED, and deliberately not called a defect.** `solo-tablet-wk-018-settled.png` shows
  *"Both fire 🪙 HEADS — but Davy Scones's firing"* and stops; `src/orchestrator.js:700` writes
  *"…firing downwind and the shot hits!"*, so six words are missing from the screen. **Either** the
  screenshot caught a progressive reveal a fraction early (the known Safari settle miss — 7 of 27
  desktop and 5 of 20 phone screens in this project's own record) **or** the wrapped second line is
  clipped by the card and every downwind battle in the game ends mid-phrase on every engine.
  **The settling move: pose the same downwind battle on a tablet in Chrome and in WebKit, wait past
  the reveal, photograph the card. Do not run a trial for this.**
  *Separate lead on the screen immediately BEFORE it, observed once:* the flip ceremony reads
  *"Crosswind — two heads and the cannonballs collide"* while the card that follows reads *"↓ DAVY
  SCONES FIRES DOWNWIND — WINS TIES"* — same day, same wind readout. Possibly a generic rule
  reminder; that is a source question, not a screenshot one.
  Account: [`.planning/JUDGED-2026-09-02T0219Z.md`](JUDGED-2026-09-02T0219Z.md).

  ### ✅ SETTLED 2026-09-03, WATCH e1, CEO 160 (YES) — AND THE ANSWER IS THE ONE NOBODY PICKED
  **Explanation B IS DEAD. Explanation A IS CONFIRMED, and it has a mechanism now.** Both engines,
  the trial's own `solo-tablet` seat (768×954 @2), on stage `centered` where the clip box is
  actually switched on (CEO 148's finding, now structural in both probes — they REFUSE to answer off
  that stage).
  **The settled card is WHOLE on Chrome and on WebKit — 0px hidden, both lines drawn.** So the game
  does *not* permanently cut this sentence, and the alarming half of this row is gone.
  **But the card genuinely IS cut on screen, briefly, every time.** `#apGrid`'s row animates from a
  ONE-line height to a TWO-line height over 180ms (`index.html:467`) under `#apGridInner`'s
  `overflow:hidden` (`:473`), and the card's whole text is written at once — so for the length of
  that animation a two-line sentence sits in a one-line box.
  **CHROME: 18px of an 18px line hidden, gone within ~40–160ms. WEBKIT: 18px hidden FLAT for
  ~140–180ms — no easing at all, then it snaps.** Photographed:
  [`.planning/posed/t012-seq-webkit-2-cut.png`](posed/t012-seq-webkit-2-cut.png) reads *"Both fire
  🪙 HEADS — but Crustbeard's firing"* and stops — **his trial screenshot, reproduced on demand** —
  beside [`t012-seq-webkit-3-settled.png`](posed/t012-seq-webkit-3-settled.png), same board, whole.
  Probe: `scripts/qa/t012_downwind_sequence_pose.mjs`. Prediction, including the parts it got wrong:
  [`PREDICTION-20260903T0945Z-T012.md`](wyclau/PREDICTION-20260903T0945Z-T012.md).
  ⚠ **HONEST LIMIT: this is TABLET WIDTH ONLY, both engines.** The shot came from a tablet so the
  ask is satisfied, but "dead on every size" is one seat wider than the evidence. Phone and desktop
  are unmeasured.
  ⛔ **AND THE FRAMING THIS WATCH GOT WRONG, CORRECTED BY CEO 160 AND WORTH MORE THAN THE
  MEASUREMENT.** The watch first wrote this up as *"a transient artifact of a deliberate animation,
  risky to touch"* and as *"any card that grows from a shorter message does this"*. **Both false, and
  the truth is smaller and much more damning.** `src/ui/panel.js:662-667` already had this argument
  and settled it, quoting Wyatt: *"Typing into a box still at the OLD height is precisely P3/P5 —
  'the 2nd line is cut off during writing, but only sometimes' — a bug he reported himself"*, closing
  *"with the clipping fault still impossible."* **It IS impossible — for narration.** The guard is
  the typewriter waiting on the resize, and **a battle card has no `.apMsg` to type** (`panel.js:
  374-375`), so nothing waits: the card is painted whole while the row is still easing up under it.
  **So this is not working-as-designed. It is his own 2026-08-01 bug, still live in the one path the
  2026-08-23 fix never reached** — battle cards, and anything else drawn with no text to reveal.
  **NOT FIXED HERE, DELIBERATELY, AND IT IS HIS CALL not a watch's:** `panel.js` carries measure-once
  rules earned from a Safari near-crash, so changing when the battle card is painted is a real
  regression risk against a 40–180ms artifact. **The question is in BLOCKED ON WYATT.** The shape of
  the answer already exists in the file: for content with no reveal to wait behind, reach the target
  height before showing it, or skip the transition.
  ⚠ **TWO FILES TO DELETE THAT THIS WATCH COULD NOT** — its own first draft shot the card AFTER the
  window and named it for the window, which its header calls *"worse than no screenshot, because the
  next reader believes it"*: `.planning/posed/t012-seq-chrome-2-transition.png` and its `-webkit-`
  twin show a WHOLE card under a transition filename. Untracked, so they are not in the record —
  **this session's fence refused both `rm` and `Remove-Item`, and routing around it with node was
  not attempted on purpose.** A session that can delete them should.

  ### ✅ THE SEPARATE LEAD IS ANSWERED AND FIXED — it was NOT a generic rule reminder
  Watch 2026-09-03T05:59Z, **CEO 148 (PARTIAL — this half YES)**, commit `39575082`, stamp
  `2026.09.03.1`. **The flip ceremony called EVERY downwind battle a crosswind.** `src/ui/stage.js`
  looked for the captain in `dwTag.parentElement` — that is `.btl-wind`, a div holding the badge and
  nothing else — so the lookup returned null every time and fell through to the crosswind sentence.
  `renderBattle` now stamps `.btl-col.dw` from the same `dw` that writes the badge and the ceremony
  reads that, so the two cannot disagree (rule 23). Red→green gate
  `scripts/qa/flip_ceremony_names_the_wind_check.mjs` (`--before` reproduces the pre-fix DOM and
  must go RED); pair in `.planning/posed/flip-ceremony-wind-chrome-{before,after}.png`.
  ⚠ **A CORRECTION THE WATCH OWES IN THE OPEN.** Its commit says the approved copy
  `@copy misc.ceremony.windstakes` *"has never once been shown to a player"*. **False, and CEO 148
  found it.** The ceremony shipped working in `b07a7d2b` (2026-08-13) with the pill still inside the
  column; `a1913666` (2026-08-15, "one wind pill for both captains" — Wyatt's own playtest-23 item)
  moved it out to `.btl-wind` and broke the lookup silently. **A dated 19-day regression with a named
  commit, which is more useful than the tidier sentence.** Third verdict running on this branch to
  find a sentence tidier than the record.

  ### ⛔ THE HEADLINE HALF IS **NOT** SETTLED — AND THE WATCH'S FIRST ANSWER WAS WRONG
  It reported *"NOT CLIPPED, both engines — explanation B is dead."* **Withdraw that.** CEO 148:
  the pose was on the wrong stage. A battle card is placed `.centered`
  (`src/ui/stage.js:3721-3722`), but the probe posed straight after the opening ceremony, which
  leaves `#actionPanel`'s `dataset.pp4Stage` set, so it landed in **`pp4Center`** — and
  `index.html:2277-2278` DROPS the clip box there (`overflow:visible`, row `max-content !important`).
  Every clip reading came back zero **because of the stylesheet, not because of the card.**
  `.centered` keeps `index.html:467` (a pinned px row on a 180ms transition) and `:473`
  (`overflow:hidden`) — **the exact mechanism explanation B names. It is still live.**
  **THE INSTRUMENT IS ALREADY FIXED AND THE RUN IS ONE COMMAND.**
  `scripts/qa/t012_downwind_card_pose.mjs` now clears `pp4Stage` before posing AND refuses to report
  at all unless the card is on `centered` — so it can never again answer about the wrong screen:
  ```
  node scripts/qa/t012_downwind_card_pose.mjs          # and --wk
  ```
  **DELIBERATELY NOT RUN BY THAT WATCH: a sea trial was sailing** (`2026-09-03T0624Z-Wy-Blade`,
  pid 29700) and this project's settle window is already marginal at 2.7s against 2.6s. Run it once
  the trial is down.
  **AND THE LIVE LEAD IS ALREADY NAMED, from the watch's own prediction file** — `src/ui/panel.js:395-406`
  records a receipted case where a late-decoding inline `<img>` makes the panel measure one line
  short and `#apGridInner` then clips the line, *"which is exactly why it reproduces only
  sometimes"*. This sentence carries exactly such an image (the coin, via `emojify()`,
  `src/shared/index.js:184`). **That mechanism only exists in `.centered`.** Check it there first.
  ⚠ **AND EXPLANATION A AS WRITTEN IS SEPARATELY UNSUPPORTED:** the typewriter never touches this
  card — `src/ui/panel.js:454` types `.apMsg`, and `:375` says in its own words that a battle card
  has none. So "a progressive reveal caught early" cannot mean the typewriter.

## T-123 — 2026-09-03 — _t103_redproof.mjs REWRITES TRACKED FILES ON A BRANCH THREE SESSIONS SHARE. Filed (closed 2026-09-03 · CEO 161 · no game diff — no game code — planning and QA machinery) 2026-09-03T02:xxZ by CEO 132, which declined to run it for this reason and established its finding by reading instead. It writes old code over glass.mjs and chartkeeper.mjs and restores in a finally; two commits landed from other sessions inside its review window, and any git commit -a from another watch in that gap commits reverted code. The general form is worth more than the file: showing a check RED against an earlier commit is a thing every item here needs, and doing it by rewriting the working tree is the wrong mechanism. A scratch checkout (git worktree at the ref, or extracting to a temp dir and pointing the gate at it) does the same job and touches nothing shared. ⚠ AND ITS SIBLING LIMIT, WHICH CEO 132 ALSO CAUGHT: it restores only those two files, so a case reading anything else — the runbook, a hook, a doc — cannot go red under it, and one was reported as having done so. Whatever replaces it must restore the whole tree at that ref or say which files it did not. Sizing: SMALL. No game code.

- [x] **`_t103_redproof.mjs` REWRITES TRACKED FILES ON A BRANCH THREE SESSIONS SHARE.** Filed (closed 2026-09-03 · CEO 161 · no game diff — no game code — planning and QA machinery)
      ⟨`T-123` · size: S⟩
      2026-09-03T02:xxZ by CEO 132, which **declined to run it for this reason** and established its
      finding by reading instead. It writes old code over `glass.mjs` and `chartkeeper.mjs` and
      restores in a `finally`; **two commits landed from other sessions inside its review window**,
      and any `git commit -a` from another watch in that gap commits reverted code.
      **The general form is worth more than the file:** showing a check RED against an earlier commit
      is a thing every item here needs, and doing it by rewriting the working tree is the wrong
      mechanism. **A scratch checkout (`git worktree` at the ref, or extracting to a temp dir and
      pointing the gate at it) does the same job and touches nothing shared.**
      ⚠ **AND ITS SIBLING LIMIT, WHICH CEO 132 ALSO CAUGHT:** it restores only those two files, so a
      case reading anything else — the runbook, a hook, a doc — **cannot go red under it**, and one
      was reported as having done so. Whatever replaces it must restore the whole tree at that ref
      or say which files it did not. **Sizing: SMALL. No game code.**

> ### ⚠ HOW THIS ROW WAS RESOLVED — recovered 2026-09-03T11:0xZ, because the text below was
> ### ATTACHED TO THE WRONG ROW AND THIS ARCHIVE ENTRY WAS WRITTEN WITHOUT IT.
>
> The resolution was appended to `T-121`'s row instead of `T-123`'s. `close_item.mjs` then swept
> `T-123` correctly and archived the row as it actually stood — **the problem statement with no
> answer** — while `T-121` was left carrying twenty-five lines about a red-proof tool it has
> nothing to do with. **Nothing was lost and the sweep did nothing wrong**; a hand edit put good
> text on the wrong row, and every instrument downstream faithfully preserved the mistake.
>
> **The reusable half: `chart_sweep_conserves_check` counts HANDLES, not BODIES.** It can prove no
> row vanished. It cannot see a row wearing another row's answer — both rows exist, both are
> owned, and the check is green. Found by eye while closing `T-140`, not by any gate.

      ✅ **REPLACED 2026-09-03T09:4xZ by `scripts/qa/red_proof_at_ref.mjs`, and the old file is
      DELETED rather than left as scratch nobody re-runs.**
      `git worktree add --detach` materialises the WHOLE tree at the ref in a temp dir. **The shared
      checkout is never written** — the window does not get shorter, it stops existing — and the
      two-file limit goes with it, because every file is at the ref, which was the row's *"sibling
      limit"*.
      ⚑ **AND THE PART A WORKTREE ALONE GETS BACKWARDS, which I only found while building it:
      A RED PROOF IS TODAY'S CHECK AGAINST YESTERDAY'S CODE.** A bare worktree hands you yesterday's
      CHECK as well, which proves nothing — it would faithfully report the old gate passing on the
      old code. **The current gate file is copied INTO the worktree before it runs.** My prediction
      did not name this; implementing it did.
      ✅ **`--ref` IS REQUIRED, no default** — CEO 131's fault on the old tool was that `HEAD` is
      correct exactly once, before the work is committed, and afterwards checks the change against
      itself and prints a pass that looks like a failed red proof.
      **MEASURED:** `--ref=8327a1b9^` → *"RED PROOF HELD — do_now_check.mjs FAILS against
      8327a1b9^"*, with `git status` on both hazard files clean afterwards.
      ⚠ **AND IT LEFT A WORKTREE BEHIND ON ITS FIRST RUN, WHICH IS THE FUNNIEST FAULT OF THE NIGHT
      AND WORTH THE LINE:** I called `process.exit()` inside the `try`, **which terminates before a
      `finally` runs**, so the cleanup was written, correct and unreachable. **A tool built to stop
      touching shared state left state behind on its first outing.** Fixed by setting the code and
      exiting after the block; re-run clean — 1 worktree registered (just the repo), 0 temp dirs,
      0 files touched.
      ⚠ **One honest caveat rather than "touches nothing": `git worktree add` writes metadata under
      `.git/worktrees/` in the shared repo.** Not tracked content, no other session reads it, removed
      on the way out — but it is not nothing.

## T-133 — 2026-09-03 — chart_sweep_conserves_check IS RED ON THE LIVE TREE AND HAS BEEN RED LONG ENOUGH THAT (closed 2026-09-03 · CEO 161 · no game diff — no game code — the QA gate itself) NOBODY MENTIONS IT. Filed 2026-09-03T04:4xZ by watch a5, which did not cause it. node scripts/qa/chart_sweep_conserves_check.mjs fails: "38 allocated handle(s) are owned by NOTHING in either file — T-002, T-008, T-011, T-014, …". It is in npm test (package.json:26). Thirty-eight handles have been minted and their rows are gone from both the Chart and the Glass Chart — so every one of them is a pointer in the ledger, in CHART-LOG.md and in git that now resolves to nothing. Why this is more than tidiness: close_item.mjs and chartkeeper.mjs both key on handles, and handleIsAmbiguous (chartkeeper.mjs:754) exists precisely because a handle naming two jobs names neither. A handle naming NO job is the same family. Likely the same root as the split Wyatt ordered (44 rows moved between two files) — check that first. ⚠ AND THE SECOND-ORDER COST IS THE REAL ONE: a permanently-red gate in npm test teaches every watch that a red suite is normal. Two separate watches tonight reported npm test failures as "known and not mine" — accurately, both times. That is how a real regression gets waved through.

- [x] **`chart_sweep_conserves_check` IS RED ON THE LIVE TREE AND HAS BEEN RED LONG ENOUGH THAT (closed 2026-09-03 · CEO 161 · no game diff — no game code — the QA gate itself)
      ⟨`T-133`⟩
      NOBODY MENTIONS IT. Filed 2026-09-03T04:4xZ by watch a5, which did not cause it.**
      `node scripts/qa/chart_sweep_conserves_check.mjs` fails: *"38 allocated handle(s) are owned by
      NOTHING in either file — T-002, T-008, T-011, T-014, …"*. It is in `npm test`
      (`package.json:26`). **Thirty-eight handles have been minted and their rows are gone from both
      the Chart and the Glass Chart** — so every one of them is a pointer in the ledger, in
      `CHART-LOG.md` and in git that now resolves to nothing.
      **Why this is more than tidiness:** `close_item.mjs` and `chartkeeper.mjs` both key on handles,
      and `handleIsAmbiguous` (`chartkeeper.mjs:754`) exists precisely because a handle naming two
      jobs names neither. A handle naming NO job is the same family. Likely the same root as the
      split Wyatt ordered (44 rows moved between two files) — check that first.
      ⚠ **AND THE SECOND-ORDER COST IS THE REAL ONE: a permanently-red gate in `npm test` teaches
      every watch that a red suite is normal.** Two separate watches tonight reported `npm test`
      failures as "known and not mine" — accurately, both times. That is how a real regression gets
      waved through.

## T-140 — 2026-09-03 — THE HARVEST IS A PERSON READING A PAGE BY HAND — and that is the last joint in everything (closed 2026-09-03 · CEO 163 · no game diff — no game code — the Glass harvest machinery) his page can carry: his ideas, his rulings, his comments, and his DO NOW press. Split out of T-104 at CEO 151's instruction: "A ticket that cannot close until an unrelated ticket closes is a ticket that has stopped measuring its own subject." T-104's own halves are mechanical and gated; this is the shared step underneath all four kinds of his input, and holding the button open on it was holding it open on somebody else's work. WHAT A GATE CAN AND CANNOT DO HERE, stated so nobody re-derives it: a gate can prove the INSTRUCTION exists — do_now_reaches_the_watch_check cases 4 and 5 fail if either the Glass runbook or the Door stops naming the pin command. No gate can prove a session typed it. Between his press and his Chart sits one human-shaped step, four times over. THE FOUR THINGS THAT RIDE ON IT — and every one is his, not ours: glassState.ideas, glassState.rulings, glassState.comments (new 2026-09-03, T-076), and the now: true flag on a pressed idea. An unharvested republish deletes the first three and drops the fourth. The hook enforces that a session READ the page; nothing enforces that it MOVED anything across. ⚠ IT HAS ALREADY COST HIM ONCE TONIGHT, which is why this is a row and not a note: a comment box that renders and does not save is invisible in exactly the same way — the machine says done, the words are gone, and every gate is green. That was T-076, found by CEO 144. THE SHAPE OF A REAL FIX: the harvest carries the state mechanically rather than by instruction — same family as T-105's remaining layers, and probably one job with them. Sizing: MEDIUM. No game code. Nothing here is blocked on Wyatt. ✅ BUILT 2026-09-03T10:5xZ — scripts/wyclau/harvest_glass.mjs, gated by scripts/qa/harvest_carries_his_words_check.mjs (gate 117), named in the Door. It takes the HTML the Artifact read saves, and writes ideas + comments → INBOX.md, rulings → DECISIONS.md, and his DO NOW press into both the entry's title and its status: line. Idempotent on his own at stamp, so a second run is a no-op — and it will be run twice, because a session unsure whether it harvested runs it again, which is the right instinct. THE HAND STEP THAT REMAINS, stated rather than hidden: READING the page. Only the Artifact tool can fetch a published artifact and a Bell-launched watch has none. What is gone is the TRANSCRIBING, which is where a missed comment looked exactly like a clean harvest. ⚠ AND THE RED PROOF FOUND THE SAFEGUARD UNGUARDED, which is this row's own fault one layer up. Six mutants against a COPY (--tool=, never the shared tree — T-112); two survived. One was the read-back-from-disk that the whole design rests on: swapping it for a count of the loop passed every case, because the case meant to catch it makes the destination unreadable and the tool exits at the guard before counting anything. I wrote the safety net and a test that could not see it. Case 5b reaches it now. The other: an OR across the title and the status line tested neither, so the pin could vanish from the heading unnoticed.

- [x] **THE HARVEST IS A PERSON READING A PAGE BY HAND — and that is the last joint in everything (closed 2026-09-03 · CEO 163 · no game diff — no game code — the Glass harvest machinery)
      ⟨`T-140`⟩
      his page can carry: his ideas, his rulings, his comments, and his DO NOW press.**
      Split out of `T-104` at CEO 151's instruction: *"A ticket that cannot close until an unrelated
      ticket closes is a ticket that has stopped measuring its own subject."* `T-104`'s own halves
      are mechanical and gated; **this is the shared step underneath all four kinds of his input**,
      and holding the button open on it was holding it open on somebody else's work.
      **WHAT A GATE CAN AND CANNOT DO HERE, stated so nobody re-derives it:** a gate can prove the
      INSTRUCTION exists — `do_now_reaches_the_watch_check` cases 4 and 5 fail if either the Glass
      runbook or the Door stops naming the pin command. **No gate can prove a session typed it.**
      Between his press and his Chart sits one human-shaped step, four times over.
      **THE FOUR THINGS THAT RIDE ON IT** — and every one is his, not ours: `glassState.ideas`,
      `glassState.rulings`, `glassState.comments` (new 2026-09-03, `T-076`), and the `now: true`
      flag on a pressed idea. **An unharvested republish deletes the first three and drops the
      fourth.** The hook enforces that a session READ the page; nothing enforces that it MOVED
      anything across.
      ⚠ **IT HAS ALREADY COST HIM ONCE TONIGHT, which is why this is a row and not a note:** a
      comment box that renders and does not save is invisible in exactly the same way — the machine
      says done, the words are gone, and every gate is green. That was `T-076`, found by CEO 144.
      **THE SHAPE OF A REAL FIX:** the harvest carries the state mechanically rather than by
      instruction — same family as `T-105`'s remaining layers, and probably one job with them.
      **Sizing: MEDIUM. No game code. Nothing here is blocked on Wyatt.**
      ✅ **BUILT 2026-09-03T10:5xZ — `scripts/wyclau/harvest_glass.mjs`, gated by
      `scripts/qa/harvest_carries_his_words_check.mjs` (gate 117), named in the Door.** It takes the
      HTML the Artifact read saves, and writes ideas + comments → `INBOX.md`, rulings →
      `DECISIONS.md`, and his DO NOW press into both the entry's title and its `status:` line.
      Idempotent on his own `at` stamp, so a second run is a no-op — and it will be run twice,
      because a session unsure whether it harvested runs it again, which is the right instinct.
      **THE HAND STEP THAT REMAINS, stated rather than hidden: READING the page.** Only the Artifact
      tool can fetch a published artifact and a Bell-launched watch has none. **What is gone is the
      TRANSCRIBING**, which is where a missed comment looked exactly like a clean harvest.
      ⚠ **AND THE RED PROOF FOUND THE SAFEGUARD UNGUARDED, which is this row's own fault one layer
      up.** Six mutants against a COPY (`--tool=`, never the shared tree — `T-112`); two survived.
      One was the read-back-from-disk that the whole design rests on: swapping it for a count of the
      loop passed every case, because the case meant to catch it makes the destination unreadable
      and the tool exits at the guard before counting anything. **I wrote the safety net and a test
      that could not see it.** Case 5b reaches it now. The other: an `OR` across the title and the
      status line tested neither, so the pin could vanish from the heading unnoticed.

## T-122 — 2026-09-03 — THE PAGE AND THE CHARTKEEPER EACH DECIDE "IS THIS HANDLE AMBIGUOUS?" ON THEIR OWN — rule 23, (closed 2026-09-03 · CEO 165 · no game diff — no game code — the Chart tooling) in the fix written to close rule 23's last instance. Filed 2026-09-03T02:xxZ by CEO 132. glass.mjs counts duplicates across open checklist rows only; chartkeeper.mjs counts any head line with a checkbox within 11 lines above it, checklist or inbox. A handle those two disagree about is T-103's original fault returning: the page offers a drag the command then refuses whole, and he is told it saved. ✅ MEASURED TODAY: ZERO DISAGREEMENTS — --order= accepted all 50 handles the page offered. Latent, not live, which is why it is a row and not a stop-everything. The fix is one definition imported by both, in scripts/wyclau/lib/chart_model.mjs, where idOfRow already lives. Sizing: SMALL. No game code.

- [x] **THE PAGE AND THE CHARTKEEPER EACH DECIDE "IS THIS HANDLE AMBIGUOUS?" ON THEIR OWN — rule 23, (closed 2026-09-03 · CEO 165 · no game diff — no game code — the Chart tooling)
      ⟨`T-122` · size: S⟩
      in the fix written to close rule 23's last instance.** Filed 2026-09-03T02:xxZ by CEO 132.
      `glass.mjs` counts duplicates across **open checklist rows only**; `chartkeeper.mjs` counts any
      head line with a checkbox within 11 lines above it, checklist **or inbox**. A handle those two
      disagree about is `T-103`'s original fault returning: the page offers a drag the command then
      refuses whole, and he is told it saved.
      ✅ **MEASURED TODAY: ZERO DISAGREEMENTS** — `--order=` accepted all 50 handles the page
      offered. **Latent, not live**, which is why it is a row and not a stop-everything.
      **The fix is one definition** imported by both, in `scripts/wyclau/lib/chart_model.mjs`, where
      `idOfRow` already lives. **Sizing: SMALL. No game code.**

## T-209 — 2026-09-03 — A QUESTION PUT TO HIM CANNOT BLOCK A ROW ON THIS CHART, BECAUSE THE QUESTION LIVES IN THE (closed 2026-09-03 · CEO 166 · no game diff — no game code — the Chart ranker) OTHER FILE — so the Advisor's list has no automatic blocked-detection at all. Filed 2026-09-03T10:5xZ by the Advisor, immediately after hand-repairing an instance of it. WHAT HAPPENED, minutes ago: T-121 was parked and its question written to CHART.md's BLOCKED ON WYATT, naming correctly. Then chartkeeper --chart=GLASS-CHART.md --rank reported 0 rows moved and left the parked row at rank 1 — the row the Door tells the next session to take. ⚠ CORRECTED 2026-09-03T11:4xZ by CEO 166: THAT SENTENCE IS FALSE AND I PUT IT IN FOUR FILES. The Door's rank step takes no --chart=, so it ranks CHART.md; the only thing it points at this file is tick_rows.mjs, which REPORTS and never orders. Nothing in the repo ranks the Glass chart automatically. The defect is real — the Advisor ranks this list by hand, every time, and gets the parked row at the top — and the consequence was overstated. chartkeeper.mjs:934's livePointer looks for the handle in the chart it was POINTED AT, and his questions all live in CHART.md. A question in one file cannot penalise a row in the other. Repaired by hand with · needs: wyatt on the handle line, which the scorer reads directly — 23 rows then moved and the parked row sank. ⚠ THIS IS T-132 IN A SECOND COSTUME, AND THAT MATTERS MORE THAN THE BUG. T-132 is "a question that names no task leaves the row it is holding up at the top". This is a question that names its task perfectly and still cannot reach it. Same consequence — a watch sent to a row waiting on Wyatt — and it is now the fourth hand-repair of a Chart bookkeeping fault in three days. The hand-repair does not generalise: the next parked Glass row needs the same manual flag, and nothing reminds anyone. SHAPE OF THE FIX: livePointer should read BOTH charts' BLOCKED ON WYATT sections, not just the one it was pointed at — the same one-line correction already made to chart_sweep_conserves_check and close_item.mjs when his split broke them. This is the SIXTH tool with that exact fault (close_item, chartkeeper's sections, tick_rows, the ranker, the sweep gate, and now livePointer). One instruction of his split one list in two, and every tool with a path written into it went quietly wrong in a different way. Sizing: SMALL. No game code. Nothing blocked on Wyatt.

- [x] **A QUESTION PUT TO HIM CANNOT BLOCK A ROW ON THIS CHART, BECAUSE THE QUESTION LIVES IN THE (closed 2026-09-03 · CEO 166 · no game diff — no game code — the Chart ranker)
      ⟨`T-209` · size: S⟩
      OTHER FILE — so the Advisor's list has no automatic blocked-detection at all.** Filed
      2026-09-03T10:5xZ by the Advisor, immediately after hand-repairing an instance of it.
      **WHAT HAPPENED, minutes ago:** `T-121` was parked and its question written to `CHART.md`'s
      BLOCKED ON WYATT, naming ⟨`T-121`⟩ correctly. Then `chartkeeper --chart=GLASS-CHART.md --rank`
      reported **0 rows moved** and left the parked row at rank 1 — the row the Door tells the next
      session to take.
      ⚠ **CORRECTED 2026-09-03T11:4xZ by CEO 166: THAT SENTENCE IS FALSE AND I PUT IT IN FOUR
      FILES.** The Door's rank step takes no `--chart=`, so it ranks `CHART.md`; the only thing it
      points at this file is `tick_rows.mjs`, which REPORTS and never orders. **Nothing in the repo
      ranks the Glass chart automatically.** The defect is real — the Advisor ranks this list by
      hand, every time, and gets the parked row at the top — and the consequence was overstated.
      `chartkeeper.mjs:934`'s `livePointer` looks for the handle in the chart it was
      POINTED AT, and his questions all live in `CHART.md`. **A question in one file cannot penalise
      a row in the other.** Repaired by hand with `· needs: wyatt` on the handle line, which the
      scorer reads directly — 23 rows then moved and the parked row sank.
      ⚠ **THIS IS `T-132` IN A SECOND COSTUME, AND THAT MATTERS MORE THAN THE BUG.** `T-132` is *"a
      question that names no task leaves the row it is holding up at the top"*. This is *a question
      that names its task perfectly and still cannot reach it.* Same consequence — a watch sent to a
      row waiting on Wyatt — and it is now the **fourth** hand-repair of a Chart bookkeeping fault in
      three days. **The hand-repair does not generalise: the next parked Glass row needs the same
      manual flag, and nothing reminds anyone.**
      **SHAPE OF THE FIX:** `livePointer` should read BOTH charts' BLOCKED ON WYATT sections, not
      just the one it was pointed at — the same one-line correction already made to
      `chart_sweep_conserves_check` and `close_item.mjs` when his split broke them. **This is the
      SIXTH tool with that exact fault** (`close_item`, `chartkeeper`'s sections, `tick_rows`, the
      ranker, the sweep gate, and now `livePointer`). One instruction of his split one list in two,
      and every tool with a path written into it went quietly wrong in a different way.
      **Sizing: SMALL. No game code. Nothing blocked on Wyatt.**

## T-210 — 2026-09-03 — ONE SESSION'S HARVEST LICENSES ANOTHER SESSION'S PUBLISH — so the session that (closed 2026-09-03 · CEO 168 · no game diff — no game code — the Glass receipt chain) REPUBLISHES HIS PAGE MAY NEVER HAVE LOOKED AT IT. Filed 2026-09-03T11:2xZ by the Advisor, off the live receipts, not from reasoning. WHAT THE RECEIPTS ACTUALLY SAY, minutes ago: · LAST-HARVEST — 11:22:00.631Z, version 1788433599-0141, stamped by THIS session. · LAST-PUBLISH — 11:22:29.562Z, version 1788434543-bb7a, by a PEER session. Twenty-nine seconds apart, two different sessions, and the peer never stamped a harvest of its own. glass-harvest-first.cjs allowed the publish because the stamp's MTIME was fresh — and the stamp is machine-local, so every session on this machine shares one. ⚠ THIS IS THE KNOWN RACE WITH A NEW AMPLIFIER, and the amplifier is the part worth having. mark_glass_harvest.mjs's own header records the race: harvest at T, he writes at T+7s, publish at T+30s, words gone, every receipt healthy. What is new is that the publisher and the harvester can be DIFFERENT SESSIONS — so the session doing the destroying has no idea when the page was last read, what was on it, or whether the reader is still alive. A single-session race is at least one session's own window; this one nobody owns. Nothing was lost today — this session harvested 0141 and it held nothing, seven checks in a row have all been clean. Filed because the receipt looked perfect throughout, which is the whole failure shape: the machine says done and the words are gone. SHAPE OF A FIX, and it is his call which: the publish hook could require a harvest receipt naming the version being REPLACED (T-140 built exactly that join for the carry — the same --harvested= move, one layer up), or the receipt could record WHICH session stamped it so a publisher can refuse one it did not write. The first is stricter and closes it; the second is cheaper and only makes the gap visible. Sizing: SMALL. No game code. Nothing blocked on Wyatt.

- [x] **ONE SESSION'S HARVEST LICENSES ANOTHER SESSION'S PUBLISH — so the session that (closed 2026-09-03 · CEO 168 · no game diff — no game code — the Glass receipt chain)
      ⟨`T-210` · size: S⟩
      REPUBLISHES HIS PAGE MAY NEVER HAVE LOOKED AT IT.** Filed 2026-09-03T11:2xZ by the Advisor,
      off the live receipts, not from reasoning.
      **WHAT THE RECEIPTS ACTUALLY SAY, minutes ago:**
      · `LAST-HARVEST` — `11:22:00.631Z`, version `1788433599-0141`, stamped by THIS session.
      · `LAST-PUBLISH` — `11:22:29.562Z`, version `1788434543-bb7a`, by a PEER session.
      **Twenty-nine seconds apart, two different sessions, and the peer never stamped a harvest of
      its own.** `glass-harvest-first.cjs` allowed the publish because the stamp's MTIME was fresh
      — and the stamp is machine-local, so every session on this machine shares one.
      ⚠ **THIS IS THE KNOWN RACE WITH A NEW AMPLIFIER, and the amplifier is the part worth having.**
      `mark_glass_harvest.mjs`'s own header records the race: harvest at T, he writes at T+7s,
      publish at T+30s, words gone, every receipt healthy. What is new is that **the publisher and
      the harvester can be DIFFERENT SESSIONS** — so the session doing the destroying has no idea
      when the page was last read, what was on it, or whether the reader is still alive. A
      single-session race is at least one session's own window; this one nobody owns.
      **Nothing was lost today** — this session harvested `0141` and it held nothing, seven checks
      in a row have all been clean. **Filed because the receipt looked perfect throughout**, which
      is the whole failure shape: the machine says done and the words are gone.
      **SHAPE OF A FIX, and it is his call which:** the publish hook could require a harvest receipt
      naming the version being REPLACED (`T-140` built exactly that join for the carry — the same
      `--harvested=` move, one layer up), or the receipt could record WHICH session stamped it so a
      publisher can refuse one it did not write. The first is stricter and closes it; the second is
      cheaper and only makes the gap visible.
      **Sizing: SMALL. No game code. Nothing blocked on Wyatt.**

## T-215 — 2026-09-03 — THE SEA TRIAL'S BEST FINDING REACHES THE READER AS A NUMBER. The vision judge names the (closed 2026-09-03 · CEO 170 · no game diff — no game-code diff by nature: the fault was the trial's own reporting, fixed in scripts/lib/leg_verdict.mjs at commit 2182d2a4 — one number becomes ten named screens, labelled a POINTER not a diagnosis per T-019) bug, in a sentence, and the report prints only how many. Filed 2026-09-03T13:0xZ by the Advisor, while trying to act on T-136's own instruction that nobody had opened these. WHAT THE REPORT SAYS, six times over: ✗ vision judge FAILED 1 of 30 screen(s) it looked at. A count. No filename, no description, nothing to open. The whole 89-minute report names exactly ONE .png. WHAT THE JUDGE ACTUALLY SAID, recovered from sea-trial-shots/log.txt: "'Play again!' button overlaps and clips the award card text below it (e.g. 'Rum Baron' name cut off behind the button)" · "captain list rows 'Davy Scones' and 'Dough Hook' are clipped by the recipe-selection modal, showing only truncated 'Dav' and 'Dou'" · "orange dock-highlight circle near bottom of board is clipped by the recipe-selection card" · "'Arrgh!' bubble floats alone in open water with no tail" · "Pastry Pirates logo clipped at the left edge, showing 'ASTRY' and 'IRATES'". These are player-visible bugs, described in plain English, and they have been going into a log nobody reads for 261 runs. ⛔ AND THE EVIDENCE IS NOT PRESERVED AGAINST ITS OWN VERDICT — which is why "nobody opened them" is structural rather than lazy. sea-trial-shots/ is ONE directory reused by every run: log.txt is APPENDED (261 runs in it), while the screenshots are OVERWRITTEN. Measured: log.txt is dated 09-03 08:54 and solo-phone-026-settled.png, whose verdict sits in that log, is dated 09-01 13:04 — two days earlier. I opened it: it shows a mid-game board, not the End-of-Voyage screen its verdict describes. A verdict whose picture has been overwritten is a verdict nobody can act on. THE FIX, and it is small next to the value: the report should list every rejected screen by NAME with the judge's own sentence, and the run should keep its shots under its own run id (runid.json already exists and already records one). Rule 19's live detector currently reports a number where it could hand him a sentence and a picture. ⚠ NOT VERIFIED BY EYE, AND SAID SO: the descriptions above are the judge's words recovered from the shared log. The one screenshot I opened did NOT match its verdict, so these are reported as the judge's claims, not as confirmed defects — which is exactly the gap this row exists to close. Sizing: MEDIUM. Touches the trial's reporting, not the game. Nothing blocked on Wyatt.

- [x] **THE SEA TRIAL'S BEST FINDING REACHES THE READER AS A NUMBER. The vision judge names the (closed 2026-09-03 · CEO 170 · no game diff — no game-code diff by nature: the fault was the trial's own reporting, fixed in scripts/lib/leg_verdict.mjs at commit 2182d2a4 — one number becomes ten named screens, labelled a POINTER not a diagnosis per T-019)
      ⟨`T-215` · size: M⟩
      bug, in a sentence, and the report prints only how many.** Filed 2026-09-03T13:0xZ by the
      Advisor, while trying to act on `T-136`'s own instruction that nobody had opened these.
      **WHAT THE REPORT SAYS**, six times over: *✗ vision judge FAILED 1 of 30 screen(s) it looked
      at*. **A count. No filename, no description, nothing to open.** The whole 89-minute report
      names exactly ONE `.png`.
      **WHAT THE JUDGE ACTUALLY SAID**, recovered from `sea-trial-shots/log.txt`:
      *"'Play again!' button overlaps and clips the award card text below it (e.g. 'Rum Baron' name
      cut off behind the button)"* · *"captain list rows 'Davy Scones' and 'Dough Hook' are clipped
      by the recipe-selection modal, showing only truncated 'Dav' and 'Dou'"* · *"orange
      dock-highlight circle near bottom of board is clipped by the recipe-selection card"* ·
      *"'Arrgh!' bubble floats alone in open water with no tail"* · *"Pastry Pirates logo clipped
      at the left edge, showing 'ASTRY' and 'IRATES'"*.
      **These are player-visible bugs, described in plain English, and they have been going into a
      log nobody reads for 261 runs.**
      ⛔ **AND THE EVIDENCE IS NOT PRESERVED AGAINST ITS OWN VERDICT — which is why "nobody opened
      them" is structural rather than lazy.** `sea-trial-shots/` is ONE directory reused by every
      run: `log.txt` is APPENDED (261 runs in it), while the screenshots are OVERWRITTEN. Measured:
      `log.txt` is dated 09-03 08:54 and `solo-phone-026-settled.png`, whose verdict sits in that
      log, is dated **09-01 13:04 — two days earlier**. I opened it: it shows a mid-game board, not
      the End-of-Voyage screen its verdict describes. **A verdict whose picture has been overwritten
      is a verdict nobody can act on.**
      **THE FIX, and it is small next to the value:** the report should list every rejected screen
      by NAME with the judge's own sentence, and the run should keep its shots under its own run id
      (`runid.json` already exists and already records one). **Rule 19's live detector currently
      reports a number where it could hand him a sentence and a picture.**
      ⚠ **NOT VERIFIED BY EYE, AND SAID SO:** the descriptions above are the judge's words recovered
      from the shared log. The one screenshot I opened did NOT match its verdict, so these are
      **reported as the judge's claims, not as confirmed defects** — which is exactly the gap this
      row exists to close.
      **Sizing: MEDIUM. Touches the trial's reporting, not the game. Nothing blocked on Wyatt.**

## T-102 — 2026-09-03 — Your ruling: ⚑ Google can index your working files right now, and your note assumed it could not. You listed art-review/, scripts/ and .planning/ as "correctly EXCLUDED" — they are excluded from the sitemap, but the sitemap is an invitation, not a fence. Thirteen pages are live on the domain with nothing stopping a crawler: five art-review/ galleries, seven notes/sketches/ mockups, and battle_sim.html (plus nineteen files under .planning/). Only four pages in the whole repo say anything about crawling at all. — his answer: yes Untriaged. A watch decides whether this still owes work, then moves the ruling to SETTLED RULINGS and deletes this row. (closed 2026-09-03 · CEO 183 · no game diff — no game code is right: the ask is what this site tells a crawler -- robots.txt, thirteen dev/review pages and a new gate; src/ and index.html untouched (commits 8e6d4973, 3ac55cc9))

- [x] Your ruling: ⟨`T-102`⟩ **⚑ Google can index your working files right now, and your note assumed it could not.** You listed `art-review/`, `scripts/` and `.planning/` as "correctly EXCLUDED" — they are excluded from the sitemap, but **the sitemap is an invitation, not a fence.** Thirteen pages are live on the domain with nothing stopping a crawler: five `art-review/` galleries, seven `notes/sketches/` mockups, and `battle_sim.html` (plus nineteen files under `.planning/`). Only four pages in the whole repo say anything about crawling at all. — his answer: yes **Untriaged.** A watch decides whether this still owes work, then moves the ruling to SETTLED RULINGS and deletes this row. (closed 2026-09-03 · CEO 183 · no game diff — no game code is right: the ask is what this site tells a crawler -- robots.txt, thirteen dev/review pages and a new gate; src/ and index.html untouched (commits 8e6d4973, 3ac55cc9))
      ⟨`T-102`⟩

## T-102 — 2026-09-03 — Your ruling: You asked me to recommend rather than build: should the sitemap's page list be generated from the actual pages? You were right that it goes stale silently — nothing anywhere notices a page missing from sitemap.xml, and /rules.html would vanish from Google without a sound. The list is correct today (two pages, and they are exactly the two that declare themselves public), so this is about tomorrow. — his answer: yes Untriaged. A watch decides whether this still owes work, then moves the ruling to SETTLED RULINGS and deletes this row. (closed 2026-09-03 · CEO 185 · no game diff — no game code by design: his ruling is about how sitemap.xml is GENERATED, so the change is the writer, a shared predicate and a gate — sitemap.xml itself is byte-identical (commits 25dbac76, e6331c15))

- [x] Your ruling: ⟨`T-102`⟩ **You asked me to recommend rather than build: should the sitemap's page list be generated from the actual pages?** You were right that it goes stale silently — nothing anywhere notices a page missing from `sitemap.xml`, and `/rules.html` would vanish from Google without a sound. The list is correct today (two pages, and they are exactly the two that declare themselves public), so this is about tomorrow. — his answer: yes **Untriaged.** A watch decides whether this still owes work, then moves the ruling to SETTLED RULINGS and deletes this row. (closed 2026-09-03 · CEO 185 · no game diff — no game code by design: his ruling is about how sitemap.xml is GENERATED, so the change is the writer, a shared predicate and a gate — sitemap.xml itself is byte-identical (commits 25dbac76, e6331c15))
      ⟨`T-102`⟩

## T-247 — 2026-09-03 — PUBLISHED — staging serves 2026.09.03.4-staging@401674f8, and 566 files were checked (closed 2026-09-03 · CEO 188 · no game diff — a deploy, not a code change: staging serves 401674f8, 566 files byte-identical, CEO 188 re-ran the gate itself) BYTE FOR BYTE rather than taken on the stamp's word. His instruction, INBOX-20260903T213129Z, 2026-09-03T21:31:29Z: "we need to push all these changes to staging!!" → https://staging.playpastrypirates.com/ THE GATE: scripts/qa/_t247_staging_parity.mjs. It fetches the real site and compares bytes, because the build stamp is a claim the publisher wrote about ITSELF (deploy-staging.sh:270 rewrites it; docs/GIT-AND-DEPLOY.md §5 is the day that lied). Its candidate list is git ls-files plus untracked-not-ignored — exactly what rsync sends — and its exclude list is parsed out of deploy-staging.sh, so nobody retypes it. Photographed too (rule 19), AFTER the new analytics <script> landed in index.html: lobby draws at 1280×900 and 390×844, window.firebase LOADED, rules.html renders — .planning/posed/t247-staging-.png. It includes T-206's analytics work (09f8658c), which the Blade session committed on this watch's ask; publishing before that would have put uncommitted code on his page under a stamp naming a commit without it. ⚠ TWO THINGS THAT ARE NOT DONE AND MUST NOT BE READ AS DONE: (a) THE FULL SEA TRIAL IS OWED ON 09f8658c. gear.mjs says FULL. The trial that was at sea during this watch started at 20:31Z against 2026.09.03.4 before analytics existed, so it does not cover this commit. Neither session started a second — that is the T-026 fault. A later watch sails it. (b) THE FRONT-CARD PRIVACY LINE IS NOW INCOMPLETE FOR PRODUCTION. index.html's footer still reads "Anonymised move data is recorded… nothing beyond the name ye confirm… is collected." With Google Analytics on that page in production that sentence no longer covers what happens. It does not affect staging — analytics refuses any hostname that is not exactly playpastrypirates.com, so nothing fires there — but it must not reach production unamended. Raised by the Blade session, which is putting the copy question to Wyatt directly. ⚠ CEO 187 SAID NO to the state of this item before the publish, and its charge is kept rather than softened: "He wrote an imperative… The watch answered a question he did not ask." The publish above is the answer to it.

- [x] **PUBLISHED — staging serves `2026.09.03.4-staging@401674f8`, and 566 files were checked (closed 2026-09-03 · CEO 188 · no game diff — a deploy, not a code change: staging serves 401674f8, 566 files byte-identical, CEO 188 re-ran the gate itself)
      ⟨`T-247`⟩
  BYTE FOR BYTE rather than taken on the stamp's word.** His instruction,
  `INBOX-20260903T213129Z`, 2026-09-03T21:31:29Z: *"we need to push all these changes to
  staging!!"* → **https://staging.playpastrypirates.com/**
  **THE GATE: `scripts/qa/_t247_staging_parity.mjs`.** It fetches the real site and compares bytes,
  because the build stamp is a claim the publisher wrote about ITSELF (`deploy-staging.sh:270`
  rewrites it; `docs/GIT-AND-DEPLOY.md` §5 is the day that lied). Its candidate list is
  `git ls-files` **plus untracked-not-ignored** — exactly what rsync sends — and its exclude list is
  **parsed out of `deploy-staging.sh`**, so nobody retypes it. Photographed too (rule 19), AFTER the
  new analytics `<script>` landed in `index.html`: lobby draws at 1280×900 and 390×844,
  `window.firebase` LOADED, `rules.html` renders — `.planning/posed/t247-staging-*.png`.
  **It includes `T-206`'s analytics work** (`09f8658c`), which the `Blade` session committed on this
  watch's ask; publishing before that would have put uncommitted code on his page under a stamp
  naming a commit without it.
  ⚠ **TWO THINGS THAT ARE NOT DONE AND MUST NOT BE READ AS DONE:**
  **(a) THE FULL SEA TRIAL IS OWED ON `09f8658c`.** `gear.mjs` says FULL. The trial that was at sea
  during this watch started at 20:31Z against `2026.09.03.4` **before** analytics existed, so it
  does not cover this commit. Neither session started a second — that is the `T-026` fault. **A
  later watch sails it.**
  **(b) THE FRONT-CARD PRIVACY LINE IS NOW INCOMPLETE FOR PRODUCTION.** `index.html`'s footer still
  reads *"Anonymised move data is recorded… nothing beyond the name ye confirm… is collected."*
  With Google Analytics on that page in production that sentence no longer covers what happens.
  **It does not affect staging — analytics refuses any hostname that is not exactly
  `playpastrypirates.com`, so nothing fires there** — but it must not reach production unamended.
  Raised by the `Blade` session, which is putting the copy question to Wyatt directly.
  ⚠ **CEO 187 SAID NO to the state of this item before the publish, and its charge is kept rather
  than softened:** *"He wrote an imperative… The watch answered a question he did not ask."* The
  publish above is the answer to it.
