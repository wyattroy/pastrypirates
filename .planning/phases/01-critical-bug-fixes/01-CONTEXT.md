# Phase 1: Critical Bug Fixes - Context

**Gathered:** 2026-07-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the game stay playable end-to-end in Safari and in multiplayer. Two symptom clusters:

1. **Safari storm performance (BUG-01)** — storms drop to a near-crash frame rate in Safari. No frame drops when a storm is not active.
2. **Multiplayer timer + state loss (BUG-02, BUG-03, BUG-04)** — the host "paused" the timer for a human opponent; on unpause the game became completely non-interactive; refreshing to recover reset the entire game to its start state and broke the deterministic engine.

This phase fixes those bugs only. No refactor of the `index.html` monolith, no battle/AI/narration/UI changes (those are Phases 2–6).

</domain>

<decisions>
## Implementation Decisions

### Safari storm performance

- **D-01:** Keep the character-by-character typewriter narration reveal everywhere — including during storms — but rewrite it so it stops forcing style/layout recalc on every tick. The storm rain overlay stays visually as-is. — **Reversibility:** reversible — the reveal is a single self-contained function (`typewriterReveal`), swappable without touching call sites.
- **D-02:** Do not simplify or degrade the storm rain overlay to buy back frames. Visual fidelity of the storm is preserved.
- **D-03:** Do not special-case storms by disabling the type-in effect during them. Narration must behave identically storm or no storm.

### Multiplayer timer

- **D-04:** Do **not** add a ⏸ pause button to multiplayer. The scoped fix is to make the existing ⏱ timer off/on toggle behave correctly. — **Reversibility:** reversible — adding a real MP pause later is additive.
- **D-05:** Toggling the timer off and then back on mid-turn must re-arm the current turn's shot clock with a **fresh 30 seconds**. Today it never re-arms at all, because `startShotClock()` is only called at turn start.
- **D-06:** A 20-second penalty that already fired (player lost 1🌕 to the others, and it was narrated) is **not** refunded when the timer is switched off. Turning the timer off only prevents *future* penalties. The event log stays honest — no rewriting already-narrated events.

### Refresh / state recovery

- **D-07:** When a host refresh happens and the decision-log replay cannot fully rebuild the game, **fail loudly**. Detect the short/incomplete replay and show a "couldn't fully restore this voyage" state with explicit **Resume anyway** / **Restart** choices. Never silently hand back a board that looks reset.
- **D-08:** Both host and guests get a coherent state during that failure — do not leave guests staring at a frozen board with no explanation.

### Verification

- **D-09:** Ship a temporary, toggleable FPS / frame-time readout plus a way to force a storm on demand, so Wyatt can confirm the fix on his own Safari. **Remove the instrumentation before the phase ships.** — **Reversibility:** reversible — instrumentation is additive and explicitly removed at the end.
- **D-10:** Multiplayer verification uses the existing local-server + two-Chrome-tabs harness. Note the known shared-`localStorage` `pp_id` gotcha when driving two seats from one browser profile.

### Claude's Discretion

- Root-causing whether BUG-02, BUG-03, and BUG-04 are one causal chain or three independent defects. Initial evidence suggests one chain (dead clock → hung turn → no decisions logged → replay rebuilds a fresh board from the seed). Confirm before designing the fix.
- The specific mechanism for a cheap reveal (pre-measured clip, opacity pass, batched writes, `requestAnimationFrame` vs. `setTimeout`) — subject to the constraint in D-11 below.
- Whether Firebase watcher cleanup (`.off()`) is required as part of the refresh fix, or can be left to a later phase.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and requirements
- `.planning/ROADMAP.md` §Phase 1 — goal, success criteria, and the stated risk note
- `.planning/REQUIREMENTS.md` — BUG-01 through BUG-04 definitions
- `.planning/PROJECT.md` — core value and the "determinism must stay intact" constraint

### Codebase fragility (read before touching replay or watchers)
- `.planning/codebase/CONCERNS.md` §"Replay Mechanism Complexity" — why the `replaying` flag is scattered across 27 call sites and where decisions can be lost
- `.planning/codebase/CONCERNS.md` §"Firebase Watchers Without Cleanup" — the `.on()` listeners that are never `.off()`d
- `.planning/codebase/CONCERNS.md` §"Multiplayer Sync Edge Cases" — untested paths this phase will exercise
- `.planning/codebase/ARCHITECTURE.md` — host-authority model and data flow

