---
phase: quick-20260731-tradewind-arrival-animation
status: complete
date: 2026-07-31
tasks_completed: 2
tasks_total: 2
commits: 1
requirements: []
files_modified:
  - src/ui/util.js
  - src/ui/board.js
  - src/ui/flow.js
  - scripts/host_guest_parity_check.js
  - art-review/narration-inventory.json
---

# The trade-wind sweep dragged the boat across the board instead of round the ring

## How this was actually found — read this first

**Two rounds of code reading got the diagnosis WRONG, and a 5-second screen recording got it right.**

The first reading concluded "the entry square is skipped" — true, but a fraction of it. The second
reading accepted the comment at `src/ui/util.js:965`, which argues that re-aiming a 350ms glide
every 95ms "reads as one continuous travel ALONG the ring". That reasoning is plausible, it is
written confidently, and **it is wrong about what appears on screen.** It was believed for a day.

Wyatt pushed back — *"i'm not sure you've quite grasped the bug"* — and supplied
`notes/trade winds animation bug.mov`. Frame-stepping it produced the detail nobody thought to look
for:

> **`activeRing` — the white sonar ripple — runs about TWO SQUARES AHEAD of the boat for the entire
> sweep.**

The ring is moved by the *same* `paintShipAt()` call on the *same* beat, but it carries **no css
transition**, so it snaps to each square exactly. It was drawing the correct path the whole time.
The boat simply never went there. Nothing in the source says this; only the recording does.

**The lesson worth keeping: a claim about what an animation LOOKS like cannot be verified by
reading the code that produces it.**

## The bug

1. The player clicks a trade-wind square. The boat is still inland.
2. That square is **never drawn**. `liveRender()` at the call site does write it, but this function
   ran synchronously through to its first `await` and painted `path[0]` over the top — and a browser
   paints once per task, so only `path[0]` ever reached the screen. (`rimSweepPath` also excludes
   the starting square, by a deliberate and separately-tested contract.)
3. So the sweep began with the boat still rendered **inland**.
4. Each hop was then re-aimed after 95ms while the glide needed 350ms, making the boat a heavily
   damped follower. **A damped follower chasing a target around a curve takes the CHORD, not the
   ARC** — so it cut the corner and drifted diagonally across the middle of the board.

Wyatt: *"the boat kind of gets dragged over the islands in a shorter version of the ark."* The arc
looked short because the boat was cutting across the inside of it.

Both tiers had this, because assertion 3 already guarantees host and guest share one stepper.

## The fix — two parts

**A. Arrive first.** `paintShipAt(seat,from)` then `await sleep(RIM_SWEEP_ARRIVE_MS)` (350ms) before
the loop. **The await is the load-bearing half** — it is the yield that lets the browser paint the
arrival at all. The paint alone is the same no-op that caused the bug.

**B. Let the boat follow the ring.** `setShipGlideMs(seat, RIM_SWEEP_GLIDE_MS)` (86ms, 90% of the
step) for the sweep's duration, restored in the `finally`. **Total sweep duration is unchanged** —
still `RIM_SWEEP_STEP_MS` per square, so the "square-by-square, quickly" intent survives. What
changes is that each hop lands, so the boat traces the ring.

Restoring in `finally` and **before** the corrective paint matters: a turn expiry mid-sweep would
otherwise strand the ship on an 86ms glide for the rest of the game, making every ordinary move snap.

**Ride-along:** `drawBoard()`'s ship transition is now derived from `SHIP_GLIDE_MS` instead of a
literal `.35s`. util.js's constant carried the comment *"must match drawBoard()'s ship
`transition: transform .35s`"* — two hand-synced numbers in different files, and `setShipGlideMs`
would have made it three.

## What was deliberately NOT changed

- **`rimSweepPath`** — its exclusion of the starting square is deliberate and pinned by
  `narration_flow_test.js` across 12 boards and every rim square. The fix belongs in the animation.
- **`RIM_SWEEP_STEP_MS` (95ms)** — the pace is right; the glide was the problem.
- **`src/engine/index.js`** — byte-identical. No event-stream change, so no determinism re-record.

## New standing gate — `host_guest_parity_check.js` assertion 4

Both properties are invisible in review (they look like ordinary paint calls) and the tree passed
every other gate while the bug was live. Assertion 4 pins: paints `from` **and yields** before the
loop; retunes the glide **and restores it in a `finally`**.

Red-proofed with four drills, and **4a is the REAL pre-fix body copied from `1ac3d10`** — the code
the recording was made against, not a synthetic stand-in. 4b is the trap version that paints the
arrival but never yields, which is what someone "fixing" this from a summary would write; it still
fails. 4d is anti-vacuity.

## Verification

| Check | Result |
|---|---|
| `npm test` | **exit 0** — 17 gates |
| `host_guest_parity_check.js --drill` | **ALL 4 ASSERTIONS RED-PROOF DRILLED OK** |
| `src/engine/index.js` | byte-identical |
| Determinism corpus | 31/31 |
| `art-review/narration-inventory.json` | line-number drift only — **0** non-line changes |

---

# FOLLOW-UP, same day: Part B was replaced outright — per-square stepping is gone

Wyatt tested the above in Safari and sent a second recording (`notes/tradewinds jitter.mov`):

