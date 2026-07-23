# Roadmap: Pastry Pirates — Edit Pass

## Overview

This is a brownfield edit-pass milestone against a fully-shipped game (single ~5,200-line
`index.html`). The 15-item playtesting punch list decomposes into 37 v1 requirements across
6 phases. Phase 1 fixes two playability-breaking bugs (Safari storm crash, multiplayer
timer/refresh state loss) and is a hard blocker — it must land before any other phase can be
meaningfully tested. Phase 2 (battle mechanics + AI) is the highest-risk phase because it
touches core game logic and the bot decision engine; battle-mechanic requirements are sequenced
before AI requirements within that phase, since the AI must learn the *new* rules, not the old
ones. Phases 3–6 (narration, UI/UX polish, bot personalities, end-of-voyage) are independent of
each other and of Phase 2's internals — once Phase 1 lands, they can be planned and executed in
parallel waves (`parallelization: true`). Two requirements carry explicit human-approval gates
that must be satisfied before implementation ships: EOV-04 (badge redesign mockup) and NARR-06
(storm-text audit/rewrite). All work is an in-place edit to `index.html` — no refactor of the
monolith, per project scope.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Critical Bug Fixes** - Storms no longer crash Safari and the multiplayer timer pause/refresh cycle no longer destroys game state
- [ ] **Phase 2: Battle & AI Overhaul** - Battles resolve without reflips or the position-swap exploit, and bots play the new rules competently and fairly
- [ ] **Phase 3: Narration System** - Event narration is accurate, better paced, and covers new game states
- [ ] **Phase 4: UI/UX Polish** - Turn clock, boat animation, compass, movable squares, modals, and copy are fixed and polished
- [ ] **Phase 5: Bot Personalities** - Bot personalities are hardcoded per captain and removed from lobby choice
- [ ] **Phase 6: End of Voyage Celebration** - The win is correctly attributed, badges are redesigned (with approval), and the ending feels celebratory

## Phase Details

### Phase 1: Critical Bug Fixes
**Goal**: The game stays playable end-to-end in both Safari and multiplayer — a storm does not crash or hitch the game, and pausing/unpausing or refreshing during a multiplayer game does not destroy game state or desync the deterministic engine.
**Depends on**: Nothing (first phase)
**Requirements**: BUG-01, BUG-02, BUG-03, BUG-04
**Success Criteria** (what must be TRUE):
  1. A storm sequence runs in Safari at an acceptable frame rate without hitching or crashing.
  2. Pausing the multiplayer timer and then unpausing leaves the game interactive for both host and guest.
  3. Refreshing the browser mid-multiplayer-game restores the in-progress game, not a reset to start.
  4. After a pause/unpause/refresh cycle, the deterministic engine keeps producing consistent state for host and guest (no desync).
**Risks**: The deterministic engine's decision-log replay and Firebase watcher cleanup are already fragile (see `.planning/codebase/CONCERNS.md` — "Replay Mechanism Complexity", "Firebase Watchers Without Cleanup"). BUG-02/03/04 fixes touch this exact machinery; changes here have the highest chance of introducing a new desync class if watcher lifecycle and replay guards aren't handled carefully.
**Plans**: TBD

### Phase 2: Battle & AI Overhaul
**Goal**: Battles resolve on a single flip with no reflips or exploitable post-battle repositioning, and bot captains play the new mechanics with competent, fair strategy — not stuck in corners, not trivially beatable.
**Depends on**: Phase 1
**Requirements**: BATL-01, BATL-02, BATL-03, AI-01, AI-02, AI-03, AI-04, AI-05, AI-06
**Sequencing note**: Battle-mechanics requirements (BATL-01, BATL-02, BATL-03) must be implemented before the AI requirements (AI-01 through AI-06) — bots need to learn the new reflip-free, no-swap mechanics, not the old ones.
**Success Criteria** (what must be TRUE):
  1. A battle resolves without any broadside reflip, for either the attacker or wind advantage.
  2. After a battle, the defender is not repositioned into an immediate re-attack spot for the winner.
  3. Bot captains use the new no-reflip battle mechanics and wind advantage correctly when deciding to fight or flee.
  4. Bot captains trade with whichever opponent actually holds the needed resource, preferring a bot with more of it, and factor in trade winds when deciding.
  5. Bot captains never get stuck in corners or when boxed in by islands on three sides.
  6. A human player can no longer beat the bots trivially every game — bots play a devious-but-fair game.
**Plans**: TBD

