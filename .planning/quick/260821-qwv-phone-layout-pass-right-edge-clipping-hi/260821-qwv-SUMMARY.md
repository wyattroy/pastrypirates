---
phase: quick
plan: 260821-qwv
subsystem: ui-stage
tags: [phone, layout, radial-prompt, playtest-gate, D-38, D-42, D-43]
requires: [02.2-CONTEXT D-38/D-39/D-42/D-43]
provides: [phone prompt placement that fits the screen; phone legs that emulate a real phone]
affects: [4/src/ui/stage.js, 4/index.html, 4/scripts/playtest_gate.mjs, 4/scripts/lib/vision.mjs, 4/scripts/stage_layout_check.mjs]
key-files:
  modified:
    - 4/src/ui/stage.js
    - 4/index.html
    - 4/scripts/playtest_gate.mjs
    - 4/scripts/lib/vision.mjs
    - 4/scripts/stage_layout_check.mjs
metrics:
  duration: ~5h
  completed: 2026-08-22
  build: 2026-08-21h
status: complete
---

# Quick Task 260821-qwv: The phone layout pass — four placement faults, two instrument faults

**One-liner:** on a phone no prompt box runs off the right edge any more, the hint never sits on a
button, the recipe picker is opaque, and the ◀ back circle stays on screen — 40 judge findings and
4 structural failures down to 12 and 0, with every fix measured red on the old build first.

---

## What a player gets

Play the game on a phone and the question you are being asked is now **entirely on the screen**.
Before this, a long trade ask started two-thirds of the way across a 390px phone and ran off the
right edge mid-word — 17 of yesterday's 40 phone findings, and the single most common thing wrong
with the game on a phone. Alongside it: the "Tap and hold the sea" hint no longer draws itself
across the buttons it is sitting next to, the cornered button block never lands on a sail square you
have to tap, the recipe picker is solid instead of letting the CAPTAINS panel read through it, and
the grey half-circle that hung off the top-left corner over "DAY N" is gone.

**Size:** four placement faults out of the ~9 causes behind the phone leg's 40 findings. It does not
touch fan crowding (still the biggest single cause left), Group E or Group D.

---

## The numbers

Both nights ran the same gate, `playtest_gate.mjs --legs=solo-phone,passplay-phone --judge=on`,
each leg a complete voyage played to its end card.

| | 2026-08-21 (build `g`, phone = 390×844) | tonight (build `h`, phone = 390×664) |
|---|---|---|
| **structural failures** | **4** (solo 1, passplay 3) | **0** |
| **judge findings — solo-phone** | **19** of 29 screens (+1 judge timeout) | **8** of 25 |
| **judge findings — passplay-phone** | **21** of 30 judged | **4** of 30 judged |
| **both legs** | **40** | **12** |
| console errors | 0 | 0 |
| voyage finished | yes | yes (passplay to a true end of voyage, day 19) |

The screen counts differ because each leg is a different voyage; the judged count is capped at 30
per leg either night (`JUDGE_CAP`, pre-existing), so passplay is a like-for-like 30 vs 30.

### The four classes, before → after

| class | before | after |
|---|---|---|
| a prompt/narration box clipped by the right screen edge | **17** | **0** |
| dead space below CAPTAINS (D-42) | **9** | **0** |
| see-through recipe picker | **6** | **0** |
| ◀ back circle peeking above the ribbon | **4** | **0** |
| peek hint drawn on a control | **4** + all 3 structural failures | **0** covering a control (2 grazes remain — below) |
| D-43's two accepted classes (EoV card cut at the bottom, board art at the board's edge) | **6** | **0** — the rubric lines work |

---

## The four faults, and what each one actually was

### 1. The ask pill ran off the right edge — one root cause, not two

**Diagnosed, then measured.** `.apMsg`'s `left` was chosen from `mw = msg.offsetWidth || 200` read
*before* the box was capped, and the whole radial placement pass **runs while `#pp4Prompt` is still
`display:none`** behind panel.js's `pendingReveal` gate (which holds the prompt hidden until the
camera and ships settle, D-20). Measured directly on the pre-fix tree — `posedEarly` in
`shots/before.json`: `promptDisp: "none"`, `.apMsg` rect all zeros. So `mw` falls back to 200, the
left edge is chosen for a 200px box, the box turns out 343px, and then `radKey` memoises the layout
and **nothing ever measures it again** — nothing in the memo key changes when the box becomes
visible.

