---
phase: 04-the-networked-bakeoff
plan: 01
subsystem: multiplayer-bakeoff
status: complete
tags: [MP-04, MP-05, MP-06, MP-13, convergence, rule-23, display-rules, onDisconnect]
requires: [03-01]
provides:
  - "playBakeoffLive(spec,io) — ONE bake-off choreography, run by the baker and by every watching captain from the same spec"
  - "the kind:\"bake\" prompt channel — a remote captain takes their own bake in their own browser"
  - "benchPublish/applyBenchSnap — the bench moments channel, riding rooms/<C>/battle, no tenth listener"
  - "showSeatCoins(seat,coins) — the ONE purse renderer, shared with render()"
  - "netForfeitOnDisconnect/netClearForfeitOnDisconnect — presence-loss forfeit, replacing the bake's shot clock"
  - "4/scripts/crew_bake_probe.mjs — the two-browser bake instrument"
  - "prompt_field_parity_check assertion 4 — the bake channel's wire contract, six drills"
  - "host_guest_parity_check ORCHESTRATION_DECL — two new shared rows, watched RED first"
affects: [4/src/ui/bakeoff.js, 4/src/ui/flow.js, 4/src/orchestrator.js, 4/src/ui/board.js, 4/src/net/writers.js, 4/src/main.js, docs/DISPLAY-RULES.md, .planning/ROADMAP.md]
tech-stack:
  added: []
  patterns: [one spec handed to both branches, actor-publishes-not-host, discrete moments not frame streaming, onDisconnect forfeit, red-proof before the row]
key-files:
  created:
    - 4/scripts/crew_bake_probe.mjs
    - .planning/phases/04-the-networked-bakeoff/shots/
  modified:
    - 4/src/ui/bakeoff.js
    - 4/src/ui/flow.js
    - 4/src/orchestrator.js
    - 4/src/ui/board.js
    - 4/src/ui/stage.js
    - 4/src/net/writers.js
    - 4/src/net/index.js
    - 4/src/main.js
    - 4/scripts/bakeoff_shots.mjs
    - 4/scripts/prompt_field_parity_check.js
    - scripts/host_guest_parity_check.js
    - docs/DISPLAY-RULES.md
    - .planning/ROADMAP.md
decisions:
  - "MP-06's remote purse is OPTIMISTIC on the buyer's screen and authoritative on the host. Alternative recorded: a live spend channel."
  - "The bench is published by the BAKER, not the host — so watchBattle is now attached by every client with a room."
  - "benchPublish's guard is `db && room && !replaying`, not Rule A's `isHost && db && room`. Named refinement, written into DISPLAY-RULES §3."
  - "The reveal is one broadcast rendered by every client, including the baker — not computed locally anywhere."
  - "Tasks 3 and 4 landed in ONE commit; splitting them after the fact would mean reconstructing an intermediate state that was never run."
requirements: [MP-04, MP-05, MP-06, MP-13]
metrics:
  crew_runs: 6
  build_stamp: "2026-08-23b"
  gates: "30 in npm test, 8 reading 4/"
---

# Phase 4 Plan 01: The Networked Bake-off — Summary

**A guest now takes their own bake-off turn in their own browser, and every other captain watches it
happen on the same face-down bench instead of reading a waiting note. Before tonight the HOST was
playing the guest's bake, on the host's own screen, while the guest's screen showed nothing at
all — not a bench, not a note. That was measured, not inferred, and it is the finding this phase
started from.**

Build to look for: **`2026-08-23b`**.

---

## 1. TASK 1 — the question open since 2026-08-08, settled by measurement

**A guest's bake was PLAYED ON THE HOST'S SCREEN, by the host's own hands. Not forfeited.**

Full account, with the screenshots and the JSON: `shots/t1/ANSWER.md`. In one sentence: the bench on
the host read `dairy, vanilla, wheat, spice, cocoa`, which is **seat 1's** (the guest's) recipe order
and no other seat's; the CAPTAINS panel showed the guest holding exactly those five crates; and
across the attempt `players[1].bake.attempts` went 0 → 1 while `players[0]`'s stayed at 0. The host
had not baked at all yet.

**It changed what the fix had to be**, which is why the plan put it first: Task 2 had to REMOVE a
bench from the host's screen as well as add one to the guest's. A branch that only added the guest's
would have left two captains tapping the same crates.

