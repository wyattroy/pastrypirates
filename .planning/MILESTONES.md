# Milestones

## v1.3 The Game Comes Alive (Closed early: 2026-08-18 — 4 of 5 phases shipped)

**Phases completed:** 4 of 5 (18, 19, 21, 22 shipped and live). **Phase 20 was never started.**
**Git range:** `a918460`…`dc56e2c` on `main` — 75 files, ~11,296 insertions / ~450 deletions
excluding the prototype directories; 45 files and ~7,208 insertions in the root game's own code.
**Timeline:** 2026-07-31 → 2026-08-10 (last root-game commit), closed 2026-08-18
**Worked in four parallel workstreams:** `prompts-polish`, `board-wind`, `sound-clock`, `front-door`

### Why this milestone ended early

**It was not abandoned — it was overtaken.** On 2026-08-05, five days after v1.3 opened, the project
started a ground-up redesign of the whole game at `v2/` (`02cb5e7`), built outside GSD by Wyatt's
explicit instruction. Over the next ten days that redesign became `v2bakeoff/` (the bake-off
minigame), then `3/` (the race-planner bot brain), then `4/` (the full visual redesign). The root
game's last code commit was **2026-08-10**; every commit after that belongs to the redesign.

By 2026-08-18 the redesign was the thing Wyatt wanted to ship, and v2.0 "The New Game" was opened to
promote it. Finishing v1.3 would have meant polishing a game that was already being retired.

**Phase 20 "The Board Comes Alive" is retired unbuilt, and specifically is NOT lost work.** Its
scope — drifting wind dots, arrows flowing into a rotating whirlpool, a signal before a ship is
swept into the trade winds — was built independently inside `4/` during the redesign. It has no
phase directory anywhere in `.planning/` because it never had a plan written. It carried WIND-01,
WIND-02 and WIND-03, which are superseded rather than dropped.

**What shipped, and is live today:**

- **Phase 18 — Prompts & Polish.** Action buttons wait for the typewriter; a narrow window stopped clipping the only button that takes the action; narration stopped jumping sideways as it faded and the box stopped shrinking under a still-fading line; orange buttons restyled; captain colour circles removed everywhere. Formally closed 2026-08-02 with `18-07` written retroactively.
- **Phase 19 — Safari Check.** The gate before any wind work, and it passed: smooth at 100 dots, no dot budget needed. This was the milestone's biggest deliberate risk — BUG-01 had been a Safari near-crash on that same always-on animated subsystem — and measuring it first is why Phase 20 was safe to attempt at all.
- **Phase 21 — Sound & the Clock Toggle.** Sound effects with a mute button, and the turn-clock toggle finally working in solo and pass-and-play. The mute button's placement is **measured** by `placeMuteButton()` rather than thresholded — the fix that landed after three failed attempts at guessing a width, and the incident that produced the standing "ask 2–5 clarifying questions" rule.
- **Phase 22 — The Front Door.** You name yourself after choosing how to play; a real About page; a Google preview image. LOAD-03 finished 2026-08-02: the welcome screen no longer constructs a game at all — `seedIdleGameState()` replaced `renderDecorativeBoard()`, taking the welcome screen from 11.1% CPU and 60 layouts/sec to 1.7% and 0.

**Two performance findings worth carrying forward.** The active-turn ripple moved out of SVG (62
layouts/sec → 2) with the boats split into their own `#boardShips` SVG above it; and the discovery
that **Chrome never composites SVG transform animations**, which is why that move was necessary
rather than cosmetic. Both were Safari-verified by Wyatt.

**Three standing rules were earned during this milestone** and are recorded in `.claude/CLAUDE.md`:
the narration box reveals top-to-bottom in DOM order; the credits and About page are outside the
game world and are **not** written in pirate speak; and every question to Wyatt goes through the
question UI, never as prose.

**Carried forward, named rather than waved through:**

- **WIND-01/02/03 (Phase 20)** — superseded by the equivalent work inside `4/`. Not re-planned.
- **META-03** — Google Search Console verification. Wyatt's own action, and now blocked behind v2.0's CUT-04.
- **The shipped-vs-approved copy gate** — still not built. 19 of 144 approval fields conclusively settled. `scripts/narration_copy_check.js` does not exist; every post-approval wording change must still be surfaced by hand. Carried into v2.0's DOC-03 in a narrower form (the 13 strings approved 2026-08-14).
- **STORM-02** — multiplayer guest storm-push parity. Re-assess against the v2 engine; the v1 analysis that it forces a determinism re-record may no longer apply.
- **The D-57 residue** — `flash()` and `showNarration()` remain two independent hold/fade schedulers on the same `.apMsg`, unenforced.

**Verification:** `npm test` stands at **21 gates** and passes. `src/engine/index.js` needed no
determinism re-record during this milestone. Phases 18, 19, 21 and 22 each carry full GSD artifacts
under `.planning/workstreams/<name>/phases/`.

**Closeout:** early close, approved by Wyatt on 2026-08-18. The root game is not being deleted — v2.0
retires it to `/classic` so nothing a player has bookmarked breaks. Prior state preserved verbatim at
`.planning/milestones/v1.3-STATE.md` and `.planning/milestones/v1.3-{REQUIREMENTS,ROADMAP}.md`.

---

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
