# Handoff — Phase 02.15, evening of 2026-08-20 (WORKED THROUGH; second pass)

**Live build: `PP4_STAMP` `2026-08-20g` (commit `3a80839`).** Previous handoff's tasks 0–2 are done
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

---

## 3. Found by looking, and fixed (his standing instruction)

- **Recipe dock rings could outlive the card that asked for them.** The commit path is synchronous
  but the rings are appended from a promise, so committing before it settles left orange rings on
  the water with nothing to remove them. Unreachable on a warm module cache; a cold first tap is a
  different story. One comparison closes it.
- **The wind pill was sawn in half by the ☰ menu card** — reading as a rendering fault rather than a
  thing behind another thing. Faded, matching the hold-the-sea family.

**Noted, not changed (his call):** in the ☰ menu the mute control is a bare 34×28 icon floating
above a list of 600px full-width rows. It works and it is where playtest 10 put it, but it does not
match its neighbours. A row reading "🔊 Sound: ON", like the turn-clock row directly beneath it,
would — that is new copy, so it waits for him.

---

## 4. What is left

- **Stage 4 — the seventh divergence (the sail window).** Still not attempted. His ruling this
  session: *"only if everything else lands"*, and everything else has. It is the prompt channel — a
  prompt blocks the host's loop waiting for an answer — and its failure mode is a captain who cannot
  take their turn. **Abandon rather than half-land it** (D-04).
- **PAR-16 — the display-rules document.** Not written.

---

## 5. Instruments that lied today, on top of the ones already listed

- **A check whose PASS is the absence of something can pass by deleting the feature.** The wait-line
  retire is the case: 0 live frames read as success. Ask what a green means, not only whether it is
  green.
- **Match the prompt, not the word.** `/TREASURE/i` caught a narration line. A prompt has buttons.
- **A driver that clicks every 700ms cannot measure how long anything lasts.** Freeze it first.
- **A driver that prefers the first live button will trade forever** — Trade opens a multi-step
  sub-prompt it then loops inside, and the ship never reaches a dock. Exclude trade/attack/offer/call
  when you are driving somewhere.