**Red-proofed in the same read** (HARD-WON-LESSONS §2): the identical expression reported a bench
where one existed — 5 crates, painted 364×323, hit-tested at its own centre, attributed to a unique
seat — and reported its absence where there was none. Visibility is the painted rectangle plus
`elementFromPoint`, never `offsetParent`.

---

## 2. WHAT A CAPTAIN CAN DO NOW THAT THEY COULD NOT

| | Before (`2026-08-23a`) | After (`2026-08-23b`) |
|---|---|---|
| A guest at the ovens | the host played it; the guest's screen was blank | **taps their own crates in their own browser** |
| The host, during a guest's bake | painted the guest's bench and answered for them | **watches the same face-down bench** |
| Every other captain | a waiting note, or nothing | **the same face-down bench, the same shuffle, the same badges, the same verdict** |
| A guest paying to re-watch | impossible — no remote path existed | **purse drops on their own screen, prompt stays open, host settles the same number** |
| A captain who closes their tab mid-bake | would have hung the table (once the clock went) | **forfeits in ~2.5s to the engine's own guess; the voyage carries on** |
| The shot clock on a bake | 30 seconds | **gone — the finish line gets as long as it needs** |

---

## 3. THE CONVERGENCE ANSWER, AND WHETHER IT HELD

> **What makes the baker's screen and a watcher's screen agree?**

**They are the same function reading the same object.** `playBakeoffLive` used to take the live
player and the engine's setup, which meant only the machine holding the engine could run it. It now
takes ONE SPEC — `{order, before, swaps, locked, attempts}` — and **that same spec is what crosses
the wire**. There is one swap loop and one badge painter in the file. The only thing that differs
between tiers is the second argument: `{onRewatch,onBench}` for a baker, `{watch}` for a watcher.

**Nothing is streamed frame by frame.** What crosses the wire is the DISCRETE MOMENTS a watcher
cannot derive — Ready pressed, each pick landing and un-landing, a paid replay restarting the
shuffle, the verdict.

**The trap the plan named was refused.** No second listener, no second renderer, no snapshot-driven
jump-cut animation beside the working one.

**AND THE ANSWER IS NOT ON THE WIRE.** The engine's post-shuffle bench — the solution — was read for
exactly one line, and that line is recoverable from `before` + `locked`, because a locked crate never
moves. A captain cannot read their own solution off their network tab. `slots` appears only on the
REVEAL snapshot, when the crates are being lifted off and it is public anyway.

### One rule that is genuinely new, and it is written into DISPLAY-RULES

**The captain whose decision it is publishes the bench; every other client renders it.** Not the
host — the baker is the only party who knows when Ready was pressed or which crate was just tapped,
**and the baker may be a guest**. That is one rule taking the ACTOR as its input, the same shape
DISPLAY-RULES §2 already sanctions for the captains list, and the same shape as `watchChat`. The
consequence: **`watchBattle` is now attached by EVERY client with a room**, host included, because a
host that only ever wrote to that node could never watch a rival's bake. Its BATTLE branch stays
guest-only behind an explicit guard — declared, not hidden, and §4's fork 3 still records it as
unconverged.

---

## 4. EVERY CRITERION, WITH THE MEASUREMENT

### ✅ 1. A guest takes their own bake-off turn; no captain's bake is handed to the bot or the host

`shots/t2/02-first-bench-answerable-{guest,host}.png`, both browsers at the same instant:

- **GUEST**: The Bake-Off card, attempt 1, bench VISIBLE 364×323, **5 crates**, *"Tap the crates in
  recipe order. Tap again to undo."*, buttons `Watch again 🌕1` and `Bake it!`. The recipe on the
  card is the guest's own — their five crates are in their own CAPTAINS row.
- **HOST**: **no bench at all**; a narration bubble over test2's boat reading *"test2 steps up to the
  ovens…"*. (Task 3 then replaced that note with the bench itself.)

### ✅ 2. Every other captain watches the bake — same face-down bench, no waiting note

`shots/t3/07-after-second-bake-{host,guest}.png`, compared element by element:

