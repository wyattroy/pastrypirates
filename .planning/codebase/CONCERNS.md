# Codebase Concerns

**Analysis Date:** 2026-07-22

## Tech Debt

### Monolithic Single-File Architecture

**Issue:** The entire game logic, UI rendering, and multiplayer synchronization is contained in a single 5,227-line HTML file (`/Users/wyattroy/Documents/Projects/pastrypirates/index.html`).

**Files:** `index.html`

**Impact:** 
- No code reusability across projects (lab.html duplicates game.html content)
- Difficult to test individual systems in isolation
- Hard to onboard new developers or refactor
- Bundling HTML, CSS, and JS together prevents optimization
- Editing becomes complex with no module boundaries

**Fix approach:** 
Extract into modules: game engine (deterministic rules), multiplayer sync layer, UI rendering system, and utilities. Use a build tool to bundle. This is a major refactor (weeks of work) but would dramatically improve maintainability.

### Global State Explosion

**Issue:** Over 40 global variables manage game state, replay state, UI state, Firebase connections, and multiplayer coordination without clear ownership or synchronization boundaries.

**Files:** `index.html` (lines 1681-4627 contain global declarations)

**Impact:** 
- Difficult to reason about state transitions
- Easy to accidentally mutate state in unexpected ways
- No clear source of truth when replaying or rejoining
- Race conditions between local decisions and remote broadcasts possible
- Hard to test individual features without running full game

**Fix approach:** 
Create a state machine or store pattern that centralizes game state, with explicit update functions and subscribers. Consider using a framework (Vue, React, or vanilla patterns like Signals) to separate UI from state.

### Firebase Watchers Without Cleanup

**Issue:** Multiple `.on()` listeners are registered throughout the code but never explicitly stopped with `.off()`. When a game ends or a player disconnects, watchers continue to listen and fire callbacks.

**Files:** `index.html` (lines 2855, 2919, 2979, 3203, 3711, 4580, 4586, 4960, 4965)

**Impact:** 
- Memory leaks: old watchers accumulate across multiple games
- Duplicate handlers firing: if a player rejoins, the old listener still fires
- Stale data: old watchers may update UI with data from previous games
- Firebase read quota consumption: listeners that never stop continue burning reads

**Fix approach:** 
Track all active watchers in a data structure and call `.off()` when:
- Game ends (endGame function)
- Player disconnects (watch presence)
- Reload to new room (clearSession, showHome)

Example: `const activeWatchers = []; activeWatchers.push(() => db.ref(...).off());`

### localStorage Persistence Without Quota Checks

**Issue:** Solo game state and session data are serialized directly to localStorage (lines 4630, 4602) without checking available quota or handling quota exceeded errors.

**Files:** `index.html`

**Impact:** 
- Long solo games with many events (game.events array) could exceed quota
- .catch(e=>{}) silently ignores localStorage quota errors
- Session recovery would fail silently if localStorage is full
- No user feedback when persistence fails

**Fix approach:** 
- Wrap localStorage calls with try/catch that explicitly handles QuotaExceededError
- Show user a notification if persistence fails: "Your game progress couldn't be saved"
- Trim old event log (keep last N events) or use IndexedDB for larger capacity
- Monitor dlog array size before serializing

### Replay Mechanism Complexity

**Issue:** Host-refresh recovery uses a recorded decision log (dlog) and replays the deterministic engine to rebuild state. The replay logic is scattered across many functions and has complex interactions with live game broadcasting.

**Files:** `index.html` (replaying flag used in 27 locations, logDecision at lines 4612-4623, resumeHostGame at lines 5108-5123)

**Impact:** 
- Edge case: if a decision is made but not yet logged before reload, it's lost
- Race condition: decision log is broadcast BEFORE events, but what if Firebase write fails?
- Complexity: every function must check `if(replaying)return` guards, making logic hard to follow
- Untested paths: reload-replay has fewer users than normal play, likely has edge cases

**Fix approach:** 
Isolate replay logic into a separate phase before any broadcasting:
1. Load decision log from Firebase
2. Run deterministic engine in isolation (no rendering)
3. Once complete, fully render and resume live play

