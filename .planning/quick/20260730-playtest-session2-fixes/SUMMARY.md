---
phase: quick-20260730-playtest-session2-fixes
plan: 01
subsystem: narration, prompts, storm, host/guest parity
tags: [copy, parity, narration, storm, gates, rulings]
status: complete
requires: [.planning/phases/15-narration-audit-fixes/15-PLAYTEST-NOTES.md §SESSION 2]
provides: [G10, G11, G12, G13, G14, G15, G16, G17, G18, G19, G20, G21, G22, G23, G24, G25, G26]
affects: [src/ui/flow.js, src/ui/panel.js, src/ui/board.js, src/ui/util.js, src/orchestrator.js, index.html]
tech-stack:
  added: [scripts/host_guest_parity_check.js]
  patterns: [one shared builder per cross-tier surface, invariants over literal pins, red-proof every new gate]
key-files:
  created:
    - scripts/host_guest_parity_check.js
    - .planning/todos/pending/ships-stack-after-rim-sweep.md
    - .planning/todos/pending/flip-outcomes-all-caps-in-play-only.md
    - .planning/todos/pending/narration-two-schedulers-unenforced.md
  modified:
    - src/ui/flow.js
    - src/ui/panel.js
    - src/ui/board.js
    - src/ui/util.js
    - src/orchestrator.js
    - index.html
    - package.json
    - scripts/ui_contract_check.js
    - scripts/narration_flow_test.js
    - art-review/narration-approved-baseline.json
    - docs/DETERMINISM-RERECORD-NEXT.md
    - .planning/STATE.md
    - .planning/how-to-play-pastry-pirates.md
    - .planning/phases/15-narration-audit-fixes/15-PLAYTEST-NOTES.md
    - .planning/todos/pending/flee-not-offered-when-broke.md
metrics:
  tasks: 13
  commits: 13
  completed: 2026-07-30
---

# Quick task 20260730-playtest-session2-fixes Summary

Seventeen items (G10–G26) from Wyatt's recorded two-tab playtest of room NAMF, shipped as thirteen
atomic commits — four copy corrections, a greyed storm anchor, a bot rim-escape parity fix, the last
unfixed host/guest visual drift plus the gate that stops a fifth, a paint-before-narrate invariant
with its own gate, a strict narration fade, seeded and retuned storm rain, a square-by-square
trade-wind sweep for host AND guest, and four rulings recorded as documents.

**`npm test` exit code at the tree I am leaving: 0**, 17 gate scripts, 23/23 assertion groups PASS.
**`git diff 44261c8..HEAD -- src/engine/` is EMPTY** (also empty against `31cd24c`).
31/31 determinism seeds pass. `package-lock.json` does not exist in this repo, so that check is
trivially satisfied. `.planning/REQUIREMENTS.md` untouched.

## Commits

| # | Hash | Subject |
|---|------|---------|
| 1 | `e63fa03` | fix(g12): the tails dock prompt in his words — TAILS in caps, amounts on the buttons |
| 2 | `138a68b` | fix(g11): the coin picker just asks How many? |
| 3 | `edbb88a` | fix(g13): lose half yer treasure — two coin glyphs read as confusing |
| 4 | `2761edf` | fix(g16): the privacy notice speaks plain english, and the gate learns why |
| 5 | `4c817ae` | fix(g10): at nothin' in yer purse the storm no longer offers an anchor ye cannot drop |
| 6 | `2d177d0` | fix(g18): a boxed-in bot escapes via the rim in the game people actually play |
| 7 | `48f408c` | refactor(g25): one function draws the sail squares, so host and guest cannot drift again |
| 8 | `b66c632` | test(g26): the host/guest parity gate D-56 asked for and nobody wrote |
| 9 | `091c297` | fix(g15): windLeg paints the board before it narrates it, and a gate says so |
| 10 | `02153e2` | feat(g17): the outgoing line fades, THEN the next one shows |
| 11 | `fb8d992` | fix(g19): every crew sees the same rain, at the midpoint of the two screens we measured |
| 12 | `f88c938` | feat(g14): the trade winds carry ye square-by-square — on the host AND the guest |
| 13 | `df2b745` | docs(g20-g24): the re-record batch, and four rulings recorded so nobody fixes them back |

(Plus `d99e1b0`, the plan itself, committed first so the tree was clean.)

## The items the plan explicitly asked this SUMMARY to record

### 1. T8's `git show` red-proof — the parity gate failing against the pre-T7 tree

Run against `git show 2d177d0:src/ui/flow.js` and `:src/orchestrator.js` (the commit immediately
before T7 landed), written to a temp root. **No SHA is hardcoded into the gate** — a pinned SHA rots
and turns a real assertion into decoration. Output verbatim:

