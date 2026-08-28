# Forks 4, 5, and the complete shot-clock removal inventory — mapped 2026-08-28

**Read-only investigation. Every claim carries file:line.**

> ## ⚠️ THE DESIGN DOC'S LINE NUMBERS ARE STALE. THE PROSE HELD; THE COORDINATES ROTTED.
>
> | `docs/DISPLAY-RULES.md` says | Reality |
> |---|---|
> | fork 4 = `orchestrator.js:855` | **`recipeDraftNet()` is at `:966`.** `:855` is `await settleSideBets(...)` |
> | fork 5 = `flow.js:2265` | **`netIntroBarrier()` is at `:2634`.** `:2265` is a comment in `humanAct` |
> | PnP interception `flow.js:2249-2261` | **It is at `:2640-2655`** |
>
> **Treat EVERY line number in that document as stale until re-derived.** Off by 100–370 lines.

## THE SIMPLIFICATION NOBODY EXPECTED

**Forks 4 and 5 are not clocked at all.** They call `localAsk` DIRECTLY, bypassing `ask()`
(`util.js:1658`), which is the only thing that wraps a decision in `withShotClock`. `armClock` has
exactly six sites and none is in the draft channel. **Removing the shot clock cannot break forks 4
or 5, and Rule C is irrelevant to both.**

## Fork 4 — `recipeDraftNet()` (`src/orchestrator.js:966`)

Two branches: **pass-and-play** (`:988-996`) walks every seat SEQUENTIALLY behind `passGate`;
**everything else** (`:997-1050`) runs seats CONCURRENTLY via `Promise.all`. The wrong-predicate
site is `:1043` (`seatLocal`).

**Swapping the predicate in isolation is a NO-OP** — `:1043` is only reachable in the `else` of
`if(appState.passAndPlay)`, so `decisionIsLocal` collapses to `seatLocal` there by construction.

**WHAT BREAKS IS THE CONVERGENCE, NOT THE SWAP.** Delete the PnP branch and put `decisionIsLocal`
at `:1043` and, in a 3-human pass-and-play game:
- three concurrent `localAsk` calls render into ONE `#actionPanel`; the last wins; the other two
  promises **never settle** and `Promise.all` at `:1049` **hangs the game forever** — with no shot
  clock left to force it;
- **worse, and before it hangs: it is an INFORMATION LEAK.** `optsFor(p)` renders both of that
  seat's secret recipe choices. `:989-990` exists precisely so "nobody's two recipe choices are ever
  on screen for the seat that comes next".

**Neither predicate is correct for a converged dispatcher.** `decisionIsLocal` is the right TEST,
but the dispatcher must also carry the SEQUENCING: local seats walked serially behind `passGate`,
remote seats concurrent, then joined. The PnP branch does not disappear — it becomes the local half.

Other divergences: the remote renderer (`watchDraftPrompt`, `orchestrator.js:1551-1552`) hand-builds
its card and has **no back, no flip, no colors, no sub, no slider, and never calls `setNeedsAction`**.
`setActor` is called once per seat inside the map (`:1042`), so in a 3-human game the actor points at
the LAST pending seat while all three prompts are open — this site still uses raw `setActor`, not the
converged `applyActiveSeat`.

## Fork 5 — `netIntroBarrier()` (`src/ui/flow.js:2634`)

Wrong-predicate site: `flow.js:2660`. Same no-op-in-isolation analysis.

**ITS PASS-AND-PLAY BRANCH IS THE OPPOSITE OF FORK 4'S, AND IT IS A DELIBERATE PRODUCT DECISION.**
`flow.js:2640-2655`, Wyatt 2026-08-08: *"Dont require passing to the next player for the opening
narration, or the lots drawing narration. Just show those once."* The recorded reasoning is the
load-bearing part: *"A pass-the-device gate exists to keep one player's private information off
another player's screen; neither of these has any."*

So **fork 4 shows EVERY seat in turn (secret); fork 5 shows ONE card for the table (public).**
A single dispatcher that handles one correctly handles the other WRONGLY.
- `decisionIsLocal` cannot express "once" — it is per-seat and returns true N times.
- `waitMsg` (`:2659`) becomes wrong in PnP: there is no waiting when everyone shares a screen.

**Recommendation:** compute the seat set BEFORE the dispatcher, not inside it —
`const asked = appState.passAndPlay && isPublic ? [humans[0]] : humans;` — then run one converged
dispatcher over `asked`.

**Fork 5 reaches the remote side through `netHandlers().onRemoteDraftPrompt`** (`flow.js:2662`, bound
`main.js:88`) because `flow.js` is ui-tier and may not import the orchestrator; fork 4 calls
`remoteDraftPrompt` directly. **A converged dispatcher must live behind that seam or it cannot serve
both forks.**

`scripts/extract_narration_lines.js:939` asserts **exactly 3** call sites of the barrier — any
convergence that adds or removes one turns that gate red.

## SHOT-CLOCK REMOVAL — the inventory

**LEAD FINDING: it is already dormant in shipped play.** `stage.js:3344` seeds
`appState.timerOff = true` for any browser with no `pp4_timerOff` key, and `startShotClock`
early-returns on it (`util.js:1896`). So `shotClockTick` never runs, the penalty is unreachable, and
`turnExpired` is permanently false. **"Remove it even if it breaks" overstates the risk — in the
default configuration there is nothing live to break.**