That single mechanism explains the observed lefts exactly: `passplay-phone-023` started at x≈182,
which is `vwPx() - 200 - 10` to the pixel.

**Fix, three parts, all derived:** cap the box *before* measuring it (order was the whole bug);
re-clamp `left` against the box's **real** `offsetWidth` on every tick, above the memo, in
`clampAskToScreen()`; and refuse to memoise a placement computed with no layout to read
(`S.radKey = (msg && !msg.offsetWidth) ? null : radKey`).

**Measured:** the pill's right edge went from **127px past the screen** to **37px inside it**.

### 2a. The peek hint sat on the buttons

`peekHintTick()` pinned the hint at a fixed `band.bottom - 44`, and **that strip is inside the fan's
own legal band by construction** — the cornered dock puts circles at `capT - D - 8`, so the hint's
line runs straight through them. Nothing dodged anything.

**Fix:** the hint is the one floater that always yields — it is `pointer-events:none` text
explaining a gesture, and everything it was landing on is something you have to read or tap. It now
searches three spots (the foot of the band, tucked just above whatever is blocking the foot, then
the top of the band) against the rendered rects of every control, the question, the helper line and
any narration bubble, and hides for that tick if none is clear. The clearance is 6px — the same gap
every other stacked floater in that function already uses, so the hint is spaced like everything
else rather than to a number invented here.

**Measured:** with a control planted on the hint's strip, before → the hint stayed put and covered
4 controls; after → `hintHidden: true`, it stood down.

### 2b. The cornered button block landed on sail squares — all 3 structural failures, one screen

`sail-clickable: 9 sail square(s) covered <- #apStay`, plus `no-pile` and `not-occluded` reporting
the same overlap from their own angle. Every other placement in `layoutPrompt` treats the sail rects
as obstacles; the cornered dock did not, **because it is what runs precisely when the obstacle-aware
search has already given up**. It docked above the captains box and dropped the block onto the sail
window.

**Fix:** the dock now scores three vertical spots (its old spot, clear below the sail window, clear
above it) at three horizontal positions each, takes the first covering **no** square and otherwise
the least-covering — the same search shape the narration bubble already uses for the same D-38 rule.
With no sail window on screen the first candidate is the old behaviour, unchanged.

**Measured** (planted window across the dock strip, eight circles so the block can only live where
the dodge puts it): before → all 8 circles at y 317–455, squarely on the window; after → all 8 at
y 134–272, entirely above it.

### 3. The see-through recipe picker