```
PASS assertion 1 — prompt class vocabulary parity (localAsk vs watchPrompt)
FAIL assertion 2 — one sail-highlight builder serves host and guest (D-55/G25)
  - PARITY-SAILRECT: the shared builder sailHighlightRect() is not exported from src/ui/flow.js — without it there is nothing for the two pick paths to share.
  - PARITY-SAILRECT: localPickCell() does not call sailHighlightRect() — it is drawing its own sail squares, which is exactly the drift D-55 recorded.
  - PARITY-SAILRECT: localPickCell() still builds an el("rect" of its own — move those attributes into sailHighlightRect() so there is one place that decides what a sail square looks like.
  - PARITY-SAILRECT: remotePickHighlights() does not call sailHighlightRect() — it is drawing its own sail squares, which is exactly the drift D-55 recorded.
  - PARITY-SAILRECT: remotePickHighlights() still builds an el("rect" of its own — move those attributes into sailHighlightRect() so there is one place that decides what a sail square looks like.
  - PARITY-SAILRECT: the guest's old #fdb63d fill survives in src/ui/flow.js — the host's #ffc23a is the approved colour on both seats.
```

Assertion 1 correctly passes on the old tree: the class vocabulary was already matched by discipline
then, which is exactly D-56's point — that gate exists so the NEXT edit cannot break it silently.

The shipped `--drill` mode is the form that cannot rot: 7 synthetic cases for assertions 1–2 plus 4
for assertion 3, including a symmetric host-side drop, a comment-only mention, and an anti-vacuity
case. All green.

### 2. T9's sweep — `narrate`-before-`paint` pairs OUTSIDE `windLeg`, with verdicts

Scoped out by Wyatt himself ("all movements during all storms"). **Nothing outside `windLeg` was
changed.** After G15 there are zero `await narrateLastEvent();liveRender();` pairs left in the file;
what remains are narrate-then-paint sequences at these sites:

| Site | What it is | Verdict |
|------|-----------|---------|
| `humanDock` empty-island early-out (~`:556`) | a dock flip on a depleted island | **Harmless.** No ship moves; only `p.coins` changes, and the panel repaints a beat later. Out of scope. |
| `humanDock` main dock resolution (~`:627`) | the dock outcome | **Harmless, but the weakest of the five.** Coins/crates change before the line describing them. Same class as G15's `dodge` branch, so it would *benefit* from the same treatment — but a docking flip moves no ship, which is what he scoped. Worth a follow-up, not a defect. |
| `humanTrade` counter-offer settlement (~`:762`) | a completed counter-trade | **Harmless.** Coins/crates change; no movement. Same note as above. |
| `humanTrade` settlement (~`:800`) | a completed trade | **Harmless.** Same. |
| `humanAct` attack (~`:898`) | `await onAsyncBattle()` then narrate | **Genuinely fine.** `asyncBattle` renders its own scoreboard throughout, so the board is not stale when this line plays. |
| `humanAct` fish (~`:905`) | `fishCast` then narrate | **Genuinely fine.** `fishCast` runs its own flip animation and render. |

**Recommendation, not action:** the three settlement sites (dock, counter-trade, trade) are the same
purse-shows-late shape G15 fixed for `dodge`. If Wyatt wants that consistency it is a three-line
follow-up. None of them is what he reported.

### 3. Did T5's truncated broke prompt read acceptably? — **YES, no STOP needed**

The broke-with-crates case is the full sentence with the offer clause deleted:

> `Cap'n Whoever: the storm's blowin' ye into land!`

It stands on its own as a complete exclamation and needs nothing added. The decision it used to
introduce is fully stated by the flip button, which names both outcomes. **No replacement sentence
was written**, per the plan's STOP rule and the standing no-invented-copy rule.

### 4. Which line played after T6's rim escape — **the trade-wind sweep line; no explicit narrate needed**

Traced through the code rather than assumed:

1. `rimEscape()` records TWO events — `{t:"windmove"}` at the rim cell, then `tradewind()`'s
   `{t:"tradewind"}`.
2. `botBeat()` is `liveRender()` + `narrateCurrent()`.
3. `liveRender()` (`src/ui/panel.js:180`) sets `appState.evIdx = events.length-1` — the LAST event,
   i.e. the `tradewind` — and calls `syncLogLines()`.
4. `narrateCurrent()` (`src/ui/util.js:1048`) reads `appState.logLines[appState.evIdx]` and flashes it.

So the line that plays is `EVENT_NARRATION.tradewind` — *"…is blown into the trade winds and swept
around the rim!"* That is the right one and it is exactly what a watching player should learn from.
**No explicit `flash()` was added and no new copy was written.**

### 5. T11's measured means from the seeded specs

