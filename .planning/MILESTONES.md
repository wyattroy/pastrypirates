# Milestones

## v1.2 Playtest Fixes & Polish (Shipped: 2026-07-31)

**Phases completed:** 5 phases (13–17), 15 plans + 8 quick tasks. Phase 18 deferred to v1.3.
**Git range:** `43b485d`…`a918460` on `main` — 272 files, ~62,559 insertions / ~8,017 deletions
**Timeline:** 2026-07-25 → 2026-07-31

**Key accomplishments:**

- **The multiplayer clock stall is fixed and proven** (CLOCK-01…03). A hosted game now starts on its own with no workaround — confirmed in a two-window Safari-hosts / Chrome-guest game played end to end, with turn order identical on both clients. Pause, resume and timer-off all propagate, and the shot clock re-arms rather than leaving the turn stuck, which was BUG-02's exact failure mode.
- **Storm movement corrected without breaking determinism** (STORM-01, AI-01, VERIFY-02). The boat moves square by square with docking checks at the right square; the bot hail follows a decided rule; the corpus was deliberately re-recorded in one gated pass and stands at 31/31 seeds.
- **The whole player-facing voice audited and fixed** (NARR-01…06). 209 pieces of copy reviewed by Wyatt on a purpose-built audit page, then applied. Two recorded live playtests found what reading could not — a private prompt leaking to every guest, a greyed button explaining the wrong thing, a purse that could go negative — while reading found two silent economy bugs that play would never surface.
- **UI/UX polish, social preview and Ko-Fi support** (UI-01…07, META-01/02, KOFI-01). One consistent spacing rhythm, a rebuilt icon burst, smaller sail highlights with a distinct hover, one-click hosting with a 1002ms dead interval removed, and Ko-Fi's donation panel opening in-page instead of navigating away.
- **A celebratory end of voyage that actually works.** The first implementation was inert — `showStats()` hid the narration box and the next `flash()` re-showed it, so its gate passed while the feature did nothing. It now plays a drumroll, fades, and reveals the win, recipe picture and Best Baker line in the gold banner. Verified in a real finished game on host **and** guest.
- **Two pre-existing economy bugs closed** (CR-02/CR-03, silent since Phase 11). A trade could delete the wrong crate and mint one that was never in play; a battle flee refunded side-bet stakes that collection never debited. Both found by reading, neither ever visible in play.

**Verification:** Phase 17 closed 3/3 with a two-window networked game. Safari checks 1–5 all passed, including the CSS-variable-in-an-SVG-transform risk introduced during the milestone. `npm test` grew 14 → 19 gate scripts; `src/engine/index.js` finished the milestone **byte-identical to `9ddd214`**, so no determinism re-record was needed for any of Phases 15–17.

**Carried forward, named rather than waved through:**

- **META-03** — verify the site in Google Search Console. Not a code change; Wyatt's own action.
- **NARR-07 / Phase 18** — narration must stop blocking the game loop (27 awaited `flash()` call sites). Never planned, and its requirement was missing from `REQUIREMENTS.md` entirely until close.
- **No shipped-vs-approved copy comparison** — 19 of 144 approval fields conclusively settled. The mechanism whose absence let four approved rewrites ship missing is still absent.
- **Two D-41 greyed states** still never seen on screen; **G29** storm leg summary unguarded; **`captions()` has zero callers** (~20 builders' `caps:[…]` is dead copy awaiting a ruling).

**Closeout:** Phases 13–15 and 17 carry full GSD artifacts. **Phase 16 has no PLAN.md** — it was built directly in one overnight session at Wyatt's request rather than through discuss → plan → execute; its SUMMARY and VERIFICATION were written afterwards from the commit trail and live browser evidence, and say so explicitly. Approved by Wyatt on 2026-07-31.

---

## v1.0 Edit Pass (Shipped: 2026-07-24)

**Phases completed:** 6 phases, 15 punch-list items (37 v1 requirements)
**Git range:** `f825ae2`…`d7d7a86` on `main` — 22 files, ~1,929 insertions / ~292 deletions
**Timeline:** 2026-07-22 → 2026-07-23

**Key accomplishments:**

- **Safari storm no longer near-crashes** — storm rain renders from a pre-baked PNG tile and the narration box height snaps instead of animating (BUG-01, Safari-verified).
- **Multiplayer state survives pause/refresh** — the timer toggle re-arms the in-flight shot clock, and a mid-game refresh restores the voyage (with a loud fallback dialog) instead of silently rebuilding a fresh board (BUG-02/03/04).
- **Battles are reflip-free and swap-free** — attacker and wind-advantage reflips removed; the beaten defender no longer lands in the winner's prime re-attack spot (BATL-01/02/03).
- **Smarter, fairer bots** — captains play the new mechanics, weigh downwind vs upwind, trade with whoever holds more of the needed resource, escape when boxed in, and are no longer trivially beatable (AI-01…06).
- **Narration accuracy + pacing** — icon-before-name docking, trade cooperation line, "it's still" vs "now", new sustained-wind gusts, 20% faster pacing, empty-island grab-3; storm-text audit delivered and Wyatt's rewrite applied (NARR-01…07).
- **UI/UX polish + celebratory end of voyage** — clock, boats, fish, compass, movable squares, modals, parley, Flippenator, and feedback copy all fixed (UI-01…10); bot personalities hardcoded per captain (BOT-01/02); redesigned 5-badge set (approved), new Unluckiest-pirate badge, and a confetti win moment (EOV-01…05).

**Closeout:** override close-out. Code is git-verified as merged to `main`, but GSD execution artifacts (phase `SUMMARY.md` files, plan checkboxes) were never populated on this branch, so no verified execution trail exists to certify against. Approved by Wyatt on 2026-07-24.

---
