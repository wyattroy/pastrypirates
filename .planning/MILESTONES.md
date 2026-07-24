# Milestones

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