| Measure | Target (the midpoint of the two screens) | Measured over 500 seeds × 4 layers |
|---------|------------------------------------------|-------------------------------------|
| fall duration | 0.676s — `(0.818 + 0.534) / 2` | **0.6737s** |
| tile scale | ×0.969 | **×0.9665** |
| tile width | 232.6px — `(200.5 + 264.7) / 2` | **232.0px** |

The small gap is sampling noise in the symmetric jitter, which is kept (`LAYERS=4`, `JIT=0.86`
untouched). A single seed lands anywhere in the jitter range by design — that is the depth Wyatt
asked to keep. Determinism confirmed: the same seed produces byte-identical specs; two different
seeds do not.

### 6. Every fixture re-pinned, with its reason

| Fixture | What moved | Reason (recorded on file) |
|---------|-----------|---------------------------|
| `scripts/narration_flow_test.js` — F5 site 2 and F9 content anchors | `"Tails! Take"` → `"TAILS! Take treasure instead?"` | G12 rewrote the prompt in Wyatt's words. The new anchor is **exactly as specific** as the one it replaces; nothing was widened. What F5/F9 assert about the site is unchanged and still holds. |
| `art-review/narration-approved-baseline.json` — `prompt:prompt.trade.addcoins` | card text → `How many?` | G11. A TEXT UPDATE to one pinned row, not a re-baseline: the card count is still exactly **104** (`EXPECTED_DRIFT`) and the provenance still says `DRIFT PIN`. A G11 paragraph was appended to `_provenance`. |
| `scripts/narration_flow_test.js` — Task 1 (D-13) | two literal pins REPLACED by an invariant | G15. Those pins required the **wrong** order (`ev → narrate → paint`) for `moored` and `anchorHold`, freezing the bug Wyatt reported. D-13's real requirement (the anchorHold line must PLAY AT ALL) is preserved and now asserted **separately** from the ordering it used to be fused to. |

**No pattern was widened, no equality loosened, and no `15-DISPOSITIONS-*.json` / `15-*-APPROVED.*`
file was touched.** No player-facing string was invented anywhere: T5's third prompt case is a
DELETION, and T6's fallback reuses a line that already ships.

## Deviations from the plan

Six, all documented at the time and none changing what shipped.

### 1. [Rule 1 — plan premise was wrong] The T2 drift baseline did NOT go red

**Found during:** T2. The plan stated *"assertion 8 goes correctly red"* when the shipped copy no
longer matched the pinned card. **It does not.** Verified by restoring the old baseline and running
the gate: it still passed. `narration_audit_check.js` assertion 8 only checks the drift baseline's
**card count** (104) and that its provenance says `DRIFT PIN` — it never compares baseline text to
live source. That comparison is `scripts/narration_copy_check.js`'s job, **and that file still does
not exist** (the same gap STATE.md records).

**Action:** the re-pin was made anyway, because the baseline is the record of shipped text and
leaving it stale would mislead the copy check whenever it is finally built. **Consequence worth
knowing: a copy change can silently desync that baseline today, and nothing notices.**

### 2. [Rule 3 — plan's verify command too narrow] T6's fixed 2600-char window

The plan's T6 verify sliced `botTurn`'s body as `s.slice(i, i+2600)`. The G18 comment the plan itself
asked for pushed the code past that window, so the check failed on a correct fix. **Sliced by
function boundary instead** (to the next top-level `export `), which is *tighter* — it cannot
accidentally read code from a later function. The assertion's subject is unchanged.

### 3. [Rule 3] Comment text tripping the plan's own grep-style checks — four times

T2, T3, T7 and T9 all hit the same shape: a comment quoting the old string or naming a deleted
identifier made a raw-source regex fire. Resolved consistently and in the stricter direction:

- **T2/T3/T7:** reworded the comments so they describe the old value without reproducing the literal,
  leaving the plan's verify commands passing **byte-for-byte as written**.
- **T9 and the new parity gate:** added **comment stripping** to the ordering/vocabulary assertions.
  That is a tightening, not a loosening — a comment can now neither trip the rule nor satisfy it —
  and it is pinned by its own drill (`drill 1c`: a class named only in a comment must not count as
  emitted).

### 4. [Rule 1 — vacuous assertion caught] T9's botWindLeg mirror

The plan asked for a mirror of the `windLeg` invariant on `botWindLeg`. Written literally it reported
**"0 call sites checked" and passed vacuously** — `botWindLeg` narrates with
`await flash(describeFor(ev,…))`, not `narrateLastEvent()`. Rewritten against what that function
actually does: the per-square block must call `renderLiveShips()` **before** its `await flash(`.
The tail leg-summary is documented as a deliberate exclusion (the loop has already painted the ship
at its final square; the summary event records no further movement).

### 5. [Rule 3] Assertion 3 held back from T8, landed with T12

