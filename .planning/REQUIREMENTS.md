# Requirements: Pastry Pirates

**Defined:** 2026-07-22
**Core Value:** The game must stay playable and fair end-to-end in both Safari and multiplayer — a storm must not crash the game, and pausing the multiplayer timer must never destroy game state.

## v1 Requirements

Requirements for this edit-pass milestone. Each maps to a roadmap phase.

### Critical Bugs

- [ ] **BUG-01**: Storm rendering runs at an acceptable frame rate in Safari (no near-crash); suspected lerping narration box effect is rolled back or replaced
- [ ] **BUG-02**: Pausing the multiplayer timer, then unpausing, resumes an interactive game (host and guest can act)
- [ ] **BUG-03**: A page refresh during multiplayer does not reset the game to its start state
- [ ] **BUG-04**: The deterministic engine continues to function after a pause/unpause/refresh cycle

### Battle Mechanics

- [ ] **BATL-01**: Broadside reflips are removed from battles for the attacker
- [ ] **BATL-02**: Broadside reflips are removed from battles for wind advantage
- [ ] **BATL-03**: Post-battle position swap is removed (defender no longer lands in the prime re-attack spot)

### AI Intelligence

- [ ] **AI-01**: AI captains understand and use the new (reflip-free) battle mechanics
- [ ] **AI-02**: AI captains understand and use the wind advantage
- [ ] **AI-03**: AI trades with the captain who actually holds the needed resource (prefers a bot with 2 of a resource over one with 1)
- [ ] **AI-04**: AI captains understand trade winds
- [ ] **AI-05**: AI captains no longer get stuck in corners or when surrounded on 3 sides by islands
- [ ] **AI-06**: AI plays a strategically devious-but-fair game (not trivially beatable every game)

### Narration

- [ ] **NARR-01**: Tails-flipped docking narration shows the ingredient image before the ingredient name
- [ ] **NARR-02**: Post-trade narration states each captain gets +1 for cooperating "like good friendly pirates"
- [ ] **NARR-03**: A storm blowing the same direction twice in a row says "it's still" rather than "now"
- [ ] **NARR-04**: Any wind (including storms) continuing the same direction two turns in a row gets added narration (e.g. "this southerly is gusting", "won't quit")
- [ ] **NARR-05**: Text speed multiplier is decreased by 20% so finished sentences linger less
- [ ] **NARR-06**: All storm-time text is audited and surfaced to Wyatt for rewrite
- [ ] **NARR-07**: Docking on an empty island grabs 3 with no flip, using a new narration line ("{Player} docks at {island} and finds no {image}{ingredient}, so grabs 3{coin}")

### UI/UX

- [ ] **UI-01**: Turn clock image is not cropped on the left/right edges
- [ ] **UI-02**: Turn clock outer edge radiates orange as time ticks down from 20 to 0
- [ ] **UI-03**: Boat emojis last 2x longer (both movement and fade are slower)
- [ ] **UI-04**: A caught fish shows the Sugarfish image emerging from the boat, not from the fishing line
- [ ] **UI-05**: The "STORM" word and its emoji/image are removed from under the compass
- [ ] **UI-06**: Yellow movable squares have juicier styling, a bounce animation, and a hover effect signaling clickability
- [ ] **UI-07**: Leave-game modal reorders/restyles: "Nope, stay aboard" (faded blue) on top, "Aye-leave the game" styled like the current Stay-aboard button below
- [ ] **UI-08**: The parley Back button goes back exactly one step, not two
- [ ] **UI-09**: Flippenator FLIP coin background is less orange; only the word "FLIP" is orange
- [ ] **UI-10**: Feedback box copy reads "straight to Wyatt, the pirate-slash-dev who built this. Want to give him a cookie?"

### Bot Personalities

- [ ] **BOT-01**: Bot personality choices are removed from the multiplayer lobby UI
- [ ] **BOT-02**: Personalities are hardcoded per captain — Davy Scones=balanced, Crustbear=pirate, Dough Hook=trader, Flaky Jack=rusher

### End of Voyage

- [ ] **EOV-01**: The blue narration box does not announce the win
- [ ] **EOV-02**: The recipe win appears in its own one-off narration box containing the recipe image, not inside the End of Voyage box
- [ ] **EOV-03**: A new "Unluckiest pirate" badge is awarded to whoever flipped the most tails
- [ ] **EOV-04**: All 5 badges are redesigned — bigger images, new names, flavor text, and current stat — approved via mockup before implementation
- [ ] **EOV-05**: The ending "moment" is more celebratory

## v2 Requirements

None deferred — the full punch list is in v1 scope.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Modular refactor of `index.html` monolith | Real debt but out of scope for an edit pass; fix bugs in place |
| New game modes or mechanics beyond the punch list | This milestone is polish + bug fixing, not expansion |
| Auto-generated storm copy | Storm text is authored by Wyatt; the audit produces a list for him to rewrite (NARR-06) |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BUG-01 | Phase 1 | Pending |
| BUG-02 | Phase 1 | Pending |
| BUG-03 | Phase 1 | Pending |
| BUG-04 | Phase 1 | Pending |
| BATL-01 | Phase 2 | Pending |
| BATL-02 | Phase 2 | Pending |
| BATL-03 | Phase 2 | Pending |
| AI-01 | Phase 2 | Pending |
| AI-02 | Phase 2 | Pending |
| AI-03 | Phase 2 | Pending |
| AI-04 | Phase 2 | Pending |
| AI-05 | Phase 2 | Pending |
| AI-06 | Phase 2 | Pending |
| NARR-01 | Phase 3 | Pending |
| NARR-02 | Phase 3 | Pending |
| NARR-03 | Phase 3 | Pending |
| NARR-04 | Phase 3 | Pending |
| NARR-05 | Phase 3 | Pending |
| NARR-06 | Phase 3 | Pending |
| NARR-07 | Phase 3 | Pending |
| UI-01 | Phase 4 | Pending |
| UI-02 | Phase 4 | Pending |
| UI-03 | Phase 4 | Pending |
| UI-04 | Phase 4 | Pending |
| UI-05 | Phase 4 | Pending |
| UI-06 | Phase 4 | Pending |
| UI-07 | Phase 4 | Pending |
| UI-08 | Phase 4 | Pending |
| UI-09 | Phase 4 | Pending |
| UI-10 | Phase 4 | Pending |
| BOT-01 | Phase 5 | Pending |
| BOT-02 | Phase 5 | Pending |
| EOV-01 | Phase 6 | Pending |
| EOV-02 | Phase 6 | Pending |
| EOV-03 | Phase 6 | Pending |
| EOV-04 | Phase 6 | Pending |
| EOV-05 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 37 total
- Mapped to phases: 37
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-22*
*Last updated: 2026-07-22 after initial definition*
