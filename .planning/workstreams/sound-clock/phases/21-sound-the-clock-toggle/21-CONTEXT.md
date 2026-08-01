# Phase 21: Sound & the Clock Toggle - Context

**Gathered:** 2026-07-31
**Workstream:** `sound-clock` (v1.3 The Game Comes Alive)
**Status:** Ready for planning

<domain>
## Phase Boundary

Luis Zanforlin's six sound effects play at the right game moments, on by default, with a mute button beside the turn clock and Luis credited for them in the Credits modal — plus the turn-timer on/off toggle finally working in solo and pass-and-play via one local, non-Firebase code path (AUDIO-01/02/03, FIX-02/N-03).

**Explicitly NOT in this phase:** the red urgency animation (N-02) and the wider parity/testing sweep (N-04) — both stay in v1.4. No new sound files are commissioned here; this phase works with the six that exist.

**Hard milestone constraint (inherited, non-negotiable):** nothing in v1.3 may touch `src/engine/index.js` or change what it emits. This is what keeps v1.3 clear of the single one-shot determinism re-record scheduled for v1.4 (`docs/DETERMINISM-RERECORD-NEXT.md` §7-8). All sound hooks must live in the UI tier, reading the existing event stream — never by adding, renaming, or re-ordering engine events. **If planning finds it needs an engine change, STOP and re-scope.**

</domain>

<decisions>
## Implementation Decisions

### Which sound plays when

- **D-01:** All six sounds ship with their natural mapping — `ship-move` on sailing, `store-ingredient` on docking to stow an ingredient, `battle-swords` on battles, `fishing` on fishing, `storm` on a storm arriving, `coin-flip` on flips.
- **D-02:** `coin-flip.mp3` fires on **every** flip — battle rounds and routine docking flips alike, not just the dramatic ones. Wyatt's reasoning: it is the game's signature action, and anyone who disagrees now has a mute button. *(Note for the planner: flipping is not one of the 19 engine event types — the hook is the Flippenator UI seam, `humanFlip()` in `src/ui/flow.js:104`, plus `broadcastFlip`/`watchFlip` in `src/orchestrator.js:136-140` for the multiplayer echo.)*
- **D-03:** `fishing.mp3` also plays when dropping anchor in a storm — carried forward from AUDIO-01, and the reason the mapping is deliberately not one-file-per-moment.
- **D-04:** Moments with no sound of their own **borrow** rather than stay silent. The exact set:

  | Moment | Borrows | Rationale |
  |---|---|---|
  | Wind pushes your boat (`windmove`) | `ship-move` | It is your ship moving, just not by choice |
  | A trade completes (`trade`) | `store-ingredient` | It is a crate changing hands |
  | Running aground (`aground`) | `storm` | |
  | Shipwrecked (`shipwrecked`) | `storm` | |
  | Fleeing a battle (`battleflee`) | `battle-swords` | The clash happened; you just left it |
  | Dodging (`dodge`) | `battle-swords` | |

