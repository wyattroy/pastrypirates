# Handoff — Phase 02.15, evening of 2026-08-20 (WORKED THROUGH; second pass)

**Live build: `PP4_STAMP` `2026-08-20i`.** Previous handoff's tasks 0–2 are done
and measured; what is left is at the bottom.

---

## 0. HOSTING IS PROVEN. `b92b61d` stands — do not revert it.

Two real Chromes, a real Firebase room, build `20f`. Every check passed:

| | Check | Result |
|---|---|---|
| 1 | fresh room hosts; **Start the voyage!** painted with no reload | PASS (378×42 button) |
| 2 | guest joins that code and is admitted (room set, `isHost:false`, own seat) | PASS |
| 3 | host's roster shows the guest | PASS |
| 4 | `rooms/<code>/status` holds `"lobby"` — sampled 8× over ~8s | PASS |
| 5 | Start → `btnConfirmStart` → `status:"playing"`, both clients in the voyage | PASS |
| 6 | a SECOND room hosted in the same page life is never stamped `"playing"` | PASS (8× over ~8s) |
| 7 | a guest joins that second room | PASS |

**One caveat recorded honestly:** step 6 reaches the second lobby by calling `abandonRoom()` from a
*started* game, which no player can do — `leaveGame()` reloads the page, which kills the orphan by
itself. So the orphaned-watcher regression may not have been reachable the way the commit message
describes. The guards are right regardless and cost nothing; the hosting they were shipped to fix
works.

**Seen once on that synthetic path, NOT confirmed reachable:** the second lobby carried the first
room's guest name in seat 1, drawn over the previous game's ribbon and CAPTAINS panel. If a real
route back to the welcome screen without a reload exists — the host-gone card's `showHome()` is the
candidate — this is worth reproducing. It has not been.

---

## 1. The wait lines — one real defect found, and my own fix caught lying

**Fixed and measured.** Two-window game, sampled 4×/sec on both screens.

- **A wait line survived into the next prompt.** Screenshot: the host at the recipe picker with
  "⚓ Waiting for yer mateys…" still over the sea, overlapping the tap-and-hold hint. Wait lines have
  no deadline by design, so only a tap, the next narration, or (since `b92b61d`) a centre-stage card
  retired one. A recipe sheet is none of those. Now retired in `promptTick` — the one place both
  tiers and every prompt style pass through.
- **THE PART WORTH READING.** The first version of that fix tested "a prompt is on screen" and
  **deleted the feature outright** — a wait line is born one beat after its owner answered and the
  panel is not always empty by then, so the line died in the frame it appeared. Two runs agreed:
  **0 frames of a live wait line, and every check still green**, because "the line is gone" was
  exactly what the check asked for. It is a rising edge now. Measured after: a guest dawdling 14s
  holds the line **13,997ms**, retired by the next question.
- **The parity report was one missing ARGUMENT.** `remoteDraftPrompt(seat,msg,opts,waitMsg)` has
  always carried a wait line to a remote captain; the recipe draft never passed one. Host saw both
  wait lines, guest saw one. Now both, on both.

---

## 2. His open reports — all six answered

