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

## OPEN — needs Wyatt's eyes, and cannot be closed here

**The pacing is a feel call and no gate can answer it.** Two knobs, both named and adjacent in
`src/ui/util.js`:

- `RIM_SWEEP_ARRIVE_MS` (350) — the arrival beat. Raise toward `STORM_STEP_MS` (420) for a moment of
  rest at the channel mouth before the winds take hold.
- `RIM_SWEEP_GLIDE_MS` (86) — how crisply each hop lands during the sweep.

A second recording is the right way to settle both. This was never verifiable from the automated
browser: the tab reports `visibilityState: "hidden"`, and Chrome suspends animation frames entirely
in a hidden tab, so frame capture returned zero frames every time and the game stalled mid-turn.
