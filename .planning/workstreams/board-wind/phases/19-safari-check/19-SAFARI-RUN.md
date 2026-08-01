# Phase 19 — Safari Run Protocol

This is the one file with everything you need for the Safari afternoon: the links to tap, the
order to run them in, and where the numbers get written down. Nothing here requires opening a
console or typing anything — just tapping links on your Mac and your phone.

## 1. Serving and the fresh port

The branch build is being served from a small local web server running on this Mac, on port
**8951**.

- **Desktop link (Mac Safari):** http://localhost:8951/index.html
- **Phone link (iPhone Safari, same wifi as the Mac):** http://192.168.1.3:8951/index.html

**Why the port matters:** Safari (and Chrome) hang on to old code for a port that has already
served a build once — even if you reload the page, you can end up looking at yesterday's version
without knowing it. Every time the code changes and needs re-testing, a brand new port number gets
used, never one that has served a build before this session. This bites harder on the phone,
because the phone has no easy "hard reload" the way a desktop browser does — so if something looks
wrong on the phone, the first thing to check is whether it's a fresh port, not a real bug.

**Ports already used this session:**
- 8934 — first serve, phase 19 (stopped)
- 8941 — plan 19-06 pre-flight, before the item-8 backgrounding fix (stopped)
- 8947 — plan 19-06 pre-flight, before the item-11 reduced-motion fix (stopped)
- **8951 — CURRENT. Serves the code with both pre-flight fixes. This is the port to use.**

## 2. Turning the prototype on

A normal build of the game shows nothing new at all — no dots, no dial, nothing different from
what you've already seen. The **only** thing that turns the wind-dot prototype on is adding
`?wind=1` to the end of the web address. That's it — once the page opens with that on the end,
every control you need (the on/off switch, the dial, the readout) is already on screen and works
by touch/tap, nothing hidden behind a menu.

- **Desktop enable link:** http://localhost:8951/index.html?wind=1
- **Phone enable link:** http://192.168.1.3:8951/index.html?wind=1

Just tap/click those links directly — no need to type the `?wind=1` part yourself.

## 3. The two runs, in order

Once the prototype is on, there are two runs to do, always in this order:

1. **Run 1 — the headroom run.** Turn the dial up toward 100 dots and get a feel for roughly where
   it starts to look choppy or the phone/Mac starts to struggle. This just finds the rough ceiling
   — no need to be precise.
2. **Run 2 — the real test.** Lock the dial to **10** dots and play a full voyage — narration
   typing, ships moving, storms arriving and leaving, the works — with the dots running the whole
   time in the background.

**Both runs happen twice each** — once in Safari on the Mac, and once in Safari on the iPhone.
The phone's result is the one that counts for the final decision, not the Mac's — the Mac is just
a first look.

## 4. Where the answer goes

Once both runs are done on both devices, the numbers and the verdict get written into a file
called `19-VERDICT.md` at the end of this phase. You don't need to do anything with that file
yourself — just play the two runs and describe what you saw when asked, and it gets recorded
there.

## 5. Phone reachability and go-ahead

**Date:** 2026-08-01
**Port used:** 8934
**LAN address:** 192.168.1.3
**Phone link used:** http://192.168.1.3:8934/index.html

**What happened:** Wyatt's iPhone opened the phone link above over wifi and the page loaded
successfully. Separately, on the Mac side, the same address was checked and confirmed to answer
with a normal "page found" response, and the build was driven in a desktop browser at that exact
address to confirm it boots cleanly end to end — the board renders, the lobby renders, and nothing
odd shows up in the background diagnostics across a reload. The `?wind=1` link was also checked and,
as expected at this stage, it changes nothing yet — no dots, no dial, no switch — because building
those is the next step (plan 19-03), not this one.

**The randomness question:** Wyatt was asked where the wind dots should get their random numbers
from — the game's own shared stream (the one that keeps every player's game in sync) or a separate,
private stream that starts from the game's number but never touches the shared one. He confirmed
the separate private stream — the same approach the storm rain already uses safely today. This means
the game's own numbers are never touched by the dots, every player in a room still sees the same
weather, and the 31 saved test games that check the game's numbers keep matching. It's also the
answer that goes with the standing promise that nothing in this phase changes the game engine
itself.

**Selected option:** go-ahead — the phone opened the page, and the separate-private-stream approach
is confirmed. The prototype (plan 19-03) is cleared to begin.