| | Report | State |
|---|---|---|
| a | **The host has no mute button (guest does)** | **FIXED.** Never a host/guest question: measured in a SOLO game, `#btnMute` sat inside `#controlsRow`, which `enterStage()` parks in `#pp4Cap` and `body.pp4Stage` hides outright. `#muteSlot` — the ☰ menu, its intended home since playtest 10 item 2 — was the other candidate, and `placeMuteButton()`'s live width measurement was a coin toss between them. Two clients answering a width a frame apart answer it differently, which is the whole "parity bug". Both halves fixed. Painted in the menu on host AND guest. |
| b | **Pass-and-play hand-off box far too big** | **FIXED**, his pick "fit the words": 420px → **307px**, the 110×110 pulsing circle → a **159×50 pill**, hard line break gone. Scoped to `[data-pp4-hand]` because the 420px pin is load-bearing for the bake-off (playtest 22 item 11). No words changed. |
| c | **Pass-and-play trade winds differ from solo** | **TRACED, nothing changed** (his instruction). **NOT the two-paths disease.** Measured side by side, solo vs pass & play: `roundBoard:true` both, `isRound:true` both, **40 rim cells / 40 rimCellInfo / 40 rim heads / 40 rendered rim children (36 flow + 4 swirl) — identical**, and every `cfg` field identical. The only differences are `strategies` (seat 1 human instead of bot — the definition of the mode) and the wind direction itself, which is drawn from a fresh random seed per voyage: solo N→S, pass&play E→W. Two voyages, two winds. There is **no `passAndPlay` branch anywhere in the trade-wind path**; the only two in the render layer are the recipe reveal (`board.js:1620`, by design — hide your recipe from the next player) and the ⏩ skip chip (`stage.js:460`, his own ruling). **What he saw is not reproduced.** A side-by-side screenshot would settle it in a minute. The one real trade-wind rendering defect on file is the parked (f). |
| d | **Item 14's other half — Pass as the bottom button** | **NOT A DEFECT, measured.** Pass is `opts.push` — last in the list — and in the radial bloom it lands lowest: measured `Trade y=357 / Pass y=431`, same x. Pass **is** the bottom button. Caveat stated plainly: the menus reached were 2-button; a 4-button fan (Dock + Trade + Attack + Pass) was not captured. |
| e | **A "TREASURE!" prompt flashing ~229ms** | **NOT A FLASH.** The dock-flip prompt is a real `ask()` that waits for the captain. Posed on a dock with nothing clicking, the prompt sat **30s+** and was still up when the watch ended. Caveat: the flip came up tails, so what was held for 30s was the TAILS face — the *same* `ask()` call, differing only in the interpolated label, so the lifetime cannot differ by face. The original ~229ms is the 700ms driver answering it. **Also: my first probe matched `/TREASURE/i` and caught the narration line "Docking at … — dig for treasure!", reporting a 2502ms "prompt" with zero buttons.** A prompt has buttons; the empty button list is what caught it. |
| f | **Trade-wind preview clipped offscreen** | Left parked, as he asked. |

### (c) again — he asked me to keep digging, so I did, and it is still clean

He chose *"keep digging without a screenshot"*. Two more angles, both measured, both negative:

