# Handoff — Phase 02.15, evening of 2026-08-20

**Wyatt is away for ~4 hours and wants to watch from his phone.** He is testing `playpastrypirates.com/4`
himself between sessions, so **the live build is the deliverable, not the commit.**

**Live build when this was written: `PP4_STAMP` `2026-08-20f` (commit `b92b61d`).**

---

## 0. DO THIS FIRST — hosting was broken and the fix is UNVERIFIED

`2026-08-20e` could not host a game at all. `2026-08-20f` contains the fix, **shipped without a
two-window test** because leaving the site broken was worse than shipping unproven.

**Prove, before anything else:**
1. A fresh room hosts — the host sees **Start the voyage!** without refreshing.
2. A guest joins that code and is actually admitted.
3. The room's `status` stays `"lobby"` until Start is pressed.
4. Then host a SECOND game in the same browser session without reloading — **that is the case that
   broke**, because an orphaned watcher from game one stamped `"playing"` onto game two's lobby.

If it is still broken, revert to before `b92b61d` rather than debugging on a live site.

---

## 1. Also unverified in `20f`, same commit

The stuck wait lines: *"Recipe chosen! Waiting for the rest of the crew"* sitting behind *"The crew
draws lots"*, and *"Waiting for yer mateys"* appearing only to the host during recipe choice. **One
fault, fixed in `enterCenterStage()`.** Confirm both in a two-window game.

---

## 2. His open reports, none started

| | Report | State |
|---|---|---|
| a | **The host has no mute button** (guest does) | Not investigated. Measure in two windows; do not guess. `placeMuteButton()` in `4/src/ui/board.js:2013` moves it between `#controlsRow` and `#muteSlot` by measuring available width, and `4/index.html:1614` hides it inside `#pp4CerSlot` during a ceremony. |
| b | **Pass-and-play "Pass the wheel to / wy" box is far too big** | Diagnosed, not fixed. Two causes: a literal `<br>` at `4/src/ui/lobby.js:294`, and `#actionPanel { width:100%; max-width:var(--boardW) }` making a centre-stage card board-width. Note the block carries `@copy … APPROVED as written` — removing the `<br>` changes no words. |
| c | **Pass-and-play trade winds differ from solo** | **TRACE ONLY — his explicit instruction.** Find out whether it is the same two-paths disease or something separate, write it down, change nothing. |
| d | **Item 14's other half — Pass as the bottom button** | Never reproduced. Reproduce before touching. |
| e | **A "TREASURE!" prompt flashing ~229ms** | Measured, but the driver auto-clicks every 700ms so the number is contaminated. Re-measure with nothing clicking. |
| f | **Trade-wind preview clipped when its destination is offscreen** | Parked by him for a future session — `todos/pending/2026-08-20-tradewind-preview-clipped-offscreen.md`. Leave it. |

---

## 3. Phase 02.15's own remaining work

- **Stage 4 — the seventh divergence (the sail window).** Deliberately not attempted at the safe
  stop. It is the prompt channel: **a prompt blocks the host's loop waiting for an answer**, and its
  failure mode is a captain who cannot take their turn. Attempt only if everything above is green.
  **Abandon rather than half-land it** (D-04).
- **PAR-16 — the display-rules document.** Not written. Wyatt: *"the Gameboard should just be
  displayed according to a set of rules."* Written as each piece converts, never up front.

---

## 4. Rules that bit HARD today — read before writing a probe

- **`mp_rig.mjs`'s `waitFor` was returning true always.** It wrapped async expressions in a
  synchronous IIFE, and a Promise is always truthy. Fixed 2026-08-20, but the lesson stands:
  **a check that has only ever been seen passing has not been tested.**
- **Serve the REPO ROOT and load `/4/`.** Serving from inside `4/` puts `../assets/` outside the
  server root and every island renders as a broken image.
- **The DOM having buttons is not the buttons being drawn.** Wait for a painted rectangle before any
  screenshot; a shot fired on DOM-ready caught an empty box while `querySelectorAll` reported two
  buttons.
- **The host's Start button opens a confirmation** (`btnConfirmStart`, "Everyone's aboard?"). A test
  that clicks only `btnStart` never starts a game — this cost a whole wrong diagnosis today.
- **Headless Chrome will not unlock audio.** No probe in a headless session can hear anything;
  sound is verified by Wyatt's ears alone.
- **Every drop needs a two-window crew game AND a solo game.** Solo is the failure a two-window test
  cannot see by construction — `runLiveNet()` drives solo too, where there is no room at all.
- **Kill every Chrome and server in the same step that starts it.**

---

## 5. What was fixed today and PASSED his own testing

Sound doubling (once per event, not once per render), the ghost bleeding old text into the recipe
box, the host-gone card (named, pirate speak, verified end to end), the line that told him about
himself in solo, the director framing the captain being asked, the sound map's duplicate key, the
six volumes, `Bakeries`, and the brackets off all four money buttons.

**Wyatt's standing instruction above all of it:** stop fixing one layer and leaving its siblings.
When a renderer has two callers, fix it in the ONE place both pass through, and widen the parity
gate so a second caller fails the build.