| Element | HOST (test1, baking) | GUEST (test2, watching) |
|---|---|---|
| Header | 🧁 The Bake-Off — attempt 1 | identical |
| Recipe card, 5 lines | Melt the butter / Stir in the chocolate / Whisk in the sugar / Beat in the eggs / Fold in the flour | **identical, same icons, same order** |
| Bench | eggs, wheat, cocoa, dairy, sugar — all lifted, all ringed pink | **identical arrangement, identical rings** |
| Badges | 4, 5, 2, 1, 3 | **4, 5, 2, 1, 3** |
| Verdict line | "0 of 5 in place. Those stay put; the rest get shuffled again tomorrow." | **identical** |
| Controls | "In the oven…" (greyed) | **none** — the one intended difference |
| CAPTAINS purses | 6 / 1 / 2 / 4 | same four numbers, rotated per viewer |

**Neither side shows a waiting note.** And the DOM badge arrays are **byte-identical** at three
sampled moments including MID-REVEAL — at `06-second-verdict` both screens show crate 2 still
covered and picked while the other four are lifted and stamped wrong with the same numbers. Two
screens caught on the same frame of the same animation.

`shots/t4/d0-before-drop-host.png` is the face-down half: the watching host sees five **covered**
crates, the baker's recipe card, and *"test2 is at the ovens — watch the crates."*

### ✅ 3. A captain pays to re-watch mid-bake, sees their purse drop, and the prompt stays open

Measured on a real remote captain (`shots/t3/result.json`, `purse`):

```
guestBefore     [6,5,2,1]      the purse drawn on the buyer's own screen
guestOptimistic [6,4,2,1]      the instant they bought — seat 1 goes 5 -> 4
hostSettled     [6,4,2,1]      the host's authoritative purse, after settling
guestRendered   [6,4,2,1]      the guest's screen, reconciled
```

**The optimistic figure and the settled one agree.** The prompt stayed open — the run went on to
enter a guess and commit it after the replay.

### ✅ 4. A bake logs as ONE decision per captain, carrying both facts

The host's decision log after two bakes, one of which bought a look:

```
[ 0, {"g":[0,1,2,3,4],"w":1}, {"g":[0,1,2,3,4],"w":0} ]
```

One entry per bake, each carrying the guess **and** the coins spent. This is true **by construction,
not by care**: both branches resolve `{guess,rewatches}` into the same `fillLocked → onLogDecision`
tail, so there is no second log write to keep in step.

*Not directly measured: a host reload replaying to the same finish. The property the criterion rests
on — one entry, both facts, from either tier — is measured above; the reload itself is not. Said
plainly rather than claimed.*

### ✅ 5. No shot clock, and a captain who drops does not stall the table

**The clock is gone, and everything that fed it went with it** — the `armed` promise, the `onArm`
callback, the bail-out belt, and the `withShotClock` wrapper. No countdown appears on either screen
during a bake (`shots/t4/d0-before-drop-*.png`).

**The drop, measured** (`shots/t4`, `drop.verdict`):

```
guest tab closed at  dlog=2  events=14
+2.5s                dlog=3  events=15   last event: bake
verdict: tableCarriedOn true, secondsToCarryOn 2.5, dlogEntriesAdded 1
         lastDlogEntry {"g":[0,3,1,2,4],"w":0}
```

**~2.5 seconds, exactly ONE decision-log entry, carrying both facts — the same entry a completed
bake writes.** By the next screenshot the host is at its own bake intro card: the voyage carried on.

**The negative case** — a captain who finishes normally is never forfeited — is the plain crew run,
where three complete bakes resolved with real guesses and real re-watch counts and nothing was
forfeited.

---

## 5. GATES — RED FIRST, EVERY TIME

**`scripts/host_guest_parity_check.js` assertion 6 gains two rows, and both were watched RED against
the pre-task tree before they were added.** Run against build `2026-08-23a` reconstructed into a
temp tree:

```
FAIL assertion 6 — orchestration parity
      playBakeoffLive    listeners=0  host-loop=1  shared
      applyBenchSnap     listeners=0  host-loop=0  shared
  - PARITY-ORCH: playBakeoffLive( is driven 1x from the host's game loop and is reachable from
    ZERO of the 9 listeners — the host draws it and a guest cannot.
  - PARITY-ORCH-ABSENT: applyBenchSnap( is not called anywhere ... must not pass as "shared"
```

Green on the current tree at `listeners=1 host-loop=2` and `listeners=2 host-loop=3`. All six
assertions still pass `--drill`.

