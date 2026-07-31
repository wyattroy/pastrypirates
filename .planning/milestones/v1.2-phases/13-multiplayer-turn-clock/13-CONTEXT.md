# Phase 13: Multiplayer Turn Clock - Context

**Gathered:** 2026-07-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the multiplayer turn clock start on its own and be fully controllable. Three things:

1. **CLOCK-01 (critical):** A multiplayer game starts cleanly without the clock stalling "paused" before the first turn — no timer off/on toggle workaround needed.
2. **CLOCK-02:** A true play/pause control is available in multiplayer so any player can pause without missing bot actions.
3. **CLOCK-03:** The large PAUSED image is itself a clickable button that resumes the clock.

Not in scope: asset-loading/boot-ordering rework (filed to backlog as LOAD-01/02/03), narration, storm movement, or any other punch-list item.
</domain>

<decisions>
## Implementation Decisions

### CLOCK-01 — the stall (reframed during discussion)
- **D-01:** The stall is **NOT a live code bug in the refactored version.** Verified live during this discussion: a **clean-slate** Safari multiplayer game (site data cleared) starts the clock running normally on its own. In Chrome it never reproduced at all. The earlier "stall" came from **stale/mismatched local session data** left in `localStorage` by the pre-refactored version.
- **D-02:** Fix direction = **harden the boot against stale/mismatched local state** so a returning player who last played the old version starts clean, rather than chasing a first-turn clock bug that does not reproduce on a clean slate. Approach is for research/planning to determine — e.g. detect and clear/migrate old/incompatible `localStorage` keys (`pp_timerOff`, `pp_sess`, `pp_solo`, resume/decision-log state) on boot. — **Reversibility:** costly — clearing/migrating persisted keys touches the resume/recovery path (`getMyId`/`saveSession`/host-refresh replay) and a wrong migration could wipe a legitimately in-progress game; version-guard rather than blanket-clear.
- **D-03:** **Do NOT treat "timer off at start" as the bug.** `timerOff` is a legitimately *remembered preference*: the host reads `pp_timerOff` from `localStorage` and seeds the shared Firebase flag on boot (`src/orchestrator.js:976`). A game that boots with the timer off but plays normally is working as designed. The hardening in D-02 must distinguish "remembered off" (keep) from genuinely stale/incompatible state (clear).

### CLOCK-02 — multiplayer pause
- **D-04:** Multiplayer pause is a **true, global freeze of the entire game** — it halts the countdown AND any bot captains mid-play, so nothing happens until someone resumes. ("Without missing bot actions" = a real freeze, not just stopping the countdown.) Reuse the solo pause mechanism: `shotClockPaused` doubles as the whole-game pause flag via `waitWhilePaused()`/`sleep()`, which is how solo already freezes bots (`src/ui/util.js:535-539, 607-628`). This must be host-authoritative and synced so guests see the paused state.
- **D-05:** **Keep** the existing ⏱ timer on/off toggle in multiplayer AND add the ▶/⏸ pause. Two separate controls: the ⏱ toggle removes countdown pressure (timer off, decisions never time out); the ▶/⏸ pause freezes the whole game. Note this revisits the old `D-04` code comment ("multiplayer on the ⏱ toggle only"; `src/ui/util.js:593`) — that constraint is now intentionally lifted.
- **D-06:** **Anyone can pause or resume, anytime** — any player (host or guest), even when it is not their turn. A guest's pause/resume must reach the host (host runs the game loop and bots), so it needs to sync (e.g. a shared Firebase pause flag the host reacts to), analogous to the existing `timerOff` sync path (`toggleTimer`/`watchTimer`, `src/orchestrator.js:147-171`).
- **D-07:** On resume, the current player's 30s countdown **picks up where it left off** (e.g. 12s left when paused → 12s left on resume), matching solo behavior today via `shotClockPauseElapsed` (`src/ui/util.js:612-628`).

### CLOCK-03 — clickable PAUSED image
- **D-08:** When paused, the **large pause symbol** shown in the middle of the clock (the `#shotClockNum` area rendering `PAUSE_SYMBOL_IMG`, `src/ui/panel.js:84`) becomes itself a clickable button that resumes. Not the whole clock panel, and no new large overlay/artwork.
- **D-09:** This clickable-to-resume behavior applies in **both solo and multiplayer** (consistent everywhere the game can be paused). Today only the small corner `#scPause` button resumes (`src/orchestrator.js:1011`); the big symbol becomes a second resume affordance.

### Determinism guardrail
- **D-10:** Pause and timer are **wall-clock / UI concerns, not engine state.** None of these changes may affect the deterministic engine or lockstep replay — the determinism regression harness must stay green (30/30, VERIFY-02). The engine (`src/engine/`) has no clock/pause access by design; keep it that way.

