# Requirements: Pastry Pirates — v1.2 Playtest Fixes & Polish

**Defined:** 2026-07-25
**Core Value:** The game must stay playable and fair end-to-end in both Safari and multiplayer — a storm must not crash the game, and pausing the multiplayer timer must never destroy game state. This milestone clears a second live-playtest punch list without regressing that value: the critical multiplayer clock stall is the headline fix, and all engine-adjacent changes (storm movement) must preserve deterministic replay.

**Source:** `notes/edits for pastry pirates-2.pdf` (live Safari multiplayer playtest). Large new features from that punch list — interactive tutorial, sound effects, island redesign — are intentionally deferred (see Future Requirements).

## v1 Requirements

Requirements for the v1.2 milestone. Each maps to a roadmap phase.

### Turn Clock (CLOCK)

- [ ] **CLOCK-01**: In a multiplayer game (2+ windows), the turn clock starts running normally so the first turn begins — the game no longer stalls "paused" before it starts, and no timer off/on toggle workaround is needed *(critical)*
- [ ] **CLOCK-02**: A play/pause control is available in multiplayer games so any player can pause without missing bot actions
- [ ] **CLOCK-03**: The large "PAUSED" image is itself a clickable button that resumes the clock when pressed

### Storm Movement (STORM)

- [ ] **STORM-01**: During a storm the boat moves one square at a time across the full dir1+dir2 push (up to 4 squares), and docking/aground checks evaluate at the correct square — fixing the false "the dock held fast" message when the boat is still a square away from the dock

### Narration (NARR)

- [ ] **NARR-01**: A full audit of every narration branch (storm, docking, battle, trade, bribe, etc.) is delivered to Wyatt, cataloguing thematic repetitions/inconsistencies with a pruning recommendation *(audit deliverable — pruning applied after Wyatt reviews)*
- [ ] **NARR-02**: The missing "broke" narration line is restored
- [ ] **NARR-03**: The storm intro line reads "First, the storm pushes you {dir1}" instead of the "pushes everyone 2 squares, then 2 more south" phrasing
- [ ] **NARR-04**: The bribe line is context-smart — "with 2 🪙" when a crate is given, and "paid 5 🪙" when the player has no crates to give
- [ ] **NARR-05**: Whenever the narration box describes an action *you* (the local player) took, it addresses you in 2nd person ("you") instead of 3rd person ("{your name}") — making the narration read more naturally. This includes the "already anchored safely" line (which currently only appears for other players/bots) and every other self-referential narration branch
- [ ] **NARR-06**: Narration text stays fully visible 10% less time before it begins fading

### UI / UX Polish (UI)

- [ ] **UI-01**: Padding between the flippenator row, gameboard, narrator, captains box, and footer is audited and normalized to consistent spacing
- [ ] **UI-02**: Icons that rise out of boats stay fully opaque for 1 second, then begin fading at the current rate (fade starts later)
- [ ] **UI-03**: The moveable-square orange highlight has its max size reduced by 10%
- [ ] **UI-04**: Moveable squares have a more distinct mouse-hover effect
- [ ] **UI-05**: Clicking "Host a Crew" goes straight to the lobby/seat screen, skipping the redundant intermediate "Create the game" screen
- [ ] **UI-06**: The lobby shows each name once — your seat reads "{name} – you" (or "{captain} – you" when no name is typed), and joined players show their name once (no "Crustbeard – Crustbeard" doubling)

### Link & Social Preview (META)

- [ ] **META-01**: Shared links and search results show a preview image (Open Graph / Twitter card metadata)
- [ ] **META-02**: The site serves a favicon

### Support Button (KOFI)

- [ ] **KOFI-01**: A Ko-Fi "Buy me a cookie" button appears both in the footer (right of Feedback, styled the same) and in the Credits modal (after the credits text, at the bottom), using the provided Ko-Fi embed

### Verification (VERIFY)