**`4/scripts/prompt_field_parity_check.js` gains assertion 4** — the bake channel's sibling of the
ask and sail assertions — with **six drills, all caught by name**: `locked` dropped from the wire,
`swaps` dropped on the guest, the branch vanishing, the payload vanishing, a guest-only WRAPPER
replacing the named choreography, and a second `playBakeoffLive` appearing. The drill's disposable
tree had to learn to carry `bakeoff.js`, without which every bake drill failed for the wrong reason —
a drill that proves nothing.

**`npm test`: 30 gates, 8 reading `4/`, exit 0.** `no_undef_check`, `seat_arg_check`,
`stage_import_check` green.

---

## 6. THE DETERMINISM DOOR IS STILL OPEN

**Nothing the engine emits changed.** Every change is UI/orchestration tier. `bakeSetup`,
`bakeResolve` and `bakeRewatch` are called in the same order with the same arguments; `bakeTurnLive`
still computes `setup` before it looks at who is playing. `bakeRewatch` draws no random numbers, so
charging a remote captain's count at settle cannot fork the seeded stream.

`4/scripts/fixtures/` still does not exist. Phase 3's one-way door is where Phase 3 left it.

---

## 7. SOLO AND PASS-AND-PLAY — the two modes a two-tab test cannot see

- **Solo:** `4/scripts/bakeoff_shots.mjs` — a full bake start to finish, and D-16 still holds (the
  card leaves at ~6.9s and never comes back).
- **Pass-and-play:** `4/scripts/bakeoff_shots.mjs --pnp`, added in this plan — the first captain
  bakes, then *"Pass the wheel to Juju"*. **`passGate` still fires between two bakes**, which is the
  one thing that had to stay AHEAD of the new fork.

Both were re-run on the final build; see §10.

---

## 8. DEVIATIONS FROM PLAN

### Auto-fixed issues

**1. [Rule 1 — bug] The prompt clear was wiping the baker's own bench**
- **Found during:** Task 3, in a real crew room.
- **Issue:** a remote captain answered, `remotePrompt` removed the prompt node, `watchPrompt` fired
  with `p===null` and ran `panel("")` — so the one captain who had actually played the bake was the
  only one who never saw how it went.
- **Fix:** the clear skips a live `.bko`. The card leaves through its one exit, `retireBakeCard`.
- **Files:** `4/src/orchestrator.js`.

**2. [Rule 1 — bug] Teardown after setup: a paid re-watch destroyed the watcher's new bench**
- **Found during:** Task 3, measured — a watching captain lost their bench the moment the baker
  bought another look.
- **Issue:** a paid replay bumps the epoch, so the old watcher session is finished and a new one
  starts **synchronously** on the next line. The old session's `await watch.done` woke a microtask
  later and its tidy-up call to `retireBakeCard()` found the NEW bench and cleared it.
- **Fix:** a `superseded` flag, set synchronously before `done` resolves.
- **Files:** `4/src/orchestrator.js`, `4/src/ui/bakeoff.js`.

**3. [Rule 2 — missing gate] The bake channel had no wire contract**
- The ask and sail channels each have a field-parity assertion; the new one had none, and the
  seven historic drifts all happened on a channel that already shared its builders. Added assertion
  4 with six drills.
- **Files:** `4/scripts/prompt_field_parity_check.js`.

**4. [Rule 2 — convergence] One place draws a purse**
- `render()`'s four inline coin lines became `showSeatCoins(seat,coins)` the moment a second
  consumer appeared. Converge, do not add a path.
- **Files:** `4/src/ui/board.js`, `4/src/orchestrator.js`.