### Claude's Discretion
- Exact detection/clear/migrate strategy for stale `localStorage` on boot (D-02) is open — research and planning decide, subject to the version-guard caution in D-02.
- The precise sync shape for the pause flag (D-06) — a new Firebase node vs. reuse of an existing channel — is an implementation detail for planning, as long as it mirrors the host-authoritative pattern already used for `timerOff`/`clock`.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — CLOCK-01/02/03 (this phase); LOAD-01/02/03 and the Future Requirements section (explicitly out of scope, filed during this discussion).
- `.planning/ROADMAP.md` §"Phase 13: Multiplayer Turn Clock" — goal and success criteria.

### Source of the punch list
- `notes/edits for pastry pirates-2.pdf` — the live Safari multiplayer playtest that produced these items.

### Shot clock / pause / timer code (the surface this phase edits)
- `src/ui/util.js` — shot-clock engine: `startShotClock`, `stopShotClock`, `rearmShotClock`, `shotClockTick`, `toggleShotClockPause`, `soloBotGame`, `waitWhilePaused`, `armClock` (`~L505-664`). The solo pause/freeze mechanism to be extended to multiplayer lives here.
- `src/ui/panel.js:51` — `setClockUI()` renders every clock state incl. the paused branch with the large `PAUSE_SYMBOL_IMG` (`L84`) that CLOCK-03 makes clickable.
- `src/orchestrator.js` — `broadcastClock`/`toggleTimer`/`watchTimer`/`watchClock`/`expireShotClock` (`~L140-215`), the `timerOff` boot-seed (`L976`), and button wiring incl. `$("scPause").onclick`/`$("scTimerToggle").onclick` (`L1011-1012`). The host-authoritative sync pattern to mirror for pause.
- `src/main.js:145-157` — visibility-change auto-pause (solo) and the `setClockUI` 500ms interval.
- `index.html:821-825` — shot-clock panel markup (`#shotClockPanel`, `#scPause`/`#scPauseImg`, `#scTimerToggle`, `#shotClockNum`).
- `src/net/writers.js` / `src/net/watchers.js` — `timerOff` and `clock` set/watch (the sync template for a new pause flag).
- Boot / stale-state surface (CLOCK-01 hardening): `src/ui/util.js:718-725` (`getMyId`/`saveSession`/`clearSession`, `localStorage` keys) and `src/orchestrator.js` `boot()`/resume path.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Solo pause mechanism** (`shotClockPaused` + `waitWhilePaused()`/`sleep()`): already freezes bots by stalling every awaited sleep — this is exactly the "freeze everything" behavior CLOCK-02 wants; extend it to multiplayer rather than build new.
- **`timerOff` sync pattern** (`toggleTimer` → Firebase write → `watchTimer` reacts on every client, host acts): the proven host-authoritative template for the new synced pause flag (any-player-can-pause, D-06).
- **`shotClockPauseElapsed`** already implements "resume where it left off" (D-07) in solo — reuse for multiplayer.

### Established Patterns
- Host is the single game-loop authority; guests are render-only and reach the host by writing to Firebase, which the host watches. Pause must follow this.
- Clock/pause state is intentionally outside the deterministic engine (`src/engine/` is DOM/clock/Firebase-free). Keep pause in the UI/net layer (D-10).
- Persisted preferences (`pp_timerOff`) intentionally survive across games and browser sessions via `localStorage`.

### Integration Points
- New multiplayer pause control wires into `#shotClockPanel` alongside `#scPause` and `#scTimerToggle`, shown via `setClockUI()` gating (which currently hides ▶/⏸ in multiplayer via `soloBotGame()`).
- CLOCK-01 hardening hooks into `boot()`/session-restore before the game is built.

</code_context>

<specifics>
## Specific Ideas

- CLOCK-01 confirmed live: clean-slate Safari = clock starts normally; the failure only appeared with pre-existing `localStorage` from prior play. Chrome never reproduced. So the milestone's "Safari-specific" pattern here is really "stale-local-state-specific."
- "Freeze everything" was Wyatt's explicit framing for multiplayer pause (bots must not act while paused).
- CLOCK-03: the *large* pause symbol specifically (not a new full-board PAUSED overlay) is the clickable resume target.

</specifics>

<deferred>
## Deferred Ideas

Filed to `.planning/REQUIREMENTS.md` Future Requirements during this discussion (out of scope for Phase 13):

- **LOAD-01:** Slow-connection boot must not reveal the game until assets are ready — the 6s escape hatch in `src/orchestrator.js:1076` hides the loader too early on slow links.
- **LOAD-02:** The preload set (`src/ui/util.js:707`) omits icons/badges/compass/clock — should cover all first-view art. (~18 MB total download; board.png alone 4.5 MB.)
- **LOAD-03:** Welcome screen must be the instant default for first-time visitors — the "hoisting the sails" loader must NOT precede it. Load the ~18 MB of game assets only after the player chooses to play, showing the load screen at that entry point. Fast initial site load for everyone.

</deferred>

---

*Phase: 13-multiplayer-turn-clock*
*Context gathered: 2026-07-25*