> *"it works, technically, but it looks really jittery because it's working exactly as we designed
> it, it's going square by square very quickly, but as it goes around the edge of the circle, this
> means that it moves according to a step function instead of a smooth, rounded motion."*

**The fix above was correct and still looked wrong, and that is the whole lesson.** Frame-stepping
the second recording confirmed both halves: the ring now travels *with* the boat (Part B worked),
and the motion is unmistakably discrete hops down the right-hand edge.

Landing on each square is right for a **storm push** — 1-2 squares, each one meant to be read. It is
wrong for a boat carried by a current along a ring, because **a ring walked one cell at a time is a
staircase**, and no per-square beat, however well tuned, can be a smooth arc. So per-square stepping
was removed rather than retuned.

## What replaced it

- **`rimSweepCurve()`** (`src/ui/flow.js`) — a pure, exported, Node-testable function: Catmull-Rom
  through the ring cell centres, then **resampled to even spacing** so a constant traversal rate
  gives a constant *speed* (raw spline samples would slow through curves and hurry the straights —
  the same class of artefact being removed).
  - Deliberately **not** a circular arc fitted to the ring. The rim is very nearly a circle today
    (every rim cell sits 7.0–7.3 cells from centre) so a fitted arc would look identical and cost
    less code — but it would bake in a board shape the deferred **island-redesign** milestone
    explicitly changes.
- **`paintShipAtPoint()`** (`src/ui/board.js`) — sub-square painter. `paintShipAt` can only address
  whole cells, which *was* the staircase. No shared-cell nudge while in flight (it would twitch the
  boat sideways over occupied squares); the resting nudge returns with the final `paintShipAt`.
- **Timer-driven traversal, progress derived from elapsed time**, with a one-tick linear glide so
  the browser bridges between targets and absorbs `setTimeout` jitter.

**Part A (arrive first) was kept unchanged** — it is why the boat now starts *on* the clicked square.

## The decision that mattered most: NOT requestAnimationFrame

rAF is the obvious tool for smooth motion and it is the wrong one here. `src/ui/panel.js:334` already
records why, for the typewriter: **rAF callbacks are FULLY SUSPENDED (not throttled) in a hidden tab**,
so an awaited rAF loop never resolves and freezes the entire game loop the moment a player switches
tabs. This was also reproduced live the same day — the automation tab reported
`visibilityState: "hidden"`, rAF returned zero frames across every attempt, and the game stalled
mid-turn each time.

`sleep()` is `setTimeout`-based and keeps firing when hidden. Deriving progress from elapsed time
means a throttled tick advances *further along the curve* rather than stretching the sweep, so a
backgrounded sweep completes instead of crawling. **Drill 4e pins the rAF version as a failure.**

## A vacuous test, caught before commit

The first draft of the "hugs the ring" assertion used `g.grid` — **which does not exist**; the grid
size lives on `g.cfg.grid`. Every radius came out `NaN`, and `r < rMin - 0.75` is false for `NaN`, so
the assertion checked **nothing** while printing PASS. It was caught only because the summary line
printed `max drift ... NaN cells`.

Fixed, and a `Number.isFinite` guard now fails loudly rather than silently passing. That is the
fourth vacuous check this project has caught; printing the measured number in the PASS line is what
exposed it, and is worth keeping as a habit.

## Verification (follow-up)

| Check | Result |
|---|---|
| `npm test` | **exit 0** — 17 gates |
| `host_guest_parity_check.js --drill` | **ALL 4 ASSERTIONS RED-PROOF DRILLED OK** (6 drills on assertion 4) |
| `rimSweepCurve` geometry | 288 curves over 8 seeds × every rim cell |
| — largest sample gap | **0.088 cells** (a step is 1.0; threshold 0.35) |
| — spacing spread | **0.0004** — constant speed |
| — max drift off the ring band | **0.012 cells** — it hugs the ring |
| Smoothness threshold red-proof | staircase gaps measure 1.00 and **fail**; the curve measures 0.063 and passes |
| `src/engine/index.js` | byte-identical |

New drills: **4e** (rAF traversal — the hidden-tab hang) and **4f** (tick-counted instead of
elapsed-time — crawls when throttled). Drill **4a** remains the real pre-fix body.

## OPEN — needs Wyatt's eyes, and cannot be closed here

**The pacing is a feel call and no gate can answer it.** Knobs, all named and adjacent in
`src/ui/util.js`:

- `RIM_SWEEP_ARRIVE_MS` (350) — the arrival beat. Raise toward `STORM_STEP_MS` (420) for a moment of
  rest at the channel mouth before the winds take hold.
- `RIM_SWEEP_MS_PER_CELL` (110) — how fast the boat is carried round the arc.
- `RIM_SWEEP_MIN_MS` / `RIM_SWEEP_MAX_MS` (420 / 1500) — the floor and ceiling, so a 2-cell sweep is
  not a flicker and a 12-cell one is not a voyage.
- `RIM_SWEEP_TICK_MS` (24) — the motion tick; lower is smoother and costs more paints.
- The easing is `rimSweepEase` in `src/ui/flow.js` — currently ease-in-out, so the winds take hold
  and the whirlpool receives the boat rather than snapping it.

A second recording is the right way to settle both. This was never verifiable from the automated
browser: the tab reports `visibilityState: "hidden"`, and Chrome suspends animation frames entirely
in a hidden tab, so frame capture returned zero frames every time and the game stalled mid-turn.