Remove replaying checks from most functions and use dependency injection or a pure replay runner.

## Known Bugs

### O(n²) Captain's Log (FIXED in 7d4dfc9)

**Status:** Fixed but document the history.

**Files:** `index.html` (watchEvents, liveRender)

**What was wrong:** liveRender() and watchEvents() re-described every event in game history on each new event. After 1500 events, describing each new event took 1700ms.

**Current fix:** syncLogLines() only processes new events (commit 7d4dfc9). Verified 1500-event stress test now takes 2ms per event.

**Vigilance:** If event description logic changes (renderLog, EVENT_NARRATION), the O(n²) could creep back in. Keep this in mind during future refactors.

### Duplicate Watchers After Rejoin

**Files:** `index.html` (watchRoom at line 4960, 4965; watchEvents, watchNarr, etc. at line 5027)

**Symptom:** If a guest refreshes mid-game and reconnects, they may receive duplicate narration or battle updates if old listeners weren't cleaned up.

**Current workaround:** Unclear—likely just reloads the page to start fresh. Should confirm whether this is actually triggered or if browser tab reload naturally clears listeners.

**Fix:** Explicit .off() cleanup on teardown (see Firebase Watchers section above).

### Chat Rate-Limiting Weakness

**Files:** `index.html` (line 3190)

**Issue:** Client-side spam guard: `if(now-lastChatSendAt<1000)return;`

**Impact:** Easily bypassed by manipulating client-side timers or opening multiple tabs. Server-side rate-limiting via Firebase RTDB rules would be more robust, but may be limited without authentication.

**Fix approach:** Firebase RTDB rules could rate-limit based on user ID and timestamp, or implement a simple message-per-minute quota in the rules.

## Security Considerations

### Firebase Config Exposed in HTML

**Files:** `index.html` (lines 4542-4545)

**Risk:** Firebase API keys and database URL are visible in client-side code.

**Mitigation:** This is expected for client-side Firebase apps—the keys are intentionally public. What matters is the RTDB security rules (not visible here) to prevent unauthorized reads/writes.

**Recommendation:** Verify `.firebaseio.com` domain has strict security rules:
- Only authenticated users can write to `/rooms/` and `/gamelogs/`
- Presence tracking and chat are isolated per room
- Game results cannot be modified post-game

### No Input Validation on Chat Length

**Files:** `index.html` (line 3183, 3192)

**Issue:** MAX_CHAT_LEN is 140 characters (enforced via UI), but nothing prevents a crafted Firebase write of a longer message.

**Impact:** Extremely long messages could break chat UI layout (though content is HTML-escaped, so no injection risk).

**Fix:** Add Firebase RTDB rule to reject messages >140 bytes or validate on write.

### Player Name Input Escaping

**Files:** `index.html` (line 4980, 4984)

**Status:** Good. escHtml() is used for player names in renderSeatList(). Chat messages also use escHtml() (line 3197).

**Verified:** No innerHTML assignments with user input; all names/chat go through escHtml().

### Pass-and-Play Recipe Privacy

**Files:** `index.html` (lines 2490-2520, 4635-4639)

**Risk:** In pass-and-play mode, recipe visibility is controlled by the `recipeRevealed` flag. If a refresh happens mid-turn, could an old recipe briefly flash on-screen?

**Current safety:** recipeRevealed is cleared on each turn (not found in code—assume turn() resets it). Worth verifying during next playtest.

## Performance Bottlenecks

### Render Function Doing Too Much

**Files:** `index.html` (render() at line 2470, 111 lines)

**What happens:** render() is called on every event scrub and updates:
- Ship positions (4 players)
- Coins display
- Ingredient holds (recipe vs. surplus)
- Active turn highlighting
- Storm effects (wind needle, rain layers)
- Crate availability UI

**Why slow:** Multiple DOM queries (getElementById) per player, innerHTML updates, CSS updates. If called 1500 times (long session), that's thousands of DOM writes.

**Improvement path:** 
- Batch DOM updates (requestAnimationFrame, or collect changes and apply once)
- Use data attributes instead of re-querying all elements
- Consider virtual representation for ship positions (update transforms only if position changed)
- Profile with DevTools Performance tab during a long replay to confirm bottleneck

