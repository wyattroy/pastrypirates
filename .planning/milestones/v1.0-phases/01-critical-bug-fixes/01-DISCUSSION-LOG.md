# Phase 1: Critical Bug Fixes - Discussion Log

**Date:** 2026-07-22

This log is a human-readable audit record of the discussion. Downstream agents read `01-CONTEXT.md`, not this file.

---

## Pre-discussion scout

Before asking anything, scouted `index.html` and the codebase maps to ground the gray areas in real code:

- **BUG-01 lead:** `typewriterReveal()` (`index.html:3120`) reveals narration character-by-character via a `setTimeout` poll every 16–32ms, mutating live DOM text nodes. Concurrently `#stormOverlay` (`index.html:84-109`) animates two 220%-sized rain layers with `will-change: mask-position`. Per-character mutation forces style/layout recalc on a compositing-heavy page — explains the storm-only asymmetry Wyatt observed.
- **BUG-02 correction:** With 2+ humans, `soloBotGame()` is false, so the ⏸ pause button is *hidden* (`index.html:3005`). What Wyatt used was the ⏱ timer off/on toggle (`toggleTimer()`, `index.html:2911`). Turning the timer back on never re-arms the clock — `startShotClock()` is only called at turn start (`index.html:3334`).
- **BUG-03/04 hypothesis:** Refresh routes to `resumeHostGame()` (`index.html:5108`), which replays the decision log against the seed. An empty/short `dlog` rebuilds a fresh board — which presents exactly as "everything went back to the start". Suggests 02/03/04 are one causal chain.

---

## Area 1 — Safari storm fix strategy

**Question:** The typewriter narration reveal is what's fighting the rain overlay. Which tradeoff?

**Options presented:**
1. Keep typewriter, make it cheap (Recommended) — rewrite so it stops forcing layout each tick; rain untouched
2. Drop typewriter during storms only — narration snaps in mid-storm
3. Simplify the rain instead — cheaper overlay, typewriter untouched
4. Diagnose first, then decide

**Selected:** Keep typewriter, make it cheap

**Captured as:** D-01, D-02, D-03

---

## Area 2 — Multiplayer timer control

**Question:** In multiplayer with 2+ humans, what should the host be able to do when a friend needs a moment?

**Options presented:**
1. Real pause button in MP (Recommended) — host-only ⏸, freezes clock, ▶ resumes with remaining time
2. Just fix the timer toggle — no new button; ⏱ off→on re-arms the current turn with a fresh 30s
3. Any player can pause — same as 1, but any seat

**Selected:** Just fix the timer toggle

**Note:** Chose the smaller-scope fix over the recommended option. A real MP pause is recorded as a deferred idea, revisitable if the toggle fix proves insufficient in play.

**Captured as:** D-04, D-05

---

## Area 3 — Refresh recovery behavior

**Question:** When a refresh happens and replay can't fully rebuild the game, what should players see?

**Options presented:**
1. Fail loudly, offer choices (Recommended) — "couldn't fully restore" + Resume anyway / Restart
2. Fail loudly, host decides — only host chooses; guests wait
3. Always restore, best effort — replay silently, accept partial reset

**Selected:** Fail loudly, offer choices

**Captured as:** D-07, D-08

---

## Area 4 — Penalty handling on timer-off

**Question:** If a player already ate the 20s penalty and the host then switches the timer off mid-turn, is it refunded?

**Options presented:**
1. No refund — it already happened (Recommended) — timer-off only stops future penalties
2. Refund it — undo the coin transfer for the current turn
3. No refund, but re-arm forgiving — keep penalty, clear the fired flag so no double-charge

**Selected:** No refund — it already happened

**Rationale reinforced by code:** the event log is append-only and already narrated; rewriting a narrated event conflicts with the established `game.ev()` pattern.

**Captured as:** D-06

---

## Area 5 — Verification approach

**Question:** How to verify the Safari storm fix before calling Phase 1 done?

**Options presented:**
1. You test in Safari, I instrument (Recommended) — temporary FPS readout + force-storm toggle, removed before ship
2. You just eyeball it — no instrumentation
3. Automated perf harness — repeatable frame-time script, reusable

**Selected:** You test in Safari, I instrument

**Captured as:** D-09, D-10

---

## Claude's discretion (explicitly left open)

- Whether BUG-02/03/04 are one causal chain or three independent defects — confirm by reproduction before designing the fix
- The specific cheap-reveal mechanism (clip, opacity pass, batched writes, rAF vs. setTimeout)
- Whether Firebase watcher `.off()` cleanup is required for the refresh fix or deferred

## Deferred ideas raised

- Real ⏸ pause in multiplayer (declined for this phase)
- Firebase watcher cleanup pass
- Game-state checkpointing so replay doesn't re-run from turn 1
- Coordination note: NARR-05 (Phase 3) touches `REVEAL_MS_PER_CHAR`, adjacent to this phase's typewriter rewrite

## Scope creep

None — discussion stayed within the phase boundary.

---

*Phase: 1-Critical Bug Fixes*
*Discussion: 2026-07-22*