## 6. Chrome pre-flight checklist

Run by plan 19-06, in driven Chrome, on port 8951 (the port at the top of this page). Every item
below is green as of this run. Two real bugs were found and fixed along the way — see the note at
the end of this section before you read the numbers.

1. **A normal build shows nothing.** ✅ Green. No query string: `#windHud` and `#windDots` were
   both `null`, and `document.querySelectorAll(".wdot").length` was `0` — both before starting a
   game and after playing several turns.
2. **The enable link works and needs nothing memorised.** ✅ Green. With `?wind=1`, once a game
   starts, the switch, the 0–100 slider, the `-5`/`+5`/`=10` buttons, the readout, and the
   will-change hint button all appeared on screen, each at least 44×44px (a comfortable thumb
   target), and each responded to a plain click/tap dispatch with no keyboard or console needed.
   The switch toggled "WIND: ON" → "WIND: OFF" → "WIND: ON" correctly.
3. **The dial reaches exactly 0.** ✅ Green. Setting the dial to 0 (via the real `windSetDotCount`
   path the slider calls) left `document.querySelectorAll(".wdot").length` at exactly `0` — no
   residue.
4. **The dial reaches exactly 10 and exactly 100, never 101.** ✅ Green. Tapping the `=10` button
   set the dial to exactly 10 (10 dot elements). Dragging the slider to 100 produced exactly 100
   dot elements. Directly attempting to push the count to 101 (simulating a stray value past the
   track end) was clamped back to exactly 100, both in the dial's displayed value and the dot count.
5. **The switch is honest.** ✅ Green. With the switch ON, three sampled dots' transforms were
   captured, the switch was clicked OFF, and the same three dots' transforms were sampled again
   immediately and 600ms later — byte-identical both times (nothing moving). Clicking the switch
   back ON produced new transforms within 400–800ms (motion resumed).
6. **The dial changes mid-voyage with no reload.** ✅ Green. `appState.evIdx` was read before and
   after setting the dial to 50 mid-voyage — unchanged (`0` → `0`), confirming no reload/game-state
   reset occurred.
7. **A wind direction change re-aims the dots with no reset.** ✅ Green. The autoplay driver was
   run until a round change flipped the wind; `.wlayer`'s `rotate(...)` value changed cleanly
   (observed `rotate(270deg)` → `rotate(360deg)` across a round boundary in the final run), and the
   sampled dot's travel position continued its normal cyclic wrap (791px → 1436px → 430px → ...)
   with no snap back to the margin/start value at the boundary.