### Phase 3: Narration System
**Goal**: Narration text is accurate, better paced, and correctly covers new and repeated game states (sustained wind/storm, empty-island docking, trade cooperation, tails-flip docking).
**Depends on**: Phase 1
**Requirements**: NARR-01, NARR-02, NARR-03, NARR-04, NARR-05, NARR-06, NARR-07
**Success Criteria** (what must be TRUE):
  1. Tails-flip docking narration shows the ingredient image before the ingredient name.
  2. Post-trade narration states each participant gets +1 for "cooperating like good friendly pirates."
  3. A storm blowing the same direction on consecutive turns is narrated as "it's still [direction]" rather than "now."
  4. Sustained wind (including storms) holding the same direction for two turns running adds narration describing the sustained gust.
  5. Narration text speed is measurably 20% faster than before (finished sentences linger less).
  6. Docking on an empty island grants 3 with no coin flip, using a dedicated new narration line.
  7. A complete catalogue of all storm-time narration text is delivered to Wyatt for review and rewrite before any rewritten storm copy ships (approval gate — the audit itself is the phase deliverable for NARR-06; the rewrite is Wyatt's follow-up).
**Plans**: TBD

### Phase 4: UI/UX Polish
**Goal**: Turn clock, boat animation, fish-catch visual, compass, movable squares, leave-game modal, parley flow, Flippenator, and feedback copy are fixed and polished per playtesting feedback.
**Depends on**: Phase 1
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07, UI-08, UI-09, UI-10
**Success Criteria** (what must be TRUE):
  1. The turn clock image renders without cropping on the left or right edges.
  2. The turn clock's outer edge visibly radiates orange as the countdown proceeds from 20 to 0.
  3. Boat emoji movement and fade animations last twice as long as before.
  4. A caught fish shows the Sugarfish image emerging from the boat, not from the fishing line.
  5. The "STORM" word and its emoji/image no longer appear under the compass.
  6. Yellow movable squares show juicier styling, a bounce animation, and a hover affordance signaling clickability.
  7. The leave-game modal shows "Nope, stay aboard" (faded blue) on top and "Aye-leave the game" (styled like the current Stay-aboard button) below.
  8. The parley Back button returns exactly one step, not two.
  9. The Flippenator's FLIP coin shows a less-orange background with only the word "FLIP" rendered in orange.
  10. The feedback box copy reads "straight to Wyatt, the pirate-slash-dev who built this. Want to give him a cookie?"
**Plans**: TBD
**UI hint**: yes

### Phase 5: Bot Personalities
**Goal**: Bot personality is no longer a lobby choice — each named captain always plays with a fixed, hardcoded personality.
**Depends on**: Phase 1
**Requirements**: BOT-01, BOT-02
**Success Criteria** (what must be TRUE):
  1. The multiplayer lobby UI no longer offers a bot personality choice.
  2. Each named captain always plays with its hardcoded personality — Davy Scones=balanced, Crustbear=pirate, Dough Hook=trader, Flaky Jack=rusher.
**Plans**: TBD
**UI hint**: yes

### Phase 6: End of Voyage Celebration
**Goal**: The end-of-voyage sequence correctly attributes the win, awards a refreshed and more meaningful badge set, and lands as a celebratory moment.
**Depends on**: Phase 1
**Requirements**: EOV-01, EOV-02, EOV-03, EOV-04, EOV-05
**Success Criteria** (what must be TRUE):
  1. The blue narration box no longer announces the win.
  2. A recipe win displays in its own one-off narration box containing the recipe image, separate from the End of Voyage summary box.
  3. An "Unluckiest pirate" badge is awarded to whoever flipped the most tails.
  4. All 5 badges are redesigned with bigger images, new names, flavor text, and the relevant stat — and Wyatt approves the mockup before the redesign is implemented (approval gate; no badge-redesign code ships before sign-off).
  5. The end-of-voyage moment reads as more celebratory than the current implementation.
**Plans**: TBD

## Progress

**Execution Order:**
Phase 1 first (blocking). Phases 2–6 each depend only on Phase 1 and may be planned/executed in
parallel waves thereafter; Phase 2 carries the highest implementation risk (core game logic) and
has an internal sequencing constraint (battle mechanics before AI). Phases 3, 4, 5, and 6 have no
dependencies on each other.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Critical Bug Fixes | 0/TBD | Not started | - |
| 2. Battle & AI Overhaul | 0/TBD | Not started | - |
| 3. Narration System | 0/TBD | Not started | - |
| 4. UI/UX Polish | 0/TBD | Not started | - |
| 5. Bot Personalities | 0/TBD | Not started | - |
| 6. End of Voyage Celebration | 0/TBD | Not started | - |