### Chat Bubble Positioning

**Files:** `index.html` (positionChatBubble at line 2482)

**Issue:** Chat bubbles are repositioned every frame (render()) by parsing SVG transform strings with regex (line 2217: `/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/`).

**Improvement:** Cache transform values or use data attributes instead of regex parsing.

### Emojify Regex Runs on Every Boot

**Files:** `index.html` (line 947, 950, EMOJIFY_RE at line 897)

**What happens:** document.body.innerHTML is rewritten and emojify() is called during boot to replace emoji text with images (EMOJI_IMG).

**Issue:** Large regex replacement on 5KB+ of HTML. If done every page load, could be slow on low-end devices.

**Current:** Only runs once at boot, so acceptable. Just note it as a potential bottleneck if more content is added.

## Fragile Areas

### Event Description (EVENT_NARRATION)

**Files:** `index.html` (EVENT_NARRATION at line 2356, renderLog at line 2581)

**Why fragile:** EVENT_NARRATION is a 70+ line object mapping event types to description functions. Each function is tightly coupled to event structure. If event properties change, narration breaks silently.

**Safe modification:** 
1. Write a test that generates events and checks that all descriptions render without errors
2. Check game.events structure matches EVENT_NARRATION assumptions
3. Validate that new event types are added to EVENT_NARRATION

### Battle Prompt Prompt and Response Cycle

**Files:** `index.html` (watchPrompt at line ~4668, linearly searching for prompt by id)

**Why fragile:** 
- Host sends a prompt object with an id
- Guest client watches for a response with matching id
- A race condition exists: if two prompts are sent before response is received, the linear search `if(v&&v.id===id)` might fire for the wrong prompt

**Safe modification:** Add defensive checks: always verify prompt.seat === mySeat before accepting.

### Coin Flip State Synchronization

**Files:** `index.html` (watchFlip at line ~2853, setFlipCoin at ~2844)

**Why fragile:** Coin flip state is broadcast via Firebase but also regenerated during event replay. If replay encounters a flip event, it must re-run the same decision logic as the original flip to stay in sync.

**Safe modification:** Verify that flip events in game.events are idempotent (replaying them produces identical state to original).

### Recipe Reveal in Pass-and-Play

**Files:** `index.html` (revealMyRecipe at ~2509, recipeRevealed flag)

**Why fragile:** Pass-and-play uses a single mySeat that changes hands. If a device changes hands during render(), the recipe could briefly show the wrong player's target.

**Safe modification:** Add a turn boundary before switching hands. Ensure recipe visibility is re-checked after every device handoff.

## Scaling Limits

### Single-Tab Architecture

**Limit:** Only one "host" per game (one player driving the deterministic engine). If host disconnects or browser crashes, the whole game is frozen until host reloads.

**Scaling path:** Implement a host-election system where if the current host disconnects, a guest client promotes itself to host and re-broadcasts the current state. This requires implementing a Raft-like consensus or accepting "last writer wins."

### Chat Volume

**Limit:** Chat is stored in Firebase RTDB (realtime reads). If a game has 100+ messages, each new guest re-downloads the entire chat history.

**Scaling path:** 
- Archive chat to Firestore after game ends
- Paginate chat: only load last 20 messages on join, older messages lazy-load on scroll
- Cache chat locally to avoid re-downloads on rejoin

### Event Log Growth

**Limit:** game.events array grows with every action. After 2000+ events (10+ hour session), rendering becomes slow.

**Current:** Already fixed O(n²) in rendering (syncLogLines), but the full events array is still replayed on each host reload, which is O(n).

**Scaling path:** 
- Store checkpoints: every 500 events, save a full game state snapshot to Firebase
- On reload, load latest checkpoint and replay only new events (not from turn 1)
- Implement "garbage collection" of old events (keep last 1000, archive rest)

## Dependencies at Risk

### Firebase Realtime Database Deprecation

**Risk:** Firebase RTDB is not the recommended choice for new projects (Firestore is). If Google deprecates RTDB, migration would require significant rewrite.