**5. [Rule 1 — the plan's own instruction was wrong in one place]**
- ROADMAP said *"a bench renderer beside `renderBattleFromSnap`"*. A second renderer beside the
  first is the two-directors shape rule 23 forbids. What shipped is one snapshot shape on the same
  node, discriminated before `renderBattleFromSnap` is reached, rendered by the same
  `playBakeoffLive` the baker runs. Corrected in ROADMAP.md.

### Instrument failures — four, all in the probe, none in the game

Recorded because a QA layer is unreviewed code that nobody plays.

1. **A wait whose condition was already true.** Waiting for "a bench" a second time returned
   instantly, because the first bake's card was still on the glass through its reveal — so it
   photographed the first bake again and called it the second.
2. **A purse read that assumed document order.** Reported host `[5,3,3,4]` vs guest `[3,4,5,3]` and
   read as a live divergence. The CAPTAINS rows are rotated per viewer; they were the **same four
   numbers**. A check built on my own assumption, exactly HARD-WON-LESSONS §2.
3. **`#bkoGo` survives the whole reveal reading "In the oven…"**, so "who holds bake controls"
   answered yes on a client that had just finished — and the spectate leg drove the wrong browser
   for three runs, screenshotting four identical frames and labelling them mid-shuffle, a pick
   landed, mid-reveal and the verdict. **They were all the same frame.** The predicate now requires
   a button a captain could actually press.
4. **1,468 Chrome profile files went into a commit** alongside twelve screenshots, because the
   profiles were written under `--out`. They live in `os.tmpdir()` now, and the commit was rebuilt.

---

## 9. RECORDED PER D-56 — reversible choices taken without asking

| Choice | The alternative, if Wyatt prefers it |
|---|---|
| MP-06's remote purse drops **optimistically** on the buyer's screen; the host settles the true number | a live spend channel — shows the true number instantly, at the price of a round-trip mid-prompt and a second way for a purse to be wrong |
| The bench is published by the **baker**, so `watchBattle` is attached by every client | keep the host the only publisher — but then a guest baker's Ready and picks can never reach anyone |
| `benchPublish` writes under `db && room && !replaying`, not Rule A's `isHost && db && room` | keep `isHost` — but a guest baker could then publish nothing. The solo-safety half (`room`) is preserved either way; written up in DISPLAY-RULES §3 |
| A watcher gets **no story card** — they join at the bench | show them the intro too; it is the baker's own beat and has a button on it |
| A paid replay **restarts the watcher's whole shell** rather than repainting in place | repaint in place — but that is a second path through the same animation, which is the shape this phase exists to refuse. The visible cost is one cross-fade |
| Tasks 3 and 4 landed in **one commit** | splitting them after the fact would mean reconstructing an intermediate state that was never actually run |
| `bakeoffReveal` takes `{order,slots}` rather than the live player | keep the player object — but then only the host could render a verdict |

---

## 10. WHAT DID NOT LAND, NAMED

**1. There is no paired screenshot of the swap animation running, or of a single pick landing in
isolation.** The spectate leg mis-identified the baker on three consecutive runs (§8, instrument
failure 3) and the fix landed with no run left in the window. **What IS measured instead, and it is
stronger than one screenshot:** the DOM badge arrays are byte-identical between baker and watcher at
`05-second-bench-answerable` (all five badges), at `06-second-verdict` (mid-reveal, same frame) and
at `07-after-second-bake`. Those badges exist on the watcher **only because the pick stream crosses
the wire**. The animation itself is the same function from the same list on both screens, and the
parity gate pins that there is exactly one of it — but nobody has watched the two shuffles side by
side and said "those are the same arcs". **That is the honest gap.**

**2. A host reload mid-bake replaying to the same finish was not driven.** Criterion 4's mechanism —
one entry, both facts, from either tier — is measured; the reload is not.

**3. `4/scripts/prompt_field_parity_check.js` is still not in `npm test`.** It is one of the ten
green `4/scripts` gates Phase 3 deliberately left out pending red-proofs. Assertion 4 now HAS its
red-proof; wiring the file in is plan 03-02's job and was not widened into here.

**4. The active-captain highlight sat on a bot during a bake** — observed in every run, on both
screens (so not a divergence). Whether the ribbon should follow a baking captain is a question
nobody has asked. **Observed, not measured, and not claimed as a defect.**

---

## 11. SAFETY

- **Nothing outside `4/`, `scripts/`, `docs/` and `.planning/` changed.** Proven with
  `git diff --name-only` after each batch.
- `CNAME`, `robots.txt`, `sitemap.xml` untouched.
- **Every Chrome and server this run started was killed**; `pgrep` clean before returning.
- **No crew voyage was driven to an end of voyage**, so no permanent `gamelogs` row was written.
  Every room was deleted.
- `PP4_STAMP` is **`2026-08-23b`**.

---

## Self-Check: PASSED

`04-01-SUMMARY.md`, `shots/t1/ANSWER.md` and `4/scripts/crew_bake_probe.mjs` all exist on disk. All
four commits (`36b2166`, `9bb0354`, `51a7794`, `c69d6e8`) are in `git log`. `npm test` exits 0 with
30 gates, 8 reading `4/`. `origin/main` and `main` are level both ways. No headless Chrome and no
`http.server` this run started is still alive.
