# Safari checklist — v1.2, targeted

## RESULTS — Wyatt, Safari, 2026-07-31

| # | Check | Result |
|---|---|---|
| 1 | Pop animation | **PASS** — the CSS-variable-inside-an-SVG-transform risk did not materialise in WebKit |
| 2 | Storm | **PASS** — BUG-01's original crash surface, still clean |
| 3 | Gold banner | **PASS** — seamless at 6s, no seam and no stutter |
| 4 | Ko-Fi panel | **PASS** — Safari's tracking prevention does not block the embed |
| 5 | End of voyage | **PASS** — drumroll, fade, blue box gone, gold reveal |
| 6 | Two-window multiplayer | **not run** — the one remaining item |

Checks 3 and 5 were reached using the console injection in `docs/DRIVING-THE-GAME.md` (fill one
captain's recipe, sail home) rather than by playing a full game — the finish path is real, only the
route to it was shortened. Note he could not reload afterwards: a solo resume replays the recorded
decision log, and an injected inventory is not a recorded decision, so it does not survive.

Every engine-divergence risk this file was written to cover is now retired. What remains is not a
rendering question at all — it is the two-window networked game.

---



**~5 minutes for checks 1–5.** These are the places WebKit and Blink actually diverge, so they are
the only places my Chrome verification proves nothing. Everything else in v1.2 is either engine
logic (gated headlessly, 31/31 seeds) or DOM structure (identical across engines).

Check 6 is the real Phase 17 criterion and takes longer; it is listed last on purpose.

**URL:** `http://localhost:8420/index.html` — Safari has never loaded this port, so no stale modules.
If the server is gone: `python3 -m http.server 8421` from this worktree and use a port Safari has
not seen. (Safari caches ES modules per URL; a `?cb=` query does not reliably defeat it.)

---

## 1. The pop animation — HIGHEST RISK, and it is new today

**Do:** start a solo game, sail to any island, dock, and flip. Watch the icon that appears over your
boat.

**Right:** it bursts into existence in the square *above* the boat — scaling up from nothing,
overshooting slightly, settling — holds about half a second, then drops *into* the hull, shrinking
and fading as it lands. About 2 seconds end to end.

**Wrong:** no icon at all; an icon that appears and just sits there; or one stuck at the top with
no descent.

**Why this one matters most:** the keyframes put a CSS custom property inside an SVG transform —
`translateY(calc(-1 * var(--pop-rise)))` on a `<g>`. That specific combination is a long-standing
WebKit/Blink divergence. I verified the whole curve in Chrome and have **zero** evidence about
Safari. If it fails, it fails silently and looks like "the pop just doesn't happen."

## 2. The storm — the original BUG-01 surface

**Do:** keep playing until a storm rolls in (12.5% per round), or force one.

**Right:** rain sweeps the board, the game stays responsive, narration keeps pace.

**Wrong:** beachball, stutter, or the tab going unresponsive.

**Why:** BUG-01 was a **Safari-only** crash — a live CSS gradient plus a mask composited every frame.
The fix pre-bakes the rain into a PNG tile and animates only `background-position`. Nothing since has
touched `buildStormLayers`, so this is a regression check rather than a new risk.

## 3. The gold End of Voyage banner

**Do:** reach the end of a voyage (check 5 covers this) and look at the gold box.

**Right:** a smooth left-to-right gold sweep, gently shimmering.

**Wrong:** a hard vertical line down the box — the tiling seam I fixed today. It came from a diagonal
gradient repeating horizontally; the fix relies on `to right` plus matched end stops, which Safari
should honour identically, but the shimmer is an animated `background-size: 220%` on a flex
container and is worth one glance.

## 4. The Ko-Fi panel

**Do:** click **🍪 Buy me a cookie** in the footer.

**Right:** a modal opens with Ko-Fi's donation form inside it — amount, one-time/monthly, Tip button.

**Wrong:** an empty white panel, or the message about an ad blocker.

**Why:** Safari's tracking prevention is far more aggressive than Chrome's about third-party frames.
This may simply be blocked in Safari, and if it is, that is worth knowing before it ships — the
fallback text names ko-fi.com so a blocked player is not stranded.

## 5. End of voyage — the full sequence

**Do:** finish a game (any captain winning is fine).

**Right, in this order:**
1. The blue narration box shows **"Drumroll..."**
2. It holds, then fades out, and **the blue box disappears entirely**
3. The gold box appears with: **👑 {name} wins!**, the winner's recipe picture, and *"{name} baked a
   {recipe} and won **Best Baker in the Caribbean!**"*

**Wrong:** the blue box still on screen under the summary (that is the bug I fixed today — it used to
be re-shown immediately after being hidden); the recipe picture missing; or the Best Baker sentence
clipped at either end.

**Why it needs eyes:** I have verified each piece in Chrome — the gold box content, and the
drumroll's hold/fade/hide timing — **but never the three together in a real finished game.**

---

## 6. Two-window multiplayer — the actual Phase 17 criterion

Longer, and the only item that cannot be shortened.

**Do:** Safari hosts (**Host a Crew** → code), Chrome joins with that code, play through to an end of
voyage across both windows.

**Right:** the game starts on its own with no clock-stall workaround; both windows stay in step;
storm pushes and pause/resume behave; no lost state.

**Note:** two windows in the *same* browser share `localStorage` and therefore one `pp_id`, which is
why the guest should be the other browser (or a private window).

---

## If you would rather not

Phase 17 can close with Safari recorded as an accepted residual, the way Phase 15 carried two. If so
it should say so explicitly — `status: accepted-as-residual`, naming check 1 as the specific
untested risk — rather than being marked passed. A phase marked passed on evidence nobody gathered
is the failure this project has already been bitten by.