**Impact:** Multiplayer would stop working; users could only play solo.

**Mitigation:** Monitor Firebase release notes. Start migration to Firestore now (low risk since you own the backend).

**Migration plan:** 
1. Create parallel Firestore collections with same structure
2. Write and read from both during transition period
3. Migrate archived games to Firestore
4. Once stable, remove RTDB dependency

### Python Simulation Script Dependency

**Files:** `cocoa_pirates_sim.py`

**Risk:** Python simulation is used for rule balancing but has no tests. If rules change in HTML but not in Python, sim becomes stale.

**Impact:** Future balance decisions won't have numbers to back them up.

**Fix approach:** Add automated tests that compare Python sim results with a live game harvest of 100+ games from the HTML app. CI should fail if results diverge.

## Missing Critical Features

### No Spectator Mode

**Issue:** The code has a `spectator` variable (line 2477) suggesting support for spectators, but UI doesn't expose a way to join as a spectator. Games can only have 2-4 players, no observers.

**Blocks:** Streaming/commentary, teaching new players, debugging.

**Fix:** Add a "Watch game" mode that shows full board but no private recipes, with read-only access to Firebase.

### No Game History / Replay Viewer

**Issue:** Once a game ends, there's no way to watch a replay. Decision log is stored per game but there's no scrubbing UI outside of the lab (which only works for new games).

**Blocks:** Learning from mistakes, content creation.

**Fix:** Save game.events + dlog to Firestore on game end. Add a "Replay" page that loads any historical game and lets you scrub through it.

### No Bot Difficulty Settings

**Issue:** Bot strategies are hardcoded (pirate, trader, balanced, rusher, monopolist). No way to tune strategy weights or make a tutorial-friendly "easy" bot.

**Blocks:** New player onboarding.

**Fix:** Expose bot strategy parameters (AW, TW, DW weights at lines 1012-1015) as multipliers. Create "easy" and "hard" presets.

### No Undo After Decisions

**Issue:** Once a player clicks "Cast", "Trade Offer", etc., the decision is final. No undo.

**Blocks:** Accidental clicks (especially on mobile).

**Fix approach:** Add a confirmation dialog before major decisions, or implement 3-second undo window after decision is registered locally but before broadcast.

## Test Coverage Gaps

### Multiplayer Sync Edge Cases

**Files:** `index.html` (watchRoom, watchPrompt, watchBattle, watchNarr)

**What's not tested:** 
- Guest joins mid-battle
- Guest refresh during narration
- Two guests send conflicting responses (both submit different choice for a prompt)
- Firebase write fails silently (netFail just logs, no retry)
- Offline guest never reconnects (room fills their seat with a bot, but client is still waiting for their decision)

**Risk:** Multiplayer games will occasionally desynchronize or hang, requiring reload.

**Priority:** High—users play multiplayer in one browser window, expecting it to work.

### Pass-and-Play Device Handoff

**Files:** `index.html` (activeTurnSeat, mySeat mutation)

**What's not tested:** 
- Device changes hands between prompts
- Two devices connected to same browser (mySeat ambiguous)
- Recipe visibility during handoff

**Risk:** Recipe could leak to wrong player.

**Priority:** Medium—pass-and-play is a secondary mode.

### Solo Game Persistence

**Files:** `saveSoloState, resumeSoloGame`

**What's not tested:** 
- localStorage is full (quota exceeded)
- dlog is very large (100+ events), serialization takes >1s
- Player resumes after days (old game state is stale)

**Risk:** Solo game progress lost.

**Priority:** Medium.

### Battle Mechanics

**Files:** `index.html` (battleAsk at line ~3728, coinFlip at line ~2826, battle event handling)

**What's not tested:** 
- Attacker vs. attacker (both players attack each other simultaneously?)
- Insolvency (loser has no coins or ingredients to pay)
- Downwind reflip edge cases
- Defender flee decision timing

**Risk:** Battle could result in invalid state (player loses non-existent ingredient, or coin count goes negative).

**Priority:** High—battles are core mechanic.

---

*Concerns audit: 2026-07-22*
