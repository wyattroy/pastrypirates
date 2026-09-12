---
quick_id: 260824-vg9
description: "The 5-minute recording ingested; H1 and H3 killed; the WebKit birth matrix came up dry"
date: 2026-08-24
status: complete
---

# Quick task 260824-vg9 — SUMMARY

**No game code touched. No stamp bump — the live build stays `2026-08-24g`.**

## What the recording settled

`notes/pulse bug.MP4` — 289s, build 24f, iPhone Safari, ONE continuous take, solo voyage Days 3→12.
21 prompts located and measured at 30fps. **5 dead, 16 alive.**

**The finding that reframes the whole bug: every dead prompt is the same prompt.** The
"Wyargh, what'll ye do:" turn menu died 5 of the 7 times it appeared. Not one of the other 14
prompts — trade fans, Buy/Nah, Accept/Counter/Deny, battle calls, single asks — died once.

A dead button's area is constant to within 8px out of ~24,000, parked at the size a living button
holds at its trough. And at 2:00 a turn menu is dead while at 2:05 the trade fan replacing it is
fully alive — same page, 4 seconds apart. **The freeze is born with a prompt and dies with it.**

## Two hypotheses killed by measurement

- **H1, stuck animation clock** — the long-standing front-runner. During both dead windows the
  board's `.rimFlow` current arrows run at full amplitude on a clean 2.53–2.60s period. That is
  `rimDrift 2.6s linear infinite`, a plain CSS animation on the same page, in the same frames.
  The page's timeline is fine; only the buttons are out.
- **H3, birth at a visibility boundary** — Safari's chrome bar is present and identically bright in
  all 1,158 sampled frames across 289 continuous seconds. No hide, no app switch, no lock, and five
  prompts died anyway.

H2 (the screen recorder) is weakened, not killed: the recorder ran the whole time and 16 prompts
pulsed perfectly, so recording cannot be sufficient.

## The WebKit birth matrix — an honest negative

New durable instrument: `4/scripts/wk_birth_matrix.mjs`. Twelve birth conditions carrying the
game's own literal `pp4Grow` keyframes, run in real headless WebKit 26.5. Hidden birth,
`display:none` birth, a tweening camera ancestor, a late-landing `.radial` ancestor class,
reparenting into the camera layer, per-frame `left`/`top` writes, per-frame `display` and
`aria-disabled` churn.

**All twelve swing at 1.15 with a monotonic animation clock. Red-proofed — the control swings.**

So H5 (born behind the `pendingReveal`/`stageSettled` gate) and H6 (camera-layer transform) are
killed as STANDALONE mechanisms, and H7 (hidden birth alone) is killed outright. The freeze is not
something a small page can provoke.

## Where it leaves the investigation

**H8 is the live front-runner and nothing has tested it:** whatever is wrong lives in the turn
menu's own build path — the one prompt assembled by the engine's turn-open sequence (⏩ digest →
sail prompt → menu) rather than by a player's tap — and it needs the real game to appear.

**Next instrument: the full-game WebKit reproduction.** Drive a solo voyage in headless WebKit and
read `getAnimations()` off a real turn-menu petal (docs/DRIVING-THE-GAME.md §7 — playState,
startTime, whether `currentTime` advances). That names the mechanism instead of inferring it from
pixels. If every prompt pulses there, H9 stands and his phone becomes the only instrument.

No fix is proposed. H8 is OPEN, and the charter forbids it.
