# Handoff — 2026-08-21 afternoon (written so Wyatt can clear a very long session)

**Read first:** `.claude/CLAUDE.md`, `docs/HARD-WON-LESSONS.md` (the 2026-08-21 entry), then this file.
**Live build when this was written:** `PP4_STAMP` **`2026-08-20t`** (desktop coordinate fix `s` + end-of-
voyage card, dock flip 1/3 `t`). `u` (desktop layout, D-31) may have landed since — check `git log`.

## What happened today, in one screen

- Overnight: 02.15-02 (prompt seam, pick channel converged) → Q tail → B → C → C′; three whole voyages;
  final QA found and fixed a nine-day-old trade softlock. Morning report is in the session transcript;
  the record is in each plan's SUMMARY and `02.15-VERIFICATION.md`.
- 7am: Wyatt's PDF (`notes/edits for pastry pirates 8-21-7am.pdf`) — RED ALERT: desktop cap (item 22)
  put every boat-anchored overlay in the wrong coordinate space. Fixed at one seam (`toScreen()` +
  `fixedRect()`), shipped `s`. `.planning/debug/resolved/desktop-radial-fan-offset.md`.
- Economy: his lever was the DOCK FLIP, not crate price. Band metric (1–3 priced-out moments per
  captain) → his 1/3 wins (41% in band). Shipped `t`. **D-30** = the philosophy: priced-out is pressure,
  not a defect. `02.2-ECONOMY-TABLE.md` (second dated section).
- Real-mouse QA (`4/scripts/mouse_qa.mjs` — kept in the repo; usage `node 4/scripts/mouse_qa.mjs <outdir> <W> <H> <port> <dbgport>`,
  headless + muted by default; pattern described in `02.2-MOUSE-QA-2026-08-21.md`): three whole voyages at 960/1400/1920, 0 findings.
  Rules learned: ALWAYS headless + `--mute-audio`, launched from a background shell, never announce a
  window; scope every `pkill` to your own port.
- D-31 (desktop layout: bigger board + CAPTAINS beside it at 16:9; stacked-and-fitted at 8:9; layout
  only) — dispatched; see `02.2-CONTEXT.md` D-31 for the picks and the gate.
- Item 8 end-of-voyage card shipped (A+C hybrid, his clarifications in the 02.2-06 strike-box).
- Item 9 recipe card: he likes **option C**; real-art version at
  `notes/sketches/09-recipe-card/option-c-real-art.html` (live URL under /notes/…). Awaiting his pick.

## PAUSED by Wyatt at ~15:00 — state of the two runs that were stopped mid-flight

