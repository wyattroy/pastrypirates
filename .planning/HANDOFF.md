# Pastry Pirates — Edit Pass: Handoff

**Branch:** `claude/gsd-new-project-skill-40272a` · **Status:** all 15 punch-list items addressed · nothing merged, pushed, or PR'd — it's all waiting for your review.

---

## TL;DR

All six phases are built, committed, and green on the automated harness. Three things need **you** (all by design, none blocking each other):

1. **Verify the Safari storm fix (BUG-01)** — you own this per our discussion. I instrumented it; you confirm on your Safari. See "How to verify" below.
2. **Approve the badge redesign (EOV-04)** — mockup published, link below. Nothing badge-related ships until you sign off.
3. **Rewrite the storm text (NARR-06)** — I delivered the audit catalogue; the rewrite is yours. Link below.

Two links to open first:
- **Badge mockup:** https://claude.ai/code/artifact/c2dba323-7120-4a13-8e25-d866a5d1b95a
- **Storm-text audit:** https://claude.ai/code/artifact/c546e598-8ca7-4dad-a7ef-86d816acecfe

---

## What shipped, by phase

Each phase is one or two atomic commits. Full detail is in the commit bodies (`git log`).

### Phase 1 — Critical bugs (BUG-01…04) — `f825ae2`, `5e29eab`, `428a87e`, `82ba357`
- **BUG-01 (Safari storm):** your hunch was right — `typewriterReveal()` was doing one DOM write *per character*, thrashing layout while the storm overlay composited. Rewrote it to batch to one write per text node per tick. Storm CSS untouched, no storm special-case, emoji-safe (verified no broken surrogate frames). **Confirmation is yours (D-09).**
- **BUG-02 (timer pause):** the real bug — with 2+ humans the ⏸ button is hidden; you were using the ⏱ timer toggle, and turning it back on never re-armed the in-flight turn's clock. Fixed, and handled two traps: no double 20s penalty, and the 30s auto-skip resolver survives the toggle. No new pause button (your call, D-04).
- **BUG-03/04 (refresh wiped the game):** `resumeHostGame()` was swallowing its Firebase reads with an empty `catch`, so a failed read looked exactly like a brand-new game and rebuilt a fresh board. Now it fails loudly with a "couldn't fully restore this voyage" dialog (Resume anyway / Restart), and guests get an explanatory strip instead of a frozen board. Also fixed a second, independent freeze cause (`endReplay` advancing the broadcast frontier past un-rebuilt events).
- New test harness `scripts/dlog_replay_test.js` covers the replay-shortfall detection headlessly.

### Phase 2 — Battle & AI (BATL-01…03, AI-01…06) — `a50f0e2`, `66bcb68`
- **Reflips gone** (attacker broadside + downwind free reflip). Wind still matters via the both-heads tiebreak — that's the "wind advantage" the AI learned.
- **No post-battle swap** — winners stay put; the beaten defender isn't dumped in the re-attack seat.
- **AI:** now weighs firing downwind vs upwind (measured: downwind attacks rose 24%→32%); trades with the captain holding *more* of the needed resource (unit-tested); escapes when boxed in by ducking into the trade winds; and an escalating rematch brake breaks the fight-loop stalemates the no-swap change exposed.
- Per-captain win rates over 2000 games: 22/22/22/33% (balanced/pirate/trader/rusher) — all competitive.

### Phase 3 — Narration (NARR-01…07) — `668759c`
Icon-before-ingredient on tails-flip docking; the trade cooperation line; "it's still" vs "now" for repeated wind; **new** sustained-wind narration ("this southerly is gusting" / "won't quit"); messages hold 20% shorter; empty-island docking grabs 3 with no flip. **NARR-06 is the audit only** — your rewrite pending.

### Phase 4 — UI/UX (UI-01…10) — `455febe`
Turn clock no longer cropped + radiates orange as it counts down; boat emojis last 2x longer; caught fish rises as the Sugarfish, not the line; STORM label removed from under the compass; movable squares bounce + brighten on hover; leave-game modal reordered ("Nope, stay aboard" blue on top); parley Back goes one step, not out to the menu; FLIP coin de-orange'd with orange text only; feedback copy updated. All ten verified in-browser.

