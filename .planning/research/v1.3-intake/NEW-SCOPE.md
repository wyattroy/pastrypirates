# v1.3 — Scope arising from the decision pass

Requirements that are **not** straightforward entries in the original 63-item punch list. Each either
emerged from Wyatt's answers in `DECISIONS.md`, or was buried inside another item and is being given
first-class standing here.

**Status: provisional.** The `N-xx` ids below are placeholders for discussion. Real requirement IDs
get assigned when v1.3 is formally planned via `/gsd-new-milestone`. Nothing here is written into
`.planning/REQUIREMENTS.md`, which still describes the live, in-flight v1.2 milestone.

---

## N-01 — Pass-and-play test coverage

**Origin:** elevated out of V13-03. Wyatt's PDF bullet bundled it with the timer-disable bug:
*"We haven't checked pass-and-play in any of our unit tests; it must be added to those."*
Confirmed as its own requirement by Wyatt on 2026-07-27.

**What must be true:** an automated gate exercises a pass-and-play session end to end, so a
pass-and-play-only regression cannot ship unnoticed again.

**Why it matters:** this gap is *why* the timer-disable bug survived. Every current `npm test` gate
either runs the headless `Game.play()` simulator — which has no concept of pass-and-play at all — or
performs a DOM-free contract check. Pass-and-play is purely UI-orchestration behaviour living in
`src/orchestrator.js` and `src/ui/lobby.js`, so nothing in the twelve existing gates can see it.
A whole play mode is currently untested.

**Implementation note (from `FEASIBILITY.md`):** this cannot be a headless unit test. It needs a
browser-level smoke test — Chrome-MCP or equivalent — because there is no headless engine equivalent
of the pass-and-play device-handoff flow to assert against.

**Size:** medium. New test *category* for this project, not just a new test file.

**Related:** V13-02 (the timer-disable bug this would have caught), N-02/N-03/N-04 below (the clock
work all lands in the same untested code path).

---

## N-02 — Turn-clock urgency animation

**Origin:** Wyatt's D-01 answer. Not in the original 63 items.

**What must be true:** when the first 20-second phase reaches **5 seconds remaining**, the animated
rings around the clock grow **300% larger** and turn **red** — and that treatment persists through
the entire second 10-second phase, not only the first.

**Why it matters:** D-01's core reasoning. The clock stays ON by default because it adds real energy
to the game, but new players get blindsided by it. Making the endgame of the timer unmissable is half
the mitigation; N-03/N-04 (being able to switch it off) are the other half.

**Size:** small — CSS/animation work on an existing element.

---

## N-03 — Clock disable works, and works locally

**Origin:** V13-02 (the bug) plus Wyatt's D-01 clarification that no settings menu is wanted.

**What must be true:** the existing clock-disable control actually turns the clock off in
pass-and-play.

**Current behaviour:** `watchTimer()` (`src/orchestrator.js:199-217`) arms and disarms the shot clock
by watching a Firebase `timerOff` node. Pass-and-play has no Firebase connection at all
(`appState.room` is null; `appState.passAndPlay=true` at `src/ui/flow.js:966`), so the control is a
silent no-op there. The control is not missing — it is wired to plumbing that mode does not have.

**Change shape:** give it a local, non-Firebase path (toggle `appState.timerOff` directly, then
stop/rearm the shot clock locally) alongside the existing networked one.

**Explicitly NOT in scope:** a settings menu. Wyatt, 2026-07-27: *"we don't need a settings menu at
this stage."* PDF item 7.f's relocation of the toggle into a settings menu defers with the hints
system (D-02 = B).

**Size:** small.

---

## N-04 — Clock control parity across all three modes

**Origin:** Wyatt's D-01 answer.

**What must be true:** solo, pass-and-play, and multiplayer all support **both** pause/unpause **and**
disable/re-enable. Solo mode gains clock disabling, which it does not have today. No mode is a
special case.

**Size:** small-medium — mostly extending N-03's local path to solo and auditing each mode's controls.

**Related:** N-01 should cover this, since all three modes' clock controls are currently untested.

---

## N-05 — Rework "parley" into a different narration path

**Origin:** Wyatt's D-04 answer — *"We can instead work the term 'parley' into a different narration
path."*

**What must be true:** the player-facing control is renamed to "Trade" (V13-45/46/47), but the word
"parley" survives somewhere in the game's voice rather than being deleted outright.

**Why it matters:** the rename is a clarity fix; losing the pirate flavour entirely is a cost Wyatt
does not want to pay.

**Dependency:** this is **copy Wyatt writes**, so it belongs in the D-06 batched writing session. It
should not be invented during implementation.

**Size:** trivial in code; gated on copy.

---

## N-06 — Drop the time-out penalty that confiscates a crate

**Origin:** Wyatt, 2026-07-27, during Phase 15 planning — *"disable the timer penalty that takes a
crate away from a player if their turn is skipped due to 30-second time-out. it's confusing players."*
Not in the original 63-item punch list. Explicitly **not** to be actioned before v1.3 is planned.

**What must be true:** running out the 30-second shot clock costs the player their turn and nothing
else. No crate is confiscated, no coins are taken.

**Why it matters:** the penalty is unclear at the table. A player who times out sees a crate vanish
without a clear cause-and-effect, on top of already losing the turn — a double punishment that reads
as a bug rather than a rule. Losing the turn is punishment enough. This is the same "the clock
blindsides new players" thread as D-01: N-02 makes the clock's endgame unmissable and N-03/N-04 let
you switch it off; this removes the part that stings without teaching anything.

**Current behaviour:** `expireShotClock()` (`src/orchestrator.js:223-258`) strips a resource on every
expiry — a randomly chosen crate if the player holds any (`:242-247`, returned to that island's
supply rather than destroyed), otherwise up to 5 coins (`:248-253`). Either branch records a
`shotclockskip` event and flashes the *"⏰ Snoozing pirates lose their treasure!"* line
(`EVENT_NARRATION.shotclockskip`, `src/ui/util.js:386`).

**Change shape:** stop taking the resource; keep the turn-loss. The narration line then becomes wrong
(nothing tumbles overboard) and needs replacement copy — **which is Wyatt's to write**, so this joins
the batched copy session alongside N-05. Note `shotClockCount` (`src/ui/util.js:474`) tallies both
`shotclock` and `shotclockskip` for the end-of-voyage badges; check whether a badge depends on the
confiscation before removing it.

**Determinism check before planning:** the penalty emits a `shotclockskip` event, so confirm whether
the deterministic corpus ever reaches this path. The shot clock is live-play-only orchestration and
the headless `Game.play()` simulator has no concept of it — so this is *probably* UI-tier and
re-record-free, but it must be confirmed, not assumed. If any fixture does carry a `shotclockskip`,
this becomes a gated re-record (`docs/DETERMINISM-RERECORD.md`).

**Size:** small in code; gated on copy and on the determinism check.

**Related:** N-02/N-03/N-04 (the same clock code path, all currently untested), N-01 (pass-and-play
coverage that would exercise it), N-05 (shares the batched copy session).

---

## Deferred out of v1.3 by these same decisions

- **Tutorial explanation of the turn clock** — Wyatt's D-01 point 4 asked for the (untimed) tutorial
  to explain the timer and how to switch it off. D-02 = B defers the whole hints/tutorial system to a
  dedicated onboarding milestone, so this explanation defers with it. **Accepted interim gap:** v1.3
  ships working controls and the N-02 urgency animation with nothing explicitly teaching them; the
  red treatment is expected to carry that on its own.
- **Settings menu** (PDF item 7.f) — defers with the hints system. See N-03.