- **D-05:** The win screen gets a sound rather than silence, but **as an explicit placeholder**. Claude selected `store-ingredient.mp3` (5 KB — the short, bright one, closest to a chime). This MUST be marked in code and in the summary as a stand-in for a purpose-made victory sound from Luis. Nothing in the six actually sounds like victory. — **Reversibility:** reversible — one constant swaps when a real file arrives.
- **D-06:** Remaining moments stay silent: `blocked`, `moored`, `turn`, `newround`, `tradewind`, `bakeoff`, `end`, `finish`.
- **D-21:** *(Added after research, 2026-07-31.)* **The live event stream carries 25 types, not 19.** The original count came from grepping the engine only; six further events are emitted from the UI tier (`src/ui/flow.js`) and were therefore missing from D-01..D-06. Research cross-verified 25 against `EVENT_NARRATION`'s key list and `scripts/narration_test.js`. Wyatt ruled on all six:

  | Moment | Sound | Rationale |
  |---|---|---|
  | `blownOut` (a gale blows you off the dock) | `ship-move` | Same case as `windmove` — your ship moved, not by choice |
  | `anchorHold` (your anchor holds in a storm) | `fishing` | Belongs to the anchor-in-a-storm family already mapped to `fishing` at D-03 |
  | `parley` (a captain makes an offer) | *silent* | An offer is not a deal; every bot haggle making noise would wear thin |
  | `sidebet` (Lookout's Call) | *silent* | Already deliberately suppressed in narration to avoid duplicate lines (`narrateLastEvent` returns early on it) |
  | `shotclock` (your turn timer runs out) | `battle-swords` — **placeholder** | See D-22 |
  | `shotclockskip` (a turn is skipped on time) | `battle-swords` — **placeholder** | See D-22 |

- **D-22:** Running out of time **makes a noise** — Wyatt's call, so you notice even if you looked away, rather than relying on the clock going red on screen alone. None of the six sounds is an alarm, so this is an **explicit placeholder**: Claude selected `battle-swords.mp3` (short, percussive, unambiguously adverse). It MUST be marked as a stand-in in code and in the summary, and joins the shopping list for Luis. — **Reversibility:** reversible — one constant swaps when a real alert sound arrives.

### How sounds behave together

- **D-07:** You hear **the whole table** — rival and bot captains' actions play on your screen too, not just your own turn. Matches the fact that every player already *sees* the whole table narrated. Consequence accepted: a bot-heavy game is a noisy game.
- **D-08:** **Storms are the exception** — `storm.mp3` fires **once** when the storm arrives, not once per captain the storm affects.
- **D-09:** The storm sound **fades out when the storm moment ends** — it sits under the storm for as long as the storm is being shown and narrated, then fades as that resolves. Its length therefore varies turn to turn by design; it must never hard-cut and must never drone past the moment. *(Wyatt raised this unprompted: "storm sounds should fade out.")*
- **D-10:** Repeats of the same sound **layer** — a second flip starts its own copy over the first rather than cutting it off or being dropped. A fast battle is meant to build into a flurry. Explicitly rejected: restart-on-retrigger, and ignore-while-playing (the latter would make flips land silently, which reads as broken).
- **D-11:** The storm sits **quieter underneath** the short sounds so flips, clashes and dockings stay clear on top of it. No cap on how many short sounds may layer at once — Wyatt chose the un-capped option deliberately.
- **D-12:** Sound **goes quiet when the game is not the focused tab**, and resumes on return. Nobody gets pirate noises out of a forgotten background tab. Explicitly rejected: keeping sound as a background "your turn is coming" cue.

### The mute button

- **D-13:** Muting is **remembered per browser** across games and reloads — the same treatment the timer setting already gets (`pp_timerOff` in localStorage). Someone who plays with sound off never switches it off twice.
- **D-14:** A **new speaker icon** is drawn in the game's style, shown with `blocked-slash.png` over it when muted — mirroring exactly how the timer toggle shows its on/off states today. Explicitly rejected: reusing `horn.png` (it already renders the 📯 in narration text, so it would carry two meanings). **This adds a small art dependency to the phase** — see Canonical References for the art runbook. — **Reversibility:** reversible — an asset path constant.
- **D-15:** The button is visible **beside the clock, in every mode, for the whole game**. Not on the welcome screen (rejected: would need a second home outside the clock panel).
- **D-16:** Accepted consequence of D-15: the clock panel hides at the end of voyage (`setClockUI()` sets `display:none` when `appState.liveDone`), so the mute button disappears at the win screen. Mute state still holds — a muted player stays muted through the celebration — they just cannot change it there. Not treated as a defect.

### The timer toggle in solo and pass-and-play

- **D-17:** Switching the timer **off** stops the countdown **immediately**, un-timing the player whose turn is in progress — identical across solo, pass-and-play and multiplayer.
- **D-18:** Switching the timer back **on** mid-turn **re-arms the clock** for the current player right away. This is not optional polish: multiplayer already does this because omitting it caused the *"I paused the timer and then the game wouldn't continue"* freeze (the BUG-02 fix at `src/orchestrator.js:210-216`). Solo and pass-and-play must not reintroduce it. *(Wyatt initially chose plain "stops immediately"; when shown that this would re-create the fixed bug, he confirmed full parity.)* — **Reversibility:** costly — the failure mode is a game-freezing regression in two modes, found only by playing a full turn with the toggle flipped both ways.
- **D-19:** The timer setting stays **remembered per browser**, as it already is. "On by default" governs a player who has never touched it — not a reset every game. All three switches (timer, mute, and the existing pause) now behave consistently.
- **D-20:** After this phase there should be **no mode where the toggle is greyed out**. The D-41 greyed-with-a-reason pattern is a fallback for genuine dead-ends only; a control that silently does nothing is explicitly what this phase exists to remove.

### Claude's Discretion

- Exact fade curve and duration for the storm fade-out (D-09), so long as it tracks the on-screen storm moment and never hard-cuts.
- The relative volume the storm sits at underneath the short sounds (D-11).
- The mechanism for the local, non-Firebase timer path (D-17/D-18) — the constraint is behavioural parity with the multiplayer path, not any particular structure.
- Which of the six files, if any, needs loudness normalising so no single sound is jarring next to the others.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and requirements
- `.planning/workstreams/sound-clock/REQUIREMENTS.md` — AUDIO-01/02/03 and FIX-02/N-03 as scoped for this workstream, plus the four milestone-wide constraints
- `.planning/workstreams/sound-clock/ROADMAP.md` — phase goal, what this workstream owns, concurrency boundaries
- `.planning/V1.3-V1.4-PLAN.md` §"Phase 4 — Sound & the Clock Toggle" — the plain-language statement of intent, including *why* the clock toggle was moved in beside the sound work

### The clock toggle specifically
- `.planning/todos/pending/2026-07-31-solo-mode-needs-disabled-turn-clock-button.md` — **read this before planning the toggle.** It documents that solo already has the clock and pause (only `#scTimerToggle` is hidden), that the requirement as originally written under-delivers Wyatt's later D-01 ruling, and that a greyed placeholder is the opposite of what was asked for
- `src/orchestrator.js:165-170` (`toggleTimer`) — the function that returns early with no Firebase connection; this is the bug
- `src/orchestrator.js:201-219` (`watchTimer`) — carries the BUG-02 re-arm fix that D-18 requires parity with
- `src/ui/panel.js:84-97` (`setClockUI`) — where `#scTimerToggle` is hidden in solo, and where the mute button is anchored

### Determinism — the hard fence
- `docs/DETERMINISM-RERECORD-NEXT.md` §7-8 — why the engine is untouchable for the whole of v1.3

### Art
- `notes/art-generation-process.md` — the runbook for producing the new speaker icon (D-14). **Note:** this file exists on disk in Wyatt's main project folder but `notes/` is in `.gitignore`, so it is NOT in git and NOT visible from a worktree. Research flagged it as missing; it is not missing, only untracked. Ask Wyatt for it rather than concluding it does not exist.
- `assets/icons/blocked-slash.png` — the established "switched off" overlay, already used by the timer toggle

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`pp_timerOff` in localStorage** (`src/orchestrator.js:168`, read back at `:1274`): a working, shipped pattern for persisting a player preference per browser. Mute (D-13) should follow it rather than invent a second approach.
- **`blocked-slash.png` + `iconImg()`**: the existing on/off icon idiom. The mute button (D-14) reuses it wholesale — only the base icon is new.
- **The clock panel already renders in every mode.** `#shotClockPanel` and the ▶/⏸ pause were deliberately un-gated from a host-only check, so **AUDIO-02's anchor exists today** and the mute work is not blocked by the toggle work. These two halves of the phase can proceed in parallel.
- **The 19 engine event types** (`aground`, `anchor`, `bakeoff`, `battle`, `battleflee`, `blocked`, `dock`, `dodge`, `end`, `finish`, `fish`, `moored`, `newround`, `sail`, `shipwrecked`, `trade`, `tradewind`, `turn`, `windmove`) are the read-only surface the sound mapping keys off.

### Established Patterns
- **UI tier may not import the main tier directly.** `src/ui/panel.js` reaches orchestrator behaviour through `netHandlers()` — see the CLOCK-03 comment at `src/ui/panel.js:102-104`. A new audio module must respect the same layering.
- **`narrateLastEvent()`** (`src/ui/panel.js:527`) is where the last event is turned into a line — the natural neighbourhood for event-driven sound, and already viewer-aware via `describeFor`/`pickNarrVariant`.
- **`setClockUI()` re-runs on a 500ms interval** and defensively resets handlers each tick (CLOCK-03). Any mute button wired into that panel must be re-entrant — set up so a re-render cannot double-bind or leak a handler.

### Integration Points
- New audio module (this workstream owns it) ← reads the event stream and the Flippenator flip seam
- `src/ui/panel.js` `setClockUI()` ← mute button render and click wiring
- `src/orchestrator.js` `toggleTimer()` ← the local non-Firebase path
- `index.html` `#creditsModal` (line ~939) ← Luis's sound-effects credit (AUDIO-03). He is already credited there for mechanics; this adds sound, it does not duplicate the entry.

</code_context>

<specifics>
## Specific Ideas

- **"Storm sounds should fade out."** — Wyatt, unprompted, and the only thing he raised outside the questions asked. Treat the storm's fade as a named acceptance criterion, not an implementation detail.
- The six files are committed at `sfx/` as of `9f757f9` — `battle-swords`, `coin-flip`, `fishing`, `ship-move`, `store-ingredient`, `storm`, ~306 KB total. They had sat untracked in the working folder since 2026-07-24 and were invisible to every branch and clone until this phase.
- Wyatt's instinct throughout was toward **liveliness over restraint**: sound on every flip, the whole table audible, sounds layering rather than cutting each other off. Where a judgement call is close, lean lively — the mute button is the release valve.

</specifics>

<deferred>
## Deferred Ideas

- **A purpose-made victory sound from Luis.** `store-ingredient.mp3` at the win screen is a flagged placeholder (D-05), not a decision to keep it.
- **A purpose-made time-out alert from Luis.** `battle-swords.mp3` on the shot clock expiring is likewise a flagged placeholder (D-22).
- **Sound files for the moments still borrowing or silent** — a shopping list for Luis: shipwreck, running aground, fleeing, the win, and a turn-timer alarm.
- **N-02 red urgency animation** and **N-04 the wider parity/testing sweep** — already assigned to v1.4, out of scope here per the workstream roadmap.
- **Muting before a game starts** (a welcome-screen control) — considered and rejected for this phase at D-15; would need a second home outside the clock panel.
- **A "your turn" cue that survives a background tab** — considered and rejected at D-12.

</deferred>

---

*Phase: 21-sound-the-clock-toggle*
*Context gathered: 2026-07-31*