### Phase 5 — Bot personalities (BOT-01, BOT-02) — `1034d4d`
Lobby picker removed; hardcoded per captain — Davy Scones=balanced, Crustbeard=pirate, Dough Hook=trader, Flaky Jack=rusher.

### Phase 6 — End of Voyage (EOV-01…03, EOV-05) — `666b395`
Blue box no longer announces the win; the win gets its own box with the recipe image (moved out of the summary box); new **Unluckiest pirate** badge (most tails — verified always shown, always to the right captain); a victory confetti burst. **EOV-04 (the 5-badge redesign) is the mockup, awaiting your approval.**

---

## The 3 things that need you

| # | Item | What I did | What you do |
|---|------|-----------|-------------|
| **BUG-01** | Safari storm perf | Fixed + shipped a toggleable FPS overlay behind `?perf=1` | Open the game in Safari with `?perf=1`, force a storm, confirm no hitch. Then tell me and I'll strip the instrumentation. |
| **EOV-04** | Badge redesign | Built the [mockup](https://claude.ai/code/artifact/c2dba323-7120-4a13-8e25-d866a5d1b95a) — 5 badges, new names, emblems, flavor text | Approve (or request changes) via the buttons on the mockup. There are 3 open questions on it for you. |
| **NARR-06** | Storm text | Delivered the [audit](https://claude.ai/code/artifact/c546e598-8ca7-4dad-a7ef-86d816acecfe) — all 24 strings catalogued | Hand back your rewrites and I'll apply them. |

---

## How to verify

Local server is the way (Firebase + multi-tab need HTTP, not `file://`):

```bash
python3 -m http.server 8000
```

- **BUG-01:** open `http://localhost:8000/index.html?perf=1` in **Safari**. FPS readout appears top-right. In the console: `ppForceStorm(true)` to force the storm overlay, watch the fps while narration types; `ppForceStorm(false)` to stop. Compare against a non-storm baseline. The `?perf=1` gate means none of this exists in normal play.
- **BUG-02/03/04:** two Chrome tabs against the local server (mind the shared-`localStorage` `pp_id` gotcha — the two tabs share a browser identity). Reproduce your 7pm sequence: guest's turn, clock into the urgent window, toggle the timer off then on (guest stays interactive, clock re-arms at 30s), then refresh the host (game restores, or fails loudly — never silently resets).
- **Everything else:** playable end-to-end in one window. `node scripts/real_game_test.js` and `node scripts/dlog_replay_test.js` both pass.

---

## Things you should know

- **The test harness was broken on `main` before I started** — `scripts/real_game_test.js` had a stale DOM stub and threw before running. Fixed as part of Phase 1 (it's the per-task sanity check everything else leans on).
- **Determinism caveat:** two rules changes consume a different number of RNG calls than before — empty-island docking (NARR-07, no flip) and battle reflip removal (BATL). So a given seed no longer reproduces its *old* game. Expected for rules changes; in-progress multiplayer games and fresh games are fully deterministic among themselves.
- **The D-09 FPS instrumentation is still in the file, on purpose** — it exists so you can verify BUG-01 on Safari. It's one contiguous sentinel-delimited block behind `?perf=1`, inert otherwise. Once you've confirmed Safari, tell me and I'll strip it (it's a one-block delete; tracked as a task).
- **One known AI residual:** ~0.3% of all-bot games stalemate to the 150-round cap when four aggressive bots deny each other resources to a draw. It always terminates and is bot-vs-bot only. I improved the worst case a lot (max battles/game 133→75) but chose not to over-tune the weights on a rare tail. Noted for future.
- **What I did NOT do:** no merge to `main`, no PR, no push. Everything is local commits on `claude/gsd-new-project-skill-40272a` for your review. When you're happy, that branch is what you'd merge. (This work is in the worktree at `.claude/worktrees/gsd-new-project-skill-40272a`.)

---

## Next actions for me (when you're back)

1. You verify Safari (BUG-01) → I strip the D-09 instrumentation.
2. You approve/adjust the badge mockup (EOV-04) → I implement the 5 badges.
3. You rewrite the storm text (NARR-06) → I apply it.
4. You give the multiplayer repro a pass (BUG-02/03/04) → confirm the fix holds with real Firebase timing.

*Handoff written 2026-07-22.*