### Source anchors identified during scout
- `index.html:3120` — `typewriterReveal()`, the per-character DOM mutation loop (BUG-01 prime suspect)
- `index.html:3157` — `REVEAL_MS_PER_CHAR` (note: Phase 3 / NARR-05 also touches text speed — coordinate, don't collide)
- `index.html:84-109` — `#stormOverlay` rain layers, `will-change: mask-position`
- `index.html:2551-2571` — storm render toggle in `render()`
- `index.html:2859` — `startShotClock()` (only called at turn start, `index.html:3334`)
- `index.html:2881` — `toggleShotClockPause()` (gated to solo/bot games only)
- `index.html:2911` — `toggleTimer()` / `index.html:2917` `watchTimer()` — the real MP path Wyatt used
- `index.html:3005` — why the ⏸ button is hidden with 2+ humans
- `index.html:2925` — `shotClockTick()` and the 20s penalty fire
- `index.html:4612` — `logDecision()` — writes each decision to Firebase `dlog`
- `index.html:5108` — `resumeHostGame()` — the replay-from-seed recovery path
- `index.html:5209-5221` — `boot()` session-restore branch

### Notes / source of truth for the punch list
- `notes/edits for pastry pirates.pdf` — items 1a and 1b are this phase

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `waitWhilePaused()` / `sleep()` (`index.html:2796-2801`) — existing whole-game freeze mechanism used by solo pause. Shows the established pattern for gating the async turn loop; may inform the timer re-arm fix even though MP pause is out of scope.
- `broadcastClock()` (`index.html:2904`) — single place that pushes clock state to Firebase; the re-arm fix should route through it rather than writing `rooms/{room}/clock` directly.
- `netFail(label)` — established error-surfacing helper that already drives a visible "sync trouble" banner (added in `9592c4e`). Reuse for the loud-failure path in D-07.
- `decodeDec()` / `encodeDec()` — decision-log codec already handles the Firebase wrapper-object round-trip.

### Established Patterns
- **Host authority:** only the host runs the engine and writes state; guests render. Any fix must preserve this — do not let a guest mutate clock or game state.
- **`replaying` guard:** functions check `if(replaying)return` to suppress rendering/broadcast during fast-forward. Any new code in the replay path must respect this or it will double-broadcast.
- **Deterministic RNG:** all randomness goes through `this.r()` (mulberry32 seeded). Replay correctness depends on decisions being consumed in the exact original order from `dlog`.
- **Event log is append-only and narrated:** `game.ev({...})` records events that `EVENT_NARRATION` renders. D-06's "no refund" decision aligns with this — events are not rewritten after the fact.

### Integration Points
- The timer re-arm touches `watchTimer()` → `startShotClock()`, and must not double-arm when both host and a guest toggle near-simultaneously.
- The loud-failure recovery touches `resumeHostGame()` and `boot()`'s session-restore branch, plus needs a new UI state (modal or panel) that does not exist yet.
- The typewriter rewrite touches `panel()` (`index.html:3090-3099`) which stashes `_revealDone` on the element; `flash()` awaits that promise. The rewritten reveal **must** keep returning a promise that resolves only when every character is actually on screen, or the bot-turn loop will desync from narration timing.

</code_context>

<specifics>
## Specific Ideas

- Wyatt's reproduction (the ~7pm ET game, players "WyaARRGH" and "WyHat") is the canonical repro script for BUG-02/03/04: WyHat's turn → clock counts 20→0 → enters the 10-second range → host toggles timer → untoggle → game completely non-interactive → refresh → full reset. Plan should reproduce this exact sequence.
- Wyatt's own diagnosis for BUG-01 — "I think it may be the lerping narration box effect ... a new piece of code from today" — matches `typewriterReveal()`, which is recent and does exactly that. Treat as a strong lead, confirm by profiling.
- Explicit observation to preserve as a test signal: **zero** frame drops when no storm is active. If a candidate fix doesn't explain that asymmetry, it's the wrong fix.

</specifics>

<deferred>
## Deferred Ideas

- **Real ⏸ pause in multiplayer** (host-only or any-seat) — considered and explicitly declined for this phase (D-04). Revisit if the timer-toggle fix proves insufficient in play.
- **Firebase watcher `.off()` cleanup pass** — real debt from `CONCERNS.md`; only pull into this phase if it's a direct cause of the refresh bug. Otherwise its own future phase.
- **Checkpointing the game state every N events** so replay doesn't re-run from turn 1 — a scaling fix from `CONCERNS.md`, out of scope here.
- **Modular refactor of `index.html`** — already recorded as out of scope in `REQUIREMENTS.md`.
- **Text speed multiplier change (NARR-05)** — lives in Phase 3, but touches `REVEAL_MS_PER_CHAR`, the same constant near the typewriter rewrite. Flagged so Phase 3 doesn't collide with this phase's changes.

</deferred>

---

*Phase: 1-Critical Bug Fixes*
*Context gathered: 2026-07-22*
