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
- Real-mouse QA (`scratchpad/mouse_qa.mjs` — copy it into the session before the scratchpad is gone;
  pattern described in `02.2-MOUSE-QA-2026-08-21.md`): three whole voyages at 960/1400/1920, 0 findings.
  Rules learned: ALWAYS headless + `--mute-audio`, launched from a background shell, never announce a
  window; scope every `pkill` to your own port.
- D-31 (desktop layout: bigger board + CAPTAINS beside it at 16:9; stacked-and-fitted at 8:9; layout
  only) — dispatched; see `02.2-CONTEXT.md` D-31 for the picks and the gate.
- Item 8 end-of-voyage card shipped (A+C hybrid, his clarifications in the 02.2-06 strike-box).
- Item 9 recipe card: he likes **option C**; real-art version at
  `notes/sketches/09-recipe-card/option-c-real-art.html` (live URL under /notes/…). Awaiting his pick.

## IN FLIGHT when the session was cleared (their reports land on disk — look for these files)

| Agent | Writes to | Then |
|---|---|---|
| D-31 desktop layout | `4/index.html`, `stage.js`, `util.js`; ships **`u`**; notes under D-31 in 02.2-CONTEXT.md | mouse-QA at 390/960/1400/1920 was its gate; verify the four results are in its note |
| Narration-timing trace | `.planning/debug/tails-narration-vanishes.md` | covers: tails result vanishes; "battle's brewing" pop→vanish→reappear (item 2); prompts appear before boats stop then jump (item 8); morning item 3. Hypothesis: ONE reveal/clear gate (item 11's `pendingReveal`/`stageSettled()`) firing on the wrong signal. It was told NOT to edit index.html/stage.js/util.js — the fix is probably queued, not applied |
| Storm summary + black market | `.planning/debug/storm-summary-and-black-market.md` | item 3 is CONDITIONAL (summary happened once, later; per-captain lines earlier) — find the predicate; item 7 the black-market narration |

## Wyatt's afternoon solo list (build t) — triage, nothing started except the investigations above

1. **Prompt buttons hard to notice** — wants the established attention effect on the fan petals.
   Homework done: the candidates that exist in `4/index.html` are `flipglow` (the FLIP coin, 1s glow —
   the "needs your tap" look), `pp4FocusPulse` (1s), `pp4StagePulse` (1.1s), `ahoyglow` (1.4s),
   `goldShimmer` (6s shimmer). Sail squares pulse via `.sailCell`'s own keyframes. **Ask him which
   (recommend `flipglow` — it already means "tap me" in this game; rule 8), applied to the petals via
   the same class, not a new keyframe.**
2. battle's-brewing pop/vanish/reappear — in the trace.
3. storm summary conditional — in the hunt.
4. **Dock prompt label:** drop the anchor; show `{ingredient image} Dock +🪙`. **Ask: is the + a number
   (the flip pays 1 or 3 — "+1/+3"?) or just the coin?** Then one-line change in the fan label builder;
   sweep host/guest/draft (optionButtonsHTML reaches all three).
5. **Wind pill from frame one** — `WIND NOW: ? · FORECAST: ?` placeholder so the board never jumps when
   the pill appears. Touches the ribbon in stage.js — do AFTER `u` lands.
6. **Medium lines drag.** Measured: `msgHoldMs` = 500 + 20/char + 300/pause, clamped [800, 2000] in
   util.js, then stage.js does `×1.5` and clamps [2550, 8775] (ceiling effectively 3330×1.5 = 4995 via
   `NARRATION_HOLD_CEILING_MS`). So: *"Blown into the trade winds!"* (27 chars) → raw 1040 → ×1.5 =
   1560 → **floored to 2550ms**. Every line up to ~85 chars holds exactly 2.55s; long lines ~5.0s.
   **The floor is the drag.** Two honest options to put to him with these numbers: (a) lower stage.js's
   2550 floor (e.g. to ~1800 → medium lines 1.8–2.0s, long lines untouched); (b) replace floor+per-char
   with a reading-speed model (hold = overhead + chars ÷ reading rate), which makes 27 chars ≈ 2.1s,
   75 chars ≈ 4.5s, long unchanged — more honest, one more quantity to derive. Ask with the UI.
7. black-market narration — in the hunt.
8. prompts before boats stop — in the trace.
9. **Crate SFX + animation on "Buy", not after the summary fades** — `docs/AUDIO.md` first; the purchase
   event → `soundForEvent` timing; probably fires on the engine event after narration; move the cue to
   the click (UI tier). Do after `u`.

## Standing rulings that bind the next session (all recorded in 02.2-CONTEXT.md unless noted)
D-04 clean lines · D-23 his notes are the design contract · D-30 economy philosophy · D-31 desktop
picks · whole-game QA bar (memory `feedback_qa_bar_whole_games`) · browsers headless+muted+unannounced
(memory `feedback_testing_scope`) · fan/narration spacing is GOOD now — tolerance request withdrawn.

## Known honest gaps
`ask()`/battle prompt channels still parked (02.15-VERIFICATION.md); crew END-CARD pair for item 8 not
photographed (headless throttling); two stale strict-gate assertions (todo); How-to-Play hardcodes
numbers (todo); the card and the desktop fix shared stamp `s` (attribution noted in the strike-box).