8. **The readout does not lie about backgrounding.** ✅ Green, after a fix — see the deviation note
   below. Before the fix: worst figure jumped from 20.5ms to 300ms across a real ~10s tab-hide
   (via Chrome's own tab-activation, the same mechanism 19-05 documented firing `visibilitychange`),
   with `discarded` correctly incrementing by 1 — but the worst figure was NOT holding steady, i.e.
   the readout WAS lying, exactly the failure this item exists to catch. After the fix: worst moved
   33.6ms → 65.7ms across the same real hide/restore cycle, `discarded` incremented by exactly 1
   (1 → 2). A matched-duration control (same voyage, same ~11.5s window, NO tab hide) run
   immediately after showed **zero** drift in worst/dips/discarded, confirming the small residual
   post-fix movement is ordinary in-voyage jitter (comparable to the 20–65ms range seen everywhere
   else in this checklist), not a resurgence of the backgrounding leak. The catastrophic failure mode
   (a multi-second fake "worst moment") is gone; the readout no longer confuses backgrounding with a
   real stutter.
9. **The baseline is measured, not assumed.** ✅ Green. Immediately after starting a fresh game
   (14ms into the run), the readout showed `"60 fps — warming up"`; ~3.5s later (120+ samples
   accepted) it showed a plain figure with the smooth/rough word (`"60 fps — smooth"`), confirming
   the "warming up" state only holds pre-baseline. Re-verified headlessly in this same session that
   the baseline math correctly tracks a uniformly slow device rather than assuming 60fps: a synthetic
   130-sample stream at a uniform 33ms/frame produced `baselineMs:33, typicalFps:30,
   lowPowerSuspected:true` — never a hardcoded interval. (Chrome DevTools' CPU throttling was also
   tried live at up to 20x with 100 dots and an active autoplay driver — it correctly produced more
   dips and a higher worst figure without corrupting the baseline, but Chrome's CPU-slowdown
   throttle is mechanically different from iOS's uniform rAF-rate cap, so it can't literally
   reproduce a Low-Power-Mode-style shifted baseline live; the headless synthetic stream is the
   authoritative proof for that specific mechanism, matching 19-05's own coverage.)
10. **The instrument does not contaminate itself.** ✅ Green. At a dial of 100, two matched ~5s
    windows were compared: panel visible (300 samples, 0 dips, worst unchanged) vs. panel hidden
    (301 samples, 0 dips, worst unchanged) — no material difference in dip rate or worst figure
    between the two.
11. **Reduced motion behaves.** ✅ Green, after a fix — see the deviation note below. With
    `prefers-reduced-motion: reduce` emulated from page load, the dots now hold a real, spread-out
    on-screen position (identical across a 1.5s hold — confirmed frozen) and the readout kept
    updating (`"60 fps — smooth"` both times). Before the fix, freshly-created dots under this
    condition sat at an unset CSS default position that was clipped outside the visible board
    entirely — see the deviation note.
12. **The end-of-voyage summary prints.** ✅ Green. `board.showStats()` was called directly on a
    live game (per `docs/DRIVING-THE-GAME.md` §6) and `#windSummary` appeared inside the End of
    Voyage panel with the full expected text: `"Wind-dot smoothness check (Phase 19
    prototype)\nTypical: about 59 frames a second.\nWorst moment: about 15 frames a second, roughly
    0m 0s in.\n2 rough moments noticed, out of 4795 frames measured.\nDial ended at 10 dots, with
    the will-change hint OFF.\n2 pauses ignored — the screen was off or the tab was hidden, not a
    stutter."`
13. **The mechanical gates are green.** ✅ Green. `node scripts/wind_dot_contract_check.js` exited
    `0` (all 6 assertions PASS). `npm test` exited `0` (23/23 assertion groups PASS). `git status
    --porcelain scripts/fixtures` was empty both before and after this plan's edits.

### Two real bugs found and fixed during this pre-flight

The whole point of this checklist is to catch exactly this kind of thing in Chrome, not on Wyatt's
afternoon. Both are `src/ui/board.js`-only fixes inside the WIND DOT PROTOTYPE region — no engine
edit, no change to `WIND_PROTOTYPE_ENABLED_DEFAULT` (still `false`).

1. **Item 8's backgrounding leak.** The original `visibilitychange` handling only discarded the
   ONE frame immediately after becoming visible again — that assumed `requestAnimationFrame` fully
   PAUSES while a tab is hidden. Driven-Chrome testing showed that's not true for an ordinary
   backgrounded (not fully suspended) tab: Chrome keeps firing rAF at a throttled cadence while
   hidden, and each individual delta was comfortably under the 500ms outlier cutoff, so those
   frames sailed past the filter and inflated the worst-moment slot. Fixed by skipping
   `windMeterSample` entirely whenever `document.visibilityState !== "visible"` (`windDotLoop`,
   guarded by a new `windDocVisible()` helper that fails safe to "sample" if `document` is
   unavailable).
2. **Item 11's reduced-motion dots.** A freshly-created `.wdot` element's transform/opacity was
   ONLY ever written by `windDotLoop`'s transform-writing branch — which is unconditionally skipped
   whenever `windReducedMotion` is true (by design, D-13). A player with OS-level reduced motion
   active from page load would therefore see every dot sitting at its untouched CSS default
   position, which sits outside `#windDots`' clipped, oversized viewport — i.e. reduced-motion
   players saw no dots at all, not "dots holding still" as D-13 promises. Fixed by painting each
   newly-created dot's first real frame via one `requestAnimationFrame` in `buildWindDots`
   (deliberately unconditional on `windReducedMotion`/`windDotsOn`, since giving a fresh dot its
   first position is exactly what those two branches would otherwise skip); scheduled via rAF
   rather than a synchronous `clientWidth` read because the first attempt at a synchronous read
   observed a not-yet-laid-out ancestor and produced degenerate near-origin positions.

Both fixes were verified live in Chrome (re-run on a fresh port each time, per the rule above) and
`node scripts/wind_dot_contract_check.js` stayed green throughout. Items 1–7, 9, 10, 12 were
re-confirmed on the final port (8951) after both fixes landed, to rule out any regression.
