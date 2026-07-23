# Pastry Pirates

## What This Is

Pastry Pirates is a browser-based, pirate-themed pastry board game playable solo (against AI captains) or in real-time multiplayer via Firebase sync. Players sail a grid of islands gathering ingredients, trading, battling, fishing, and racing to bake a winning recipe. This milestone is a focused edit pass — a 15-item punch list from live playtesting covering two urgent bugs plus battle, AI, narration, UI/UX, bot, and end-of-voyage improvements.

## Core Value

The game must stay playable and fair end-to-end in both Safari and multiplayer — a storm must not crash the game, and pausing the multiplayer timer must never destroy game state.

## Requirements

### Validated

<!-- Inferred from existing shipped code (see .planning/codebase/). -->

- ✓ Browser-based pastry pirate board game (grid of islands, ingredient gathering, recipe baking) — existing
- ✓ Solo play against AI captains — existing
- ✓ Real-time multiplayer via Firebase with deterministic engine + replay — existing
- ✓ Battle system with broadside/wind mechanics — existing
- ✓ Trading, fishing, and storm/wind systems — existing
- ✓ Narration system for game events — existing
- ✓ End-of-voyage summary with stats and badges — existing
- ✓ Bot personality selection in multiplayer lobby — existing

### Active

<!-- This milestone's scope. Grouped into 6 phases (see ROADMAP.md). -->

**Phase 1 — Critical Bug Fixes**
- [ ] Fix Safari low-frame-rate/near-crash during storms (suspect: lerping narration box effect from recent change)
- [ ] Fix multiplayer timer pause: unpause leaves the game uninteractive; refresh wipes all game state; deterministic engine stops working

**Phase 2 — Battle & AI Overhaul**
- [ ] Remove broadside reflips from battles (both attacker and wind advantage)
- [ ] Remove position swap after battle (stops defender landing in prime re-attack spot)
- [ ] Teach AI the new battle mechanics
- [ ] Teach AI the wind advantage
- [ ] Fix AI trade logic (trade with the bot that actually has the needed resource)
- [ ] Teach AI to understand trade winds
- [ ] Fix AI getting stuck in corners / when surrounded on 3 sides by islands
- [ ] Make AI strategically devious-but-fair (currently beatable every game)

**Phase 3 — Narration System**
- [ ] Tails-flipped docking narration shows the ingredient image before the ingredient name
- [ ] Post-trade narration: each gets +1 for cooperating "like good friendly pirates"
- [ ] Same storm direction twice in a row → say "it's still" not "now"
- [ ] Any wind (incl. storms) same direction two turns → add narration ("this southerly is gusting" / "won't quit")
- [ ] Decrease text speed multiplier by 20%
- [ ] Audit all storm text and surface it to Wyatt for rewrite
- [ ] Empty island → grab 3, bypass the flip, with new narration line

**Phase 4 — UI/UX Polish**
- [ ] Fix turn clock cropping (left/right edges cut off)
- [ ] Turn clock radiates orange as it counts down 20→0
- [ ] Boat emojis last 2x longer (move + fade slower)
- [ ] Caught-fish shows Sugarfish image out of the boat, not the fishing line
- [ ] Remove "STORM" word + emoji/image under the compass
- [ ] Yellow movable squares: juicier styling, bounce animation, hover affordance
- [ ] Leave-game modal: reorder/restyle — "Nope, stay aboard" (faded blue) on top, "Aye-leave" styled like current Stay-aboard below
- [ ] Parley Back button goes back one step, not two
- [ ] Flippenator: FLIP coin background less orange, only the word "FLIP" orange
- [ ] Feedback box copy → "straight to Wyatt, the pirate-slash-dev who built this. Want to give him a cookie?"

**Phase 5 — Bot Personalities**
- [ ] Remove bot personality choices from the multiplayer lobby UI
- [ ] Hardcode per captain: Davy Scones=balanced, Crustbear=pirate, Dough Hook=trader, Flaky Jack=rusher

**Phase 6 — End-of-Voyage Celebration**
- [ ] Blue narration box must not announce the win
- [ ] Recipe win shown in its own one-off narration box with the recipe image (not inside End of Voyage box)
- [ ] New "Unluckiest pirate" badge (most tails flipped)
- [ ] Redesign all 5 badges — bigger images, new names + flavor text + current stat (mockup for approval first)
- [ ] Make the ending "moment" more celebratory

### Out of Scope

- Full modular refactor of the 5,000+ line `index.html` monolith — real debt, but out of scope for this edit pass; fix bugs in place
- New game modes or mechanics beyond the punch list — this milestone is polish + bug fixing, not expansion

## Context

- **Codebase**: mapped in `.planning/codebase/`. Game logic, UI, and multiplayer sync live in a single ~5,200-line `index.html`. `lab.html` is a secondary/experimental page. `cocoa_pirates_sim.py` is a Python simulator. Assets and art in `assets/` and `art-review/`.
- **Known debt relevant to this work**: 40+ global variables, Firebase `.on()` watchers registered without `.off()` cleanup (memory leaks / stale handlers), a deterministic engine + replay system that is fragile — all three intersect the two urgent bugs.
- **Playtesting source**: the 15-item punch list came from a live multiplayer game (~7pm ET) plus Safari testing, documented in `notes/edits for pastry pirates.pdf`.
- **Multiplayer test harness**: Chrome tabs + Firebase; shared-localStorage `pp_id` gotcha; synthetic-prompt injection for deterministic remote-render checks (see MEMORY.md).

## Constraints

- **Tech stack**: Vanilla HTML/CSS/JS in `index.html`, Firebase Realtime DB for multiplayer — edits happen in place, no framework introduction
- **Compatibility**: Must run correctly in Safari (the storm perf bug is Safari-specific) and Chrome
- **Determinism**: The multiplayer deterministic engine + replay must remain intact — timer/pause fixes must not break lockstep state
- **Approval gates**: End-of-voyage badge redesign and storm-text rewrite require Wyatt's explicit sign-off before/within implementation

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Sequence critical bugs (Safari storm perf + MP timer pause) first as Phase 1 | They break core playability; everything else is polish on a working game | — Pending |
| Fix in place rather than refactor the monolith | Edit pass scope; refactor is large and separately tracked as out of scope | — Pending |
| Mockup-then-approve gate for end-of-voyage badges | Wyatt explicitly wants to approve badge presentation before build | — Pending |
| Storm-text audit produces a list back to Wyatt for rewrite | Copy is authored by Wyatt, not auto-generated | — Pending |
| Hardcode bot personalities to captain identities | Removes lobby choice; personalities become part of each captain's character | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-22 after initialization*