**My best theory, and it was WRONG.** `buildRimFlow()` wipes `#rimHost` and rebuilds all 40 arrows,
and each arrow's drift is a CSS animation with a per-cell delay — so *if* it ran on every render,
every rebuild would restart the whole current from zero, and pass & play renders more often than
solo (there is an extra `liveRender()` at each turn's end). Same code, different rate, would look
exactly like "the trade winds differ by mode".

**Measured over 60 seconds of driven play in each mode: 0 rebuilds and 0 animation restarts, both
times.** One arrow's animation clock ran **66,297ms uninterrupted in solo and 69,481ms in pass &
play**, climbing smoothly 200ms per sample. `buildRimFlow` is called from `drawBoard()`, not from the
per-frame render. The current flows continuously and identically in both modes. **Theory disproved,
recorded rather than dropped.**

**And the branch count.** There are exactly three `passAndPlay` branches in the whole render layer,
and all three are his own rulings: the recipe reveal (`board.js`), the ⏩ skip chip (`stage.js`), and
an end-of-turn refresh so the check-my-recipe button is not left frozen behind the hand-off screen
(`flow.js`). **None of them touches wind, rim or sweep.** `animateRimSweepIfAny()` has no mode branch
either.

**Three independent measurements now say the trade winds are the same thing in both modes.** I have
run out of honest angles without knowing what he saw. **A side-by-side screenshot is the whole
remaining cost of settling this.**

---

## 3. Found by looking, and fixed (his standing instruction)

- **Recipe dock rings could outlive the card that asked for them.** The commit path is synchronous
  but the rings are appended from a promise, so committing before it settles left orange rings on
  the water with nothing to remove them. Unreachable on a warm module cache; a cold first tap is a
  different story. One comparison closes it.
- **The wind pill was sawn in half by the ☰ menu card** — reading as a rendering fault rather than a
  thing behind another thing. Faded, matching the hold-the-sea family.

**And then changed, at his word.** He picked *"make it a row like the others"*, so the ☰ menu's sound
control is now a full-width row — same values as `#pp4ClockRow` beside it, so the menu's two live
toggles read as a pair. **The label is CSS `content` keyed off `aria-pressed`, not a second writer**:
`setClockUI()` already publishes the mute state and already writes the megaphone pair twice a second,
and a second source for the same fact is the same drift this whole phase has been unpicking, one
scale down. Measured both states: 600px against the clock row's 600px, 40px against 39px, label
flips with the state, and it collapses back to the icon the moment the menu closes.

---

## 4. Stage 4 — the narrow half is closed; the wide half is NOT

**Read this before assuming Stage 4 is done. It is not.** The prompt-channel convergence — routing
the host through the same path a guest renders from — was **not** attempted, and D-04 still stands
over it: a prompt blocks the host's loop waiting for an answer, and its failure mode is a captain
who cannot take their turn.

**What WAS closed is the sail window's own divergence, which turned out to be small and already
leaking:**

- **`sailSelfCheck()` covered one captain in every game.** It ran inside `localPickCell()`, so a
  captain whose decision is LOCAL got their squares checked and every remote one did not — the host
  builds a guest's `cells` with the same `reachable()` call and shipped them unchecked. And the
  guest's renderer had **no `.apSub` at all**, so the shout could not have been displayed even if it
  had fired. G6 is *"apply it to all situations"*; it was applied to one. Hoisted to `pickCell()`,
  ahead of the local/remote fork. Pure read — no RNG, no mutation, replay branch returns before it.
- **The sail card is one builder now** (`sailPanelHTML`). Both renderers hand-wrote that markup, and
  the missing `.apSub` is what the second copy had already cost. Same drift class `02.1-03` closed
  for the option row with `optionButtonsHTML`.
- **The parity gate was aimed at one channel and there are two.** `prompt_field_parity_check.js`
  watched `kind:"ask"` — where all seven historic drifts happened — and **nothing watched
  `kind:"pick"`, the prompt every captain answers on every turn of every voyage.** Assertion 2 now
  does, both directions, plus proof that both renderers go through the one builder. **Red-proofed
  with four new drills** (host stops sending `hint`; guest stops reading it; guest hand-writes its
  card again; the pick branch vanishes). 11 synthetic violations caught, real tree clean.

**Verified on three tiers.** Crew: host and guest cards identical — "tap to sail" + Stay put, no
stray buttons — 14 events, round 2, frontiers equal. Solo (the case two windows cannot see):
events 1→21, round 1→2, two sail windows opened and answered — one per round, the correct rate.

**Still open:**
- **Stage 4's wide half — the prompt channel itself.** Untouched, deliberately. **He named it the
  biggest lever for the next session (2026-08-20), so it is that session's first job** — started
  fresh with a plan, not begun at the tail of a long one, which is what D-04 is for.
  **Groundwork already laid, so the next session does not start cold:** the *rendering* is largely
  converged already — `optionButtonsHTML` for the ask channel (02.1-03) and now `sailPanelHTML` for
  the pick channel. What is NOT converged is the ORCHESTRATION: `localAsk` resolves a promise in this
  browser while `watchPrompt` answers over the wire, and the host's loop BLOCKS on that promise. The
  shape of the answer is one "current prompt" both tiers render from, with only the response
  mechanism differing. That is a substantial change to `ask()`/`localAsk()`/`watchPrompt()` and its
  failure mode is a captain who cannot take their turn.
- **PAR-16 — the display-rules document.** Not written.
- **Not investigated, seen in one guest screenshot:** the sail highlight squares were hard to make
  out on the guest's board (`s4-guest-sail.png` — the card recorded 3 cells and none read clearly as
  amber in that frame). The rect builder is shared and was not touched here, so this is either the
  bounce animation caught at low opacity or something older. **Observed once, not measured.**

---

## 5. Instruments that lied today, on top of the ones already listed

- **A check whose PASS is the absence of something can pass by deleting the feature.** The wait-line
  retire is the case: 0 live frames read as success. Ask what a green means, not only whether it is
  green.
- **Match the prompt, not the word.** `/TREASURE/i` caught a narration line. A prompt has buttons.
- **A driver that clicks every 700ms cannot measure how long anything lasts.** Freeze it first.
- **An external poll cannot see a guest's sail card.** The guest's driver answers inside 700ms and a
  browser round-trip is 1–2s, so polling from outside reported "the guest never got a sail window"
  when it plainly had. Record in-page, at page speed.
- **Two of today's FAILs were my own thresholds, not the game.** "Solo still sails" demanded 3 sail
  windows inside a 2-round watch, and a solo game opens exactly one per round. Check what a number
  should be before believing the red.
- **A driver that prefers the first live button will trade forever** — Trade opens a multi-step
  sub-prompt it then loops inside, and the ship never reaches a dock. Exclude trade/attack/offer/call
  when you are driving somewhere.