- **D-31 desktop layout — NOT shipped.** Its uncommitted edits to `4/index.html` and `4/src/ui/stage.js` are in
  `git stash` as **`d31-desktop-layout-wip-2026-08-21`** (`git stash list`). It had reached "running the four
  mouse-QA passes + non-browser gates" — i.e. the layout was built but UNVERIFIED. Next session: `git stash
  pop`, read the diff against D-31's picks, then run the gate it was given (mouse-QA at 390/960/1400/1920 +
  a host/guest pair + all named gates) before any stamp. The live build stays `t`.
- **Narration-timing trace — DONE (`.planning/debug/tails-narration-vanishes.md`, commits d7c0196/c4df244).** ONE mechanism for A/B/C/D: `ask()` posts a broadcast-mirror wait-line bubble (util.js:1656) that `promptTick()`'s wait-line cleanup (stage.js:1513, from 3a80839 = build g, last night) retires ~2ms later; the real prompt reveals 0.7–1.2s later behind its (correct) settle gate. NOT D-30. Item 11's gate exonerated (0 violations). Two extra bugs: veil z-order (index.html:1721/1733) hides the flip-result bubble ~47% of its hold; Buy-pill overhang = stale `offsetWidth` before the ingredient `<img>` decodes (stage.js:1715), 63px. Fixes are tasks in **02.2-07-PLAN.md** (Group E, being planned). Original note kept below for the record:
  *(was)* partial, preserved. `.planning/debug/tails-narration-vanishes.md` (status:
  investigating) holds the hypothesis and the exact instrument plan; its repro driver was
  `scratchpad/tails_repro.mjs` (scratchpad — gone; rebuild from `4/scripts/mouse_qa.mjs` + the plan in the
  doc). Its last words before the kill: the in-page timeline sampler WORKED (488 entries) and was about to be
  analysed. Scope: tails vanish, battle's-brewing pop→vanish→reappear (item 2), prompts-before-boats-stop
  (item 8), morning item 3; hypothesis = item 11's `pendingReveal`/`stageSettled()` gate firing on the
  wrong signal. Also to settle: the Buy pill overhanging the board's right edge at 1400 (his screenshot).

## What had been IN FLIGHT (for the record)

| Agent | Writes to | Then |
|---|---|---|
| D-31 desktop layout | `4/index.html`, `stage.js`, `util.js`; ships **`u`**; notes under D-31 in 02.2-CONTEXT.md | mouse-QA at 390/960/1400/1920 was its gate; verify the four results are in its note |
| Narration-timing trace | `.planning/debug/tails-narration-vanishes.md` | covers: tails result vanishes; "battle's brewing" pop→vanish→reappear (item 2); prompts appear before boats stop then jump (item 8); morning item 3. Hypothesis: ONE reveal/clear gate (item 11's `pendingReveal`/`stageSettled()`) firing on the wrong signal. It was told NOT to edit index.html/stage.js/util.js — the fix is probably queued, not applied |
| Storm summary + black market | **DONE** — `.planning/debug/storm-summary-and-black-market.md` (commit c207472) | **Item 3:** storm summary (since b8e9eea, 2026-08-14) is bypassed whenever a push is BLOCKED BY ANOTHER SHIP — `blocked`'s narration (util.js ~631) still fires inline from `runStormLive()` (flow.js ~1199), and a never-moved blocked ship is missing from the summary. Fix: strip `blocked`'s text like its silenced siblings + make `noteStormOutcome()` record a ship-block so `stormSummaryEvent()` folds it in (small ENGINE note change — disclosed; corpus does not exist yet, same basis as 02.2-04). **Item 7:** `dryCeremony()` fires only from `narrateLastEvent()` (human dock); the bot path `narrateCurrent()`/`botBeat()` never learned `firstDry` (348ccf4 vs 511c427) — a bot claims the first dry shelf in 76% of games and the one-shot latch swallows it. Fix: same `firstDry` check on the bot path, or converge the two narration functions (rule 23). **Both approved to build next session, UI-tier, after `u` lands.** |

## Wyatt's afternoon solo list (build t) — triage; HIS PICKS for 1, 4, 6 are recorded as D-32/D-33/D-34 in 02.2-CONTEXT.md (build them, don't re-ask)

1. **Prompt buttons hard to notice** — wants the established attention effect on the fan petals.
   Homework done: the candidates that exist in `4/index.html` are `flipglow` (the FLIP coin, 1s glow —
   the "needs your tap" look), `pp4FocusPulse` (1s), `pp4StagePulse` (1.1s), `ahoyglow` (1.4s),
   `goldShimmer` (6s shimmer). Sail squares pulse via `.sailCell`'s own keyframes. **HIS PICK (D-32):
   the sail squares' pulse, applied to the petals via the same class/keyframes — not a new effect.**
2. battle's-brewing pop/vanish/reappear — in the trace.
3. storm summary conditional — in the hunt.
4. **Dock prompt label:** drop the anchor; show `{ingredient image} Dock +🪙`. **HIS PICK (D-33): the
   coin only, no number.** One-line change in the fan label builder; sweep host/guest/draft
   (optionButtonsHTML reaches all three).
5. **Wind pill from frame one** — `WIND NOW: ? · FORECAST: ?` placeholder so the board never jumps when
   the pill appears. Touches the ribbon in stage.js — do AFTER `u` lands.
6. **Medium lines drag.** Measured: `msgHoldMs` = 500 + 20/char + 300/pause, clamped [800, 2000] in
   util.js, then stage.js does `×1.5` and clamps [2550, 8775] (ceiling effectively 3330×1.5 = 4995 via
   `NARRATION_HOLD_CEILING_MS`). So: *"Blown into the trade winds!"* (27 chars) → raw 1040 → ×1.5 =
   1560 → **floored to 2550ms**. Every line up to ~85 chars holds exactly 2.55s; long lines ~5.0s.
   **The floor is the drag.** Two honest options to put to him with these numbers: (a) lower stage.js's
   2550 floor (e.g. to ~1800 → medium lines 1.8–2.0s, long lines untouched); (b) replace floor+per-char
   with a reading-speed model (hold = overhead + chars ÷ reading rate), which makes 27 chars ≈ 2.1s,
   75 chars ≈ 4.5s, long unchanged. **HIS PICK (D-34): the reading-speed model.** Derive the rate
   once; keep the approved long-line ceiling; re-measure both tiers before/after.
7. black-market narration — in the hunt.
8. prompts before boats stop — in the trace.
9. **Crate SFX + animation on "Buy", not after the summary fades** — `docs/AUDIO.md` first; the purchase
   event → `soundForEvent` timing; probably fires on the engine event after narration; move the cue to
   the click (UI tier). Do after `u`.

## NEXT (as of ~15:40)
- **02.2-07-PLAN.md = Group E** (his afternoon list + the flicker fix + storm/black-market + recipe card D-35), 8 tasks
  incl. the drop; planner wrote it (9acb74a), plan-checker verdict pending/at `02.2-07` notes. **Run it with
  `/gsd-execute-phase 02.2 --plan 07`-equivalent scoping — i.e. execute ONLY 02.2-07**: a bare
  `/gsd-execute-phase 02.2` would also pick up 02.2-06 (no SUMMARY by design — items 6 and 16 remain, its
  strike-box says what shipped). Execute 07 **only after `u` is live**
  (sequencing ruling: D-31 ships first; Group E's stamp is the next letter after whatever is live).
- D-35: recipe card = option C + more image padding + the top gradient reaching the title separator.

## Standing rulings that bind the next session (all recorded in 02.2-CONTEXT.md unless noted)
D-04 clean lines · D-23 his notes are the design contract · D-30 economy philosophy · D-31 desktop
picks · whole-game QA bar (memory `feedback_qa_bar_whole_games`) · browsers headless+muted+unannounced
(memory `feedback_testing_scope`) · fan/narration spacing is GOOD now — tolerance request withdrawn.

## Known honest gaps
`ask()`/battle prompt channels still parked (02.15-VERIFICATION.md); crew END-CARD pair for item 8 not
photographed (headless throttling); two stale strict-gate assertions (todo); How-to-Play hardcodes
numbers (todo); the card and the desktop fix shared stamp `s` (attribution noted in the strike-box).