**THE EVENT DOES NOT TOUCH THE DETERMINISM CORPUS.** `grep` over `src/engine/` finds ZERO
occurrences of `shotclock` — both events are emitted from the UI/orchestrator tier by calling
`game.ev()` from outside the engine (`util.js:2014`, `orchestrator.js:293`). No bot replay fires one.

### REMOVE
`startShotClock` `util.js:1895` · `stopShotClock` `:1906` · `rearmShotClock` `:1922` ·
`shotClockTick` `:1998` · `applyShotClockPenalty` `:2009` · `applyTimerOff` `:1963` · `armClock`
`:1678` · `withShotClock` `:2037` · `expireShotClock` `orchestrator.js:249` · `toggleTimer` `:190` ·
`watchTimer` `:241` · `broadcastClock` `:164` · `watchClock` `:300` · `netWatchTimerOff`
`net/watchers.js:70` · `netSetTimerOff` `net/writers.js:58` · ribbon chip `#pp4Clock`
`stage.js:1105-1115` and its toggle `:1976-1979`.
Call sites: `orchestrator.js:602,640` · `flow.js:669,692,2362`.

### ⚠️ DANGER — four things that are NOT the clock

**D1 — `ask()`'s `armed` promise WILL HANG THE GAME if half-removed.** `util.js:1577-1581` creates
`armed` and installs `appState.clockPendingArm`; `:1658` does `armed.then(()=>withShotClock(...))`.
**`armed` only resolves when `clockPendingArm()` is called**, from exactly two places: the reveal
seam at `panel.js:667-685` and the no-panel belt at `util.js:1649-1653`. **Delete the seam while
leaving `armed` and EVERY PROMPT IN THE GAME NEVER RESOLVES — it hangs on the first prompt.**
Remove `armed`, `clockPendingArm/Local/Text`, the belt and the seam **as ONE atomic change**,
replacing `:1658` with `const idxP=base;`. *This is the highest-risk edit in the job.*

**D2 — PAUSE IS A SEPARATE FEATURE sharing the clock's state and panel. KEEP IT.**
`shotClockPaused` backs `waitWhilePaused` (`util.js:1723`) AND the phone app-switch auto-pause
(`main.js:175-184`), which exists because a hidden tab used to hang a turn forever with no visible
▶. `panel.js:151`: *"D-05: the ⏱ toggle and the ▶/⏸ pause coexist."* Removing `shotClockPaused` /
`applyPauseState` / `toggleShotClockPause` / `watchPause` **removes pause and reopens that bug.**
`#scPause` lives inside `#shotClockPanel` (`index.html:2888-2894`) — you cannot delete the panel
without deleting pause. Rename `shotClockPaused`→`gamePaused` in a FOLLOW-UP, not now.

**D3 — the "Barnacle Brain / slowest to decide" award tallies shot-clock events.**
`util.js:891` (`shotClockCount=mk()`), `:926` (the tally), `:952` (the award row). Remove the events
without the award and **every seat scores 0 and it is handed out by tie-break** — a visibly wrong
end-of-voyage screen. Remove all three together.

**D4 — `expireShotClock` is the ONLY caller of `appState.activePickCleanup`**
(`orchestrator.js:265`). Remove it and `activePickCleanup` becomes write-only — **also remove its
registration in `localPickCell`**, or DISPLAY-RULES' sail-prompt row becomes false in the same commit.

### KEEP-BUT-NEUTER
**`appState.turnExpired`** — ~20 readers, all abort guards (`flow.js:1403,1516,1647,1662,1737,1747,
1773,1843,1879,1894,1983,2237,2242,2329,2343,2358,2409,2424`; `orchestrator.js:819`). With the clock
gone nothing sets it true, so every guard is provably dead — but ripping out 20 `if`s across
`humanTurn`/`humanAct`/`humanTrade`/`humanDock` is a far larger and riskier diff. **Leave the field
permanently `false`, delete only its two writers (`util.js:1900`, `orchestrator.js:258`), and sweep
the reads in a separate commit.**
`setClockUI` `panel.js:64-280` — strip the countdown, keep the paused branch and `pauseEl` wiring.
`scripts/pp4_timeroff_check.js` — keep the legacy `pp_timerOff` migration checks (`:211-235`), delete
only the seed assertion.
`scripts/migrate_app_state.js` — **KEEP UNCHANGED.** A one-off historical migration, not a gate.

### GATES THAT GO RED
`narration_flow_test.js:436` (anchors `expireShotClock` by name) · `narration_test.js:518-543`,
`:555`, `:92-93` · `audio_mapping_test.js:213-214` · `narration_audit_check.js:529,540` ·
`pp4_timeroff_check.js:158-165` · `host_guest_parity_check.js:597` **and** `:1116` (both list
`watchClock`) · `economy_guard_test.js:44` (comment only).
**`extract_narration_lines.js:180-181` is the dangerous one** — removing the events drops two lines
from the extracted copy corpus, so its baseline must be regenerated IN THE SAME COMMIT.

### DOCS THAT BECOME FALSE IN THE SAME COMMIT
`docs/DISPLAY-RULES.md:319-337` — **Rule C in its entirety**; the §3 heading becomes "THE TWO
STANDING RULES" and every "all three" (`:264`) changes. Also `:112-114`, `:118`, `:243`.
That document's own header (`:9-11`) forbids aspirational writing — so these move with the code.

## UNVERIFIED, flagged rather than asserted
- Rule B claims `pickCell` is "already correct". `ask` was confirmed (`util.js:1580`);
  **`pickCell`'s dispatch fork was NOT opened.** Check before relying on it.