- [ ] **VERIFY-01**: A manual Safari + Chrome multiplayer playtest (two windows) confirms the critical clock stall is fixed and a game starts and plays through end-to-end
- [ ] **VERIFY-02**: The determinism regression harness stays green (30/30) — storm-movement and any engine-adjacent changes do not break lockstep replay

## Future Requirements

Deferred to a later milestone. Tracked but not in this roadmap.

### Interactive Tutorial (TUT) — deferred from v1.2

- **TUT-01**: A 30–60s interactive tutorial that walks new players through the goal, board features (Tortuga, islands, ingredients, boats, rival boats, wind compass, click-to-move), the captains box (your row, needed ingredients red/green/yellow, dubloons), the flippenator, the turn clock, the narration box, and the steps of a turn — following best practices for games of this type
- **TUT-02**: When the tutorial finishes, the player is automatically dropped into a solo game continuing with the choices they made during the tutorial
- **TUT-03**: A thin yellow "How To Play" button sits above the four play-mode buttons, beneath the Player Name field, to launch the tutorial

### Sound Effects (AUDIO) — deferred from v1.2

- **AUDIO-01**: Luis's sound effects (staged in `sfx/`) play at appropriate game moments, on by default (e.g., `fishing.mp3` also plays when dropping anchor in a storm)
- **AUDIO-02**: A mute button sits to the right of the turn clock
- **AUDIO-03**: Luis is credited for the sound effects in the Credits modal

### Island Redesign (ISLAND) — deferred from v1.2

- **ISLAND-01**: Every island is 4 squares (not 3)
- **ISLAND-02**: Each island has a unique shape/orientation
- **ISLAND-03**: An island's ingredients are placed on adjacent squares
- **ISLAND-04**: Island art is placed on the square that has no ingredient
- *(Note: touches deterministic board generation — must be re-baselined against the determinism oracle)*

### Carried forward from v1.1 (still deferred)

- **NETMOD-01**: Migrate from Firebase compat SDK to the modular v9+ SDK (cleaner unsubscribe story)
- **DX-01**: JSDoc typedefs for event objects to reduce loosely-typed event bugs
- **DX-02**: Isolated pure replay-runner function extracted proactively (only if the replay seam surfaces bugs)

## Out of Scope

Explicitly excluded for v1.2. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Interactive tutorial, sound effects, island redesign | Large features split out of v1.2 by decision (2026-07-25); each warrants its own milestone slice — island redesign additionally touches deterministic board generation |
| Bundler / minifier toolchain (Vite/esbuild/rollup) | Native ES modules preserve the "no build step" principle |
| TypeScript migration | Out of scope; multiplies blast radius |
| New game modes or mechanics beyond the deferred features | Still expansion, not this polish pass |

## Traceability

Which phases cover which requirements. Populated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CLOCK-01 | Phase 13 | Pending |
| CLOCK-02 | Phase 13 | Pending |
| CLOCK-03 | Phase 13 | Pending |
| STORM-01 | Phase 14 | Pending |
| NARR-01 | Phase 15 | Pending |
| NARR-02 | Phase 15 | Pending |
| NARR-03 | Phase 15 | Pending |
| NARR-04 | Phase 15 | Pending |
| NARR-05 | Phase 15 | Pending |
| NARR-06 | Phase 15 | Pending |
| UI-01 | Phase 16 | Pending |
| UI-02 | Phase 16 | Pending |
| UI-03 | Phase 16 | Pending |
| UI-04 | Phase 16 | Pending |
| UI-05 | Phase 16 | Pending |
| UI-06 | Phase 16 | Pending |
| META-01 | Phase 16 | Pending |
| META-02 | Phase 16 | Pending |
| KOFI-01 | Phase 16 | Pending |
| VERIFY-01 | Phase 17 | Pending |
| VERIFY-02 | Phase 14 | Pending |

**Coverage:**

- v1 requirements: 21 total
- Mapped to phases: 21 (Phases 13–17)
- Unmapped: 0

---
*Requirements defined: 2026-07-25*
*Traceability populated: 2026-07-25 (roadmap created — Phases 13–17)*