The plan listed assertion 3 (one rim-sweep stepper) under T8 in one place and under T12 in another.
It was **shipped with T12**, the commit that ships the stepper it asserts. Shipping it at T8 would
have made `npm test` red at a commit for a reason unrelated to that commit — and hard constraint 2
requires green before every commit. Recorded in the gate's own header so the sequencing is not read
as an omission.

### 6. [Rule 3] Both gate scripts run on import

`scripts/host_guest_parity_check.js` and `scripts/ui_contract_check.js` execute their entry block and
`process.exit()` when imported, which silently printed **their own** verdict during a red-proof and
made it look like the caller's result. Added a **main-module guard** to the new parity gate so its
check functions can be imported for one-off red-proofs. `ui_contract_check.js` was left alone (it is
an existing gate) and its red-proof was done by temporary file swap instead.

## Authentication gates

None.

## Known Stubs

None. Every function written in this plan is wired to a real caller and exercised by a gate or a test.

Two documented **fall-backs** — not stubs, and both deliberately scoped by the plan:

- The trade-wind sweep falls back to today's instant render for the engine-internal `windPush` sweep
  (bot storm) and for the battle-flee sweep, because neither records an event at the entry cell.
  Both lists are written into the source comment; the derivation refuses to animate rather than
  invent a path. Closing this needs the STORM-02 class of change, which stays parked.
- `stormLayerSpecs` falls back to a fixed literal seed on the decorative demo board, which has no
  game. Chosen over `Math.random()` so "no unseeded randomness in the rain" is absolute.

## Threat Flags

None. No new network endpoint, no new Firebase field/node/writer, no new file access, no new
schema at a trust boundary. Every threat-register mitigation in the plan was implemented and is
asserted:

- **T-Q31-01** (rain must not draw from `game.r()`) — `ui_contract_check.js` assertion 8, four drills,
  31/31 determinism.
- **T-Q31-02** (no flag stamped on a broadcast event) — module-local index; `net_contract_check.js` green.
- **T-Q31-03** (guest event ordering) — push and `evIdx` before any `await`; asserted textually.
- **T-Q31-04** (host/guest divergence) — one builder, one stepper, and a gate naming the difference.
- **T-Q31-05** (ghost intercepting clicks) — `pointer-events:none` preserved and grep-asserted.
- **T-Q31-06** (stranded ship) — `finally` restores the true destination.
- **T-Q31-07** (Safari) — accepted, header records the scoped exception; **eyeball check outstanding**.
- **T-Q31-SC** (supply chain) — no package install anywhere; no lockfile exists to change.

## STILL NEEDS WYATT — three browser checks, none of them answerable by a gate

I did **not** open a browser. Tests passing is not the same as working, and this report says only
what was verified.

1. **T10/G17 — the strict fade at 180ms.** Watch four or five lines replace each other: the outgoing
   line should finish fading *before* the next begins to type. Then stop on a trailing line (the end
   of a bot turn) and confirm it stays up indefinitely and never fades. **Is 180ms right?**
2. **T11/G19 — the rain.** Force a storm (temporary `cfg.storm=1` — **revert it** — on a fresh,
   never-loaded server port, per the module-cache note). It should sit midway between the two screens
   compared this morning. **And confirm in Safari that the storm still runs smoothly** — this file
   carries the v1.0 Safari crash fix.
3. **T12+T7/G14+G25 — a GUEST-seat parity pass.** Sail onto a rim square as a guest: the boat should
   travel around the ring, not teleport, at the same pace the host sees. In the same turn, check the
   yellow sail squares match the host's — same orange, same bounce, hover pops them. (Bot-storm sweeps
   still jump on a guest **by design** — that is the documented fall-back, not a defect.)

Opportunistic, foldable into the same session: at 0 coins in a storm the anchor button greyed with
`Yer too broke to anchor` and the prompt no longer offering to anchor; the flip button reading
`lose half yer treasure`; a tails dock reading `⚫️ TAILS! Take treasure instead? Or buy …?`; a trade
reading `How many?`; and — not forceable, watch for it — a walled-in bot ducking into the rim.

## Self-Check: PASSED

- `scripts/host_guest_parity_check.js` — FOUND, exits 0, `--drill` green
- `.planning/todos/pending/ships-stack-after-rim-sweep.md` — FOUND
- `.planning/todos/pending/flip-outcomes-all-caps-in-play-only.md` — FOUND
- `.planning/todos/pending/narration-two-schedulers-unenforced.md` — FOUND
- `.planning/todos/pending/flee-not-offered-when-broke.md` — FOUND, extended
- `docs/DETERMINISM-RERECORD-NEXT.md` — FOUND, extended (§8 bot-intelligence, §9 rim sweep NOT queued)
- All 13 commit hashes verified present in `git log`
- `npm test` exit **0**, 17 gates, 23/23 groups
- `git diff 44261c8..HEAD -- src/engine/` — **EMPTY**
- 31/31 determinism seeds pass