`#pp4Prompt { opacity:.96 }`. The graveyard says why (rule 10): it was never a look anybody chose —
it arrived as one clause of the hold-to-peek commit (`78778e1`, 2026-08-11: *"Base card opacity
drops to .96"*). At 4% transparency the CAPTAINS card reads clean through the recipe cards.
**Fix:** the resting prompt is `opacity:1`. The peek fade keeps its own value and its own transition.

### 4. The ◀ back circle above the ribbon

Same root cause as fault 1. `back.top = pillB.top + (pillB.height - 38) / 2` has no floor, and with
the pill's rect all zeros during `pendingReveal` the arithmetic is `0 + (0 - 38) / 2 = -19` — a grey
half-circle over "DAY N", which the judge read as "a clipped clock icon" four times.

**Fix:** one `placeBackButton()` function, because the same two lines were written out in **three**
places and a floor added to any one of them would have left the other two wrong. Floored at
`tSafeV - 34`, the same floor the pill, the lift pass and `clampTop()` already use.

**Measured:** planted (placement forced to run with the pill unlaid-out) — before `top: -19`,
after `top: 86`.

---

## Sibling sweeps (rule 8) — what I checked and what I did not touch

- **`.pp4Bub`, the narration bubble.** The plan flagged four "clipped narration bubble" findings.
  **They are not bubbles.** I opened `solo-phone-013/019/022/025/027` and every one is the `.apMsg`
  ask pill — a white box with a teal border sitting above its answer circles; the judge just calls it
  a bubble. **0 of the 17 clipping findings were `.pp4Bub`.** Reading the code agrees: `place()`
  re-measures `bw` from the rendered box, clamps against `band.right = vwPx() - 8`, and its width can
  never exceed `CAP() = min(290, vwPx()-24)`, so the clamp is conservative even at `bw = 0`.
  **Not touched.**
- **`.apSub`.** Already caps `maxWidth` *before* measuring — the correct order the pill was missing.
  Confirmed, not changed; it is now also swept every tick by `clampAskToScreen`.
- **`.apSliderWrap`.** Clamps `left` against a measured `offsetWidth` with a `|| 220` fallback and is
  capped by CSS at `min(300px, 84vw)`. Correct in shape, but it carries the **same blind-measure
  fallback the pill did** and is *not* swept per tick. The plan said confirm, don't touch — so I did
  not. **Recorded as residual risk**: no clipping finding in 70 judged phone screens across two
  nights has ever named the slider, and `slider:16/16` was exercised tonight.
- **`opacity:.96`.** `git log -S` finds one introduction and `grep` one occurrence. The radial fan
  sets `opacity:1` on itself, so the circles and the ask pill are untouched by the change.
- **The three copies of the back-circle placement** are now one function.

---

## Fan crowding — measured and noted, changed nothing (plan item 5)

The plan scoped this out. What I saw:

- **It is now a hard failure, not a comment.** At the honest phone height the fast layout gate fails
  `no two prompt buttons stacked on each other (Trade/Pass +1)` at 390×664 — **and build `g` fails it
  identically**, so the shorter viewport revealed a fault the 844 emulation was hiding. The two
  circles overlap by roughly a third; you can see it in the action-menu tile.
- The gate's judge found the same class tonight on `solo-phone-010`: *"Attack (−2) and Trade
  action-circles overlap each other"*.
- On yesterday's screens the fan's designed spacing is **6px between 66px circles** (`NEED = D + 6`).
  Measured on `passplay-phone-028`: gaps of 5 and 7.5 CSS px. The judge reads that as *"packed with
  almost no gap… one crowded cluster"* and it reads that way to me too.
- `solo-phone-021` (yesterday) had three circles where two pairs were touching or overlapping by
  ~5px, plus a circle sitting on the ask pill (that was the solo leg's structural failure).

**My read, for whoever picks this up:** the 6px gap is too tight for a phone and the separation pass
gives up before it is satisfied. This is the single biggest remaining cause on the phone.

---

## What the judge still fails, by cause (12 findings, 12 screens)

| cause | screens | note |
|---|---|---|
| **fan crowding** — two action circles overlap | `solo-phone-010` | out of scope, above. Also the smoke gate's `Trade/Pass +1` |
| **the helper line `.apSub` does not dodge, and is not an obstacle to the fan** | `passplay-phone-021` (sub over the Pass circle), `solo-phone-021` (hint grazing the sub) | new class, named seam — see below |
| duplicate "Docking at Glitter Bay" narration, one copy behind the flip coin | `solo-phone-017`, `-018` | new |
| a bottom toolbar clipped by the screen edge over the End of Voyage card | `solo-phone-024`, `solo-phone-eov` | new, and newly visible at 664 |
| a captain row sliced by the bottom edge behind the recipe sheet | `passplay-phone-008` | new, 664-related |
| a captains row with a gap then one icon at the far right | `solo-phone-012` | new |
| stray faint text reading "hov." on a board tile | `solo-phone-011` | new — looks like a truncated label |
| the two recipe cards' ingredient rows misalign when one title wraps to three lines | `passplay-phone-004` | new, cosmetic — only visible now the ghosting is gone |
| the hint over a ship's hull | `passplay-phone-013` | board art; D-38 explicitly allows a floater over the board |

**The `.apSub` seam, measured so nobody re-derives it.** On `solo-phone-021` the hint and the helper
line overlap by **1.75px** (sub 410.5–425.5, hint 423.75–441.25). `.apSub` *is* in the hint's
obstacle list, so this is not a missing rule — it is an **ordering** one: `peekHintTick()` runs early
in the tick, before the pill and helper line are re-placed, so the hint is always one tick behind
where the helper line ends up. On `passplay-phone-021` the helper line sits **on** the Pass circle,
because `.apSub` is not in the fan's `obstacles` list (only `pillB` is) and nothing lifts it the way
`liftAskClearOfFan` lifts the pill. **Two one-line seams, one piece of work:** order the hint last in
the tick, and push the sub's rect into `obstacles`. Deliberately not done tonight — it is a placement
change with knock-on effects on the fan search, and the gated build had already run.

---

## The instrument (Task 2), plus one I found

1. **D-42 — the phone legs emulate a phone that exists.** Both phone legs are `390×664`, the viewport
   an iPhone-class Safari/Chrome actually gives the page once its bottom bar is accounted for. The
   game is not changed for this. **All 9 "dead space below CAPTAINS" findings are gone**, exactly as
   D-42 predicted. `stage_layout_check.mjs`'s phone size moved to 390×664 in the same commit — two
   gates disagreeing about what a phone is would be two phones.
2. **D-43 — two ACCEPTED lines in the vision rubric,** phrased over roles and naming no screen: a
   scrollable card may be cut at the bottom of the screen, and board art may be clipped at the
   board's edge by the camera. **Both classes went from 6 findings to 0.** No per-bug assertion was
   added anywhere (D-37).
3. **Found, not planned: the gate was screenshotting its own 404.** `contactSheet()` built the
   sheet's URL relative to `REPO` and fetched it from the run's server, which is rooted at `REPO` —
   so any `--out` outside the repo produced `../../..` and python answered 404. The sheet then
   screenshotted the error page and the log still printed `contact sheet: <path>` as if it had one.
   **Every sheet from the 2026-08-21 evening run is that same 404, all four legs, byte-identical
   (23,889 bytes, 1700×1000)** — I opened one to be sure. This is the exact class `d9c9a71` hardened
   `stage_layout_check.mjs` against; the hardening never reached this gate. Fixed: the sheet is now
   served from a short-lived server rooted at `OUT`, plus the loaded-images check so a future variant
   is loud instead of reassuring. **Verified at the seam:** old URL → `404`, new URL → `200` for both
   the html and a sibling PNG.

---

## Red-proofing — every check went red first

A check that has only ever been seen to pass is indistinguishable from one that cannot fail. Every
fix was measured on a **pristine `git archive HEAD` copy of the pre-fix tree served on its own port**
(no stash, no worktree, the working tree never touched), driven through the identical probe:

| check | before (build `g`) | after (build `h`) |
|---|---|---|
| ask pill right edge vs the 390px screen | **+127px past it** | **−37px inside it** |
| ◀ back circle top (placement forced to run with the pill unlaid-out) | **−19** | **+86** |
| controls covered by the peek hint (control planted on its strip) | **4** | **0**, hint stood down |
| circles sitting on a planted sail window (8-circle cornered dock) | **all 8** | **0** |
| `#pp4Prompt` opacity at the recipe sheet | **0.96** | **1** |
| contact-sheet URL | **404** | **200** |

Two of these only became honest checks after being fixed, and both are worth recording:

- **The dock plant first proved nothing.** At 42% down the band it left a 125px clear strip and the
  block needs 138 — so *every* candidate covered the window, the least-bad won, and a dodging build
  and a non-dodging build measured the same. The ceiling is `tSafe = band.top + 32`, not `band.top`.
  Moved the plant to 52% and the test discriminates.
- **A 1px viewport nudge moved the page's own origin**, so a plant positioned from `boardBand()`'s
  raw viewport numbers slid 9px against everything else and the check reported a 2.7px overlap that
  was really 8px of clearance. Dropped the nudge, measured through the game's own `fixedRect()`.
  Textbook `BOARD-RENDERING.md` §7 — the formula was the thing that was wrong.

---

## Screenshots (all read, pixel by pixel, not skimmed)

`.planning/quick/260821-qwv-phone-layout-pass-right-edge-clipping-hi/shots/`

| pair | what it shows |
|---|---|
| `before-3-posed-ask.png` / `after-3-posed-ask.png` | the headline. Before: pill off the right, helper line stacked on top of it and also off the right, grey half-circle over "DAY 1", hint bar drawn through three circles. After: pill wrapped and complete, helper line on its own line, ‹ on the pill's shoulder, hint clear |
| `before-1-recipe.png` / `after-1-recipe.png` | CAPTAINS ghosting through the recipe cards, gone |
| `before-6-plant-dock.png` / `after-6-plant-dock.png` | eight circles on the planted sail window → eight circles above it |
| `before-4-plant-hint.png` / `after-4-plant-hint.png` | hint over a planted control → hint stood down |
| `before-5-plant-back.png` / `after-5-plant-back.png` | ‹ circle at −19 → floored |
| `before.json` / `after.json` | every rect behind the table above |
| `gate-2026-08-21h/` | the four gate screens carrying the follow-up findings, plus the full gate log |

---

## Deviations from the plan

**1. [Rule 2 — missing critical functionality] The pill now reserves the back circle's footprint.**
Capping the pill to fit the screen made it 343px on a 390px phone — the whole width — so the ‹
circle had nowhere to stand and ended up two-thirds hidden *under* the pill: a half-tappable escape
hatch, which is exactly the class D-38 says is never acceptable. Found by reading my own after
screenshot (rule 19), not by a check. The pill now reserves 50px (38 circle + 8 gap + 4 margin, the
numbers the shoulder placement already used) when a back option exists, and nothing when it does
not. Cost: a long ask with a back button wraps one more line. Verified: ‹ at `left: 14`, clear.

**2. [Rule 2] `placeBackButton()` has an above-the-pill fallback** for when the shoulder has no room
at all — which is where CLAUDE.md rule 11's reveal order says the back belongs anyway.

**3. [in scope, extra surface] The sail-prompt CARD fallback got the same D-38 dodge** as the radial
dock. The plan named both; on a 390px phone the 330px card only has 44px of travel, and the comment
says so rather than pretending otherwise.

**4. [Rule 2, instrument] Fixed the gate's contact sheet** (finding 3 above). Landed **after** the
gate run, so tonight's two sheets are still 404s; the change touches only the sheet builder, not the
game, the legs, the checks or the judge.

**5. [reported, not fixed] `stage_layout_check.mjs` does not pass at all five sizes**, which Task 1's
verify asked for. Two failures, neither mine:
   - `390×664` — `Trade/Pass +1` stacked. **Reproduced identically on build `g`**: pre-existing fan
     crowding, revealed by the honest phone height, explicitly out of scope.
   - `960×1080` — `1 legal sail square cropped`, seen **once in four runs** of the same build (sail
     counts 15/17/19 across runs, so it is seed-dependent). I changed nothing that draws sail squares
     or moves the camera. Observed, not confirmed as a defect; flagged for the camera work.
   Also noted: that gate does not emulate touch, so its 390 leg reads *"Click and hold"* where a real
   phone says *"Tap and hold"* — an instrument gap documented in `cdp.mjs`, not a game bug.

**6. [not done, recorded] `.apSliderWrap` not added to the per-tick clamp** — the plan said confirm,
don't touch, and touching game code after the gate had started would have meant committing a build
the gate never ran. Residual risk written up in the sweep section above.

---

## Self-Check: PASSED

- `4/src/ui/stage.js`, `4/index.html`, `4/scripts/playtest_gate.mjs`, `4/scripts/lib/vision.mjs`,
  `4/scripts/stage_layout_check.mjs` — all present and modified.
- `node --check` clean on all four scripts; `node 4/scripts/no_undef_check.js` PASS.
- `git diff --name-only | grep -v '^4/'` printed nothing at every stage — the root game was never
  touched.
- `PP4_STAMP` is `2026-08-21h` in the tree.
- Probe hygiene: `ps ax | grep -c "[r]emote-debugging-port"` → 0, `"[h]ttp.server"` → 0 before
  returning. Every Chrome and server this task started is dead.
- **Not pushed** — Wyatt's ruling: one drop at the end of the evening.
