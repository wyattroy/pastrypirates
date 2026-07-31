---
status: resolved
trigger: "Storm push does not visibly move ships, and the \"gust shoves you onto a dock\" line fires when no movement happened. Found during Phase 14 plan 14-06's live Safari playtest by Wyatt; failures of plan 14-05's core deliverable (per-square storm rendering, D-09/D-22)."
created: 2026-07-26
updated: 2026-07-26
phase: 14
plan: 14-06
---

# Debug: storm push not rendered

## Symptoms

### Expected behavior

During a storm, a ship pushed by a gust should be drawn stepping **one square at a time**
across the full push, with the board never lagging behind the narration. Each outcome that
occurs during the push should get its own narration line — for bots as well as humans.
This is plan 14-05's core deliverable (D-09, D-11, D-22).

Separately, the `moored` narration line for reason `dock` should only claim the gust *shoved*
the ship onto a dock when the ship actually moved.

### Actual behavior

**BUG 1 — storm movement is not visibly rendered (primary investigation).**
Observed live in Safari by Wyatt. Bot "Flaky Jack" during a storm ("wind blows west, then north"):

- Gust 1 (west): narrated `moored` — "Flaky Jack is still docked, so the storm can't run them aground."
- Gust 2 (north): narrated `dodge` — "Flaky Jack pays 1🌕 to anchor safely"
- The boat was **never seen to move north**. Its new position only became visible later, when it
  took its own sail action on its turn.

Reasoning from the code: being charged the anchor payment on gust 2 implies `mooredReason()`
returned null by then, which implies the ship HAD moved off its dock-adjacent square. So the
movement most likely DID happen and the board never showed it.

Two candidate causes to distinguish:
- (a) the per-square `liveRender()` in `botWindLeg` (`src/ui/flow.js:300-304`) is not landing at all
- (b) `BOT_STORM_STEP_MS=170` (`src/ui/util.js:501`) is too brief to perceive, because the
  following narration flash immediately draws the eye

Rule out as causes: `sleep()` is a no-op when `appState.replaying` (`src/ui/flow.js:64`) and also
gates on `waitWhilePaused()`. Also check whether the HUMAN path (`windLeg`, `src/ui/flow.js:206-273`,
at `STORM_STEP_MS=320`) shows the same symptom.

**BUG 2 — "gust shoves you onto a dock" fires when nothing moved (already diagnosed; fix it).**
`Game.mooredReason(p)` (`src/engine/index.js:254-259`) evaluates the ship's CURRENT position, so
reason `dock` (`this.cfg.singleDock && this.adjPort(p)!==null`) fires in two different situations:

- (a) D-20's genuine lucky save — the gust pushed the ship ONTO a dock square earlier in the same
  gust and the dock now shelters it. **Movement DID occur.**
- (b) the ship simply started the storm already parked beside a dock and never moved at all.
  **No movement.**

The approved narration for reason `dock` — "Lucky break! The gust shoves {name} onto a dock, and
the crew steadies her fast against it ⚓" (`src/ui/util.js:266`) — only describes case (a). In case
(b) it announces a shove that never happened. That is what Wyatt observed on his own ship.

Fix so the "gust shoves you" wording only appears when the ship actually moved during this storm,
with separate honest wording for the already-parked case.

### Error messages

None. No console errors reported. Both bugs are silent/behavioural.

### Timeline

Introduced by Phase 14 plan 14-05 (commits `bd2719e`, `a7c6233`, `de53c0b`), which added the
per-square storm push and the three-way `moored` narration split. Bug 2's specific wording was
approved by Wyatt in plan 14-06 and applied in commit `5aa9a8e`. Never worked correctly — this is
the first live playtest of the new behaviour.

### Reproduction

Server already running: http://localhost:8931/index.html
A temporary uncommitted forced-storm hook (`roundCfg storm:1`, normally `storm:0.125`) in
`src/engine/index.js` makes every round storm. Start a solo game, watch any bot's storm push.

## Constraints

**HARD CONSTRAINT — the determinism oracle must not break.**
The determinism corpus was re-recorded ONCE in plan 14-04 behind an explicit one-way-door decision
by Wyatt, and it is the oracle again at 31/31. **There is NO re-record available.** The `moored`
event's `reason` field is serialized into all 31 fixtures.

Therefore:
- Do NOT add, rename, or change any `reason` value the engine emits.
- Do NOT otherwise alter `src/engine/index.js`'s event stream.
- The correct shape is a **UI-tier fix**: `src/ui/flow.js` already knows the ship's position before
  and after each square in both `windLeg` and `botWindLeg`, so the UI can choose wording based on
  whether movement actually occurred this storm, while the engine keeps emitting the same single
  `dock` reason it emits today.
- Verify with `node scripts/determinism_baseline.js --verify` — it MUST stay 31/31.
  (Note: while the forced-storm hook is active this reports 31/31 FAIL — that is the hook, not a
  regression. Verify against reverted source.)

**Environment — leave it running.**
- Server on port 8931 (fresh port: Safari caches ES modules aggressively and a `?cb=` page
  cache-buster does not fix that). Keep it up for reproduction.
- The forced-storm hook must be reverted to `storm:0.125` before the phase closes, and **never
  committed**.

**Test suite.** `npm test` runs twelve gates and must be green against unhooked source. Relevant:
`scripts/bot_storm_narration_test.js`, `scripts/storm_moored_reason_test.js`,
`scripts/hail_ranking_test.js`.

**Project shape.** Vanilla ES modules under `src/` (engine/ui/net/state), no build step.
Wyatt is a non-coder — explain findings in plain language.

## Current Focus

bug_class: Bohrbug (deterministic — reproduces on every storm push, no timing/concurrency element)

hypothesis: Neither (a) nor (b). The per-square `liveRender()` DOES run, but it cannot show the
ship's new square, because `render()` (`src/ui/board.js:307-317`) draws every ship's position from
`appState.game.events[appState.evIdx].state` — the position SNAPSHOT stored on the last emitted
event by `Game.ev()` (`src/engine/index.js:233-235`) — not from the live `p.pos`. An ordinary storm
step emits NO event (`windPush` only sets `p.pos=nx`), so `liveRender()` re-paints the identical
stale snapshot. The board can only ever catch up when the NEXT event is emitted.

test: Drive the real engine through `botWindLeg`'s exact per-square loop headless and compare
`p.pos` against `events[events.length-1].state[idx].pos` after an ordinary (event-less) square.
expecting: p.pos advances one square while the last event's snapshot still holds the OLD square —
i.e. render() would redraw the ship where it already was.
next_action: Both fixes applied, verified live in Chrome (including a revert-proof), all twelve
gates green, determinism 31/31 against reverted source, forced-storm hook reverted to storm:0.125.
Awaiting Wyatt's own look. NOTE FOR HIS TEST: storms are back to their normal 1-in-8 rate, so a
storm may take several rounds to appear — if he wants to see one immediately, temporarily set
`storm:1` in roundCfg (src/engine/index.js ~:821) again and revert it before committing. Safari
caches ES modules, so serve on a FRESH PORT rather than adding ?cb= to the page. On "confirmed
fixed": commit ONLY src/ui/board.js, src/ui/flow.js, src/ui/util.js and
scripts/bot_storm_narration_test.js, then archive this session and append to the knowledge base.

reasoning_checkpoint:
  hypothesis: "The board paints ship positions ONLY from events[evIdx].state (the snapshot Game.ev
    stores). An ordinary storm square emits no event, so the per-square liveRender() repaints an
    unchanged snapshot and the ship cannot appear to move. (BUG 2: mooredReason's `dock` covers
    both 'shoved onto a dock' and 'was already parked at one', and the UI picks the shove wording
    for both.)"
  confirming_evidence:
    - "Headless probe against the real engine: after square 1 of a real open-water push, p.pos=1,6
      while events[last].state[0].pos is still 1,5 — the exact value render() feeds to shipXY().
      Square 2: p.pos=1,7, drawn 1,5. Only the leg-end `windmove` event makes the board catch up."
    - "grep proves shipEls[i].style.transform has exactly three writers, all in board.js: the
      one-time board build, render() (snapshot), and the activeRing (snapshot). No other code path
      can move a boat, so an event-less move is unrenderable by construction."
    - "Wyatt's live sequence decodes exactly: the 1-coin anchor charge on gust 2 is only reachable
      if mooredReason() returned null, which is only possible if the ship had already left its dock
      square on gust 2's FIRST — invisible — step."
  falsification_test: "If some other code path painted ships from live p.pos, the boat would move
    on screen despite the stale snapshot. Refuted: the grep above enumerates every writer, and the
    probe shows the drawn value never changes across an event-less push."
  fix_rationale: "BUG 1 addresses the render SOURCE, not the timing: paint the ships from live
    player positions on the per-square beat (renderLiveShips, board.js) — the same live-positions
    idiom board.js:244 already uses at board build. Not a delay tweak (that treats the symptom),
    not an engine event (forbidden). BUG 2 makes the UI choose the wording from the movement the
    event stream already records — comparing the moored event's own position snapshot against the
    snapshot on the `turn` event that opened that player's turn — so the engine's `reason` field is
    untouched and the wording is right for hosts, guests, replays and log-scrubbing alike."
  blind_spots:
    - "Cannot drive a real browser from this session (no MCP browser tools loaded), so the visual
      result — that the glide actually reads well at 170ms/320ms per square — is unverified by me
      and is exactly what the human checkpoint must confirm."
    - "Multiplayer GUESTS still cannot see intermediate squares: they render purely from the
      broadcast event feed, and the intermediate squares emit no event. Fixing that would require
      adding to the event stream, which the determinism corpus forbids. Guests keep today's
      behaviour (the boat lands on its final square when the leg's event arrives)."
    - "Pacing is untuned by me. If the step now reads too fast/slow, STORM_STEP_MS(320) /
      BOT_STORM_STEP_MS(170) in src/ui/util.js:500-501 are the single tuning surface."
  candidate_causes:
    - "code — render() reads the event snapshot rather than live state (CONFIRMED, both bugs)"
    - "config — BOT_STORM_STEP_MS too small to perceive (ELIMINATED: nothing repaints at all)"
    - "environment — Safari-specific rendering/module caching (ELIMINATED: mechanism is pure JS
      state, identical in every browser)"
  and_gate: "no. Each bug is a single sufficient cause and each fails independently: BUG 1 is the
    snapshot render source alone (proven by the probe — no second condition needed), BUG 2 is the
    UI's unconditional shove wording alone. They share a family (the UI trusting the event stream
    for something the event stream does not carry) but neither requires the other to fire."

## Evidence

- timestamp: 2026-07-26
  checked: Knowledge base (`.planning/debug/knowledge-base.md`, 1 entry: mp-pause-clock-desync)
  found: No keyword match on storm/render/board-paint. Weak semantic kinship only — that entry's
    class was also "the screen renders a value the code already updated elsewhere" (guest render
    read a host-only local). Recorded as a nudge to check the RENDER SOURCE, not the mutation.
  implication: Not a known pattern; investigate from scratch, but check what render() reads FROM.

- timestamp: 2026-07-26
  checked: `render()` — `src/ui/board.js:307-319`
  found: `const e=appState.game.events[appState.evIdx]; const st=e.state;` then
    `shipXY(st[i].pos,i,st,cell)` sets each `shipEls[i].style.transform`. Ship positions on screen
    are drawn ENTIRELY from the event snapshot, never from `appState.game.players[i].pos`.
  implication: If no event is emitted, a re-render cannot move any ship. This is the whole bug.

- timestamp: 2026-07-26
  checked: `Game.ev()` — `src/engine/index.js:233-235`
  found: Every event carries `o.state=this.players.map(p=>({pos:[...p.pos],...}))` — a full
    positional snapshot taken at emit time.
  implication: The event stream is the board's only position feed. Confirms the render source.

- timestamp: 2026-07-26
  checked: `Game.windPush()` — `src/engine/index.js:270-305`
  found: An ordinary (non-land, non-blocked, non-rim) square does `p.pos=nx` and emits NOTHING.
    Events are only emitted for moored / anchorHold / dodge / anchor / aground / shipwrecked /
    blocked / tradewind.
  implication: Exactly the "just moved a square" case — the one 14-05 set out to animate — is the
    one case with no event, so it is the one case the board cannot draw.

- timestamp: 2026-07-26
  checked: `liveRender()` — `src/ui/panel.js:168-184`
  found: Sets `appState.evIdx=events.length-1` then calls `render()`. With no new event, evIdx is
    unchanged and render() repaints the identical snapshot. liveRender IS running — it is a no-op
    for position by construction.
  implication: Candidate cause (a) "liveRender not landing" is wrong as stated: it lands, and does
    nothing. The defect is the render source, not a missing call.

- timestamp: 2026-07-26
  checked: Every writer of `shipEls[i].style.transform` — `grep` over `src/`
  found: Exactly three sites, all in `src/ui/board.js`: :245 (one-time board build, and notably
    the ONLY one that reads live `appState.game.players`), :317 (render(), snapshot), :370
    (activeRing, snapshot). No animation loop, no other painter.
  implication: There is no second path that could move a boat. Static proof that an event-less
    move is unrenderable today.

- timestamp: 2026-07-26
  checked: Wyatt's observed sequence replayed against the code (gust 1 `moored`, gust 2 `dodge`)
  found: Consistent and fully explained. Leg 1 sq 1 -> moored, early return, no move. Leg 2 sq 1 ->
    ordinary move north, NO event -> invisible. Leg 2 sq 2 -> island, mooredReason() now null
    (the ship left its dock square on the invisible step), so `dodge` fires and charges 1 coin.
    The board only jumps to the new square at `liveRender()` AFTER that flash finishes.
  implication: The anchor charge on gust 2 is positive proof the ship really did move on gust 2's
    first square — and that step was never drawn. Diagnosis matches the live symptom exactly.

- timestamp: 2026-07-26
  checked: Human path `windLeg` — `src/ui/flow.js:263-265`
  found: Identical shape (`p.pos=nx; liveRender(); await sleep(STORM_STEP_MS);`) with no event.
  implication: BUG 1 is NOT bot-specific. Humans have it too, at 320ms. Any fix must cover both.

- timestamp: 2026-07-26
  checked: `shipEls` element style — `src/ui/board.js:237`
  found: Each ship `<g>` already carries `transition: transform .35s cubic-bezier(.42,0,.58,1)`.
  implication: Once a position paint actually happens, the boat glides on its own. No animation
    work is needed — only a paint from live positions.

- timestamp: 2026-07-26 (LIVE, Chrome)
  checked: The real game at http://localhost:8931/index.html, driven through the Chrome DevTools
    Protocol (no MCP browser tools were exposed this session; Chrome was driven directly over its
    debug port using Node's built-in WebSocket — zero install, nothing added to the repo). A real
    solo game was started by clicking #choiceSolo — the debug file's own reproduction — with an
    auto-clicker answering seat 0's prompts so play reached the bots. Every animation frame sampled
    each ship's live engine square against the square its SVG element was actually painted at.
  found: On the FIXED build, ships paint square by square through a storm push, e.g. seat1
    7,8 -> 6,8 -> 5,8 (leg 1, two squares) then 5,7 -> 5,6 (leg 2, two squares). Painted square
    matched the live engine square on 24/24 sampled states; 0 stale paints. Two sampled states had
    the event SNAPSHOT (the old render source) genuinely behind the live position — and the board
    correctly showed the live square in both. Those two are precisely the frames that were
    invisible before.
  implication: BUG 1 fixed, confirmed end to end in a real browser on the real game, not by
    reasoning. The per-square deliverable (D-09/D-22) is met.

- timestamp: 2026-07-26 (LIVE, Chrome — REVERT PROOF)
  checked: Same harness, with the two per-square `renderLiveShips()` calls in flow.js temporarily
    put back to `liveRender()` (forced-storm hook temporarily re-armed to reach storms). Both were
    restored immediately afterwards.
  found: The reported symptom returned exactly. Ships teleported whole pushes in a single paint —
    seat0 7,6 -> 9,6 (two squares at once), seat2 8,5 -> 10,7 and seat3 6,6 -> 5,4 (an entire
    four-square, two-leg storm push in ONE paint). Zero per-square steps were recorded: the
    sub-1500ms dwell bucket was empty.
  implication: The bug returns on revert and disappears on re-apply. This is direct causal proof
    that renderLiveShips() — and nothing else in the run — is what makes the push visible.

- timestamp: 2026-07-26 (LIVE, Chrome — PACING MEASUREMENT)
  checked: Measured how long each ship actually DWELLS painted on each square during a storm push,
    against the ships' own 350ms CSS glide.
  found: Before tuning, bot steps dwelled 166-167ms and human steps 317-318ms — BOTH shorter than
    the 350ms glide, so the boat was retargeted to the next square roughly halfway through gliding
    to the current one and never came to rest on an intermediate square. After raising the two
    constants above the glide, measured dwell is 383ms (bot) and 433ms (human): each square now
    lands before the next begins.
  implication: The original 320/170 were chosen when nothing repainted at all, so they had never
    once been seen against the animation they exist to pace. Under-gliding was a real, measurable
    second defect masked by BUG 1 — not a matter of taste — though the exact values remain Wyatt's
    feel knob.

## Eliminated

- hypothesis: (b) `BOT_STORM_STEP_MS=170` is too brief to perceive — as the PRIMARY cause.
  evidence: Eliminated as the primary cause: nothing changed on screen during the 170ms at all, so
    perceptibility was moot. The paint the delay exists to space out never altered the ship's
    transform (render() read a snapshot that did not change).
  note: PARTIALLY REINSTATED as a real SECONDARY defect once BUG 1 was fixed and paints began
    happening. Live measurement then showed 166ms (bot) / 317ms (human) dwell against the ships'
    own 350ms CSS glide — the boat was retargeted mid-glide and never settled on an intermediate
    square. Both constants were raised above the glide. So (b) was never the reason the push was
    invisible, but it WAS a genuine obstacle to the "one square at a time" deliverable.
  timestamp: 2026-07-26

- hypothesis: (a) as literally stated — the per-square `liveRender()` "is not landing at all".
  evidence: It lands on every square. `liveRender()` -> `render()` runs; it simply repaints the
    same event snapshot. Refined into the confirmed cause: the render SOURCE is the event stream,
    not live player positions.
  timestamp: 2026-07-26

- hypothesis: Safari-specific (the original sighting was in Safari).
  evidence: The mechanism is plain JS/state — the transform string written to the SVG is byte
    identical between steps in every browser. Nothing browser-dependent is involved.
  timestamp: 2026-07-26

## Resolution

root_cause: |
  BUG 1 — The board never draws ships from their live positions. `render()` (src/ui/board.js)
  paints every ship from `appState.game.events[appState.evIdx].state`, the position SNAPSHOT that
  `Game.ev()` bakes into each event. An ordinary square of a storm push emits NO event (windPush
  just does `p.pos=nx` and falls through), so the per-square `liveRender()` that 14-05 added
  repainted an unchanged snapshot: the ship's intermediate squares were unrenderable by
  construction, and the boat only jumped when the leg's own outcome event finally landed. Not a
  missing call and not a too-short delay — the wrong render source. Affects the human path
  (`windLeg`) identically to the bot path (`botWindLeg`), and every browser identically.

  BUG 2 — `mooredReason()`'s `dock` cause is "this ship is standing on a dock", which covers two
  different stories the engine cannot tell apart: the storm shoved the ship onto that dock earlier
  in the same push (D-20's lucky save, which the approved copy describes), or the ship was already
  parked there and never moved. The UI rendered the shove line for both.

oracle_type: derived (contract) — the narration must agree with the movement the event stream
  already records; asserted against real engine-built event streams, not a frozen golden string.

fix: |
  Both fixes are UI-tier. `src/engine/index.js` is untouched — no event, no `reason` value, and no
  field of the event stream changed, so the 31-seed determinism corpus is unaffected.

  BUG 1 — New `renderLiveShips()` (src/ui/board.js): paints ship transforms (and any chat bubble
  and the active-turn ripple) from `appState.game.players`' LIVE positions, using the same
  live-players-as-a-seat-array idiom drawBoard() already uses at :244. Positions only — coins,
  crates, the log, the scrub and the host's event broadcast still belong to the event stream, and
  every storm outcome that changes them emits an event and goes through the full liveRender() path
  as before. `src/ui/flow.js` calls it at three points: the ordinary per-square step in `windLeg`
  and in `botWindLeg` (replacing liveRender(), which could not move a ship there and additionally
  re-fired the previous event's board pop on every square), and once more in botWindLeg BEFORE the
  outcome narration flashes, so the "moved AND emitted" case (a square onto the rim, where
  tradewind() flings the ship to the quadrant head) has the board already correct when the line
  describing it plays — which is D-22's actual intent.

  render()'s own body is deliberately NOT refactored: this file's header records it as moved
  byte-identical from the classic source because it carries the v1.0 BUG-01 Safari storm-crash fix.
  The whose-turn-is-it scan is therefore duplicated into renderLiveShips() with a comment pairing
  the two copies, rather than extracted out of render().

  BUG 2 — New `movedSinceTurnStart(e)` (src/ui/util.js): compares the moored event's own position
  snapshot against the snapshot on the `turn` event that opened that seat's turn (a storm push is
  the first thing a turn does). `EVENT_NARRATION.moored` renders the "gust shoves … onto a dock"
  line only when that returns true; otherwise reason `dock` renders the SAME already-approved
  "is still docked, so the storm can't run them aground" line justDocked and home use — so NO new
  player-facing copy is invented (D-14/D-27 needs no new approval). Returns null for "can't tell"
  (detached event, no snapshot, wrong anchor) and every caller treats null as not-a-shove.

  Derived from the event stream rather than UI scratch state on purpose: the captain's log is
  produced by describe() on the host, on every remote guest (watchEvents -> syncLogLines; a guest
  never runs the push code) and again on a reload-replay. Host-only bookkeeping would have made
  the guest's log tell the wrong story. Snapshots are in the stream in all three places.

  A storm's second gust is always PERPENDICULAR to its first (PERP, src/shared/index.js:148), never
  a reversal, so a storm can never return a ship to its turn-start square — which is what makes
  "position then vs now" an exact test for "this storm moved this ship", not an approximation.

verification: |
  guardrail_verdict: accepted (pending human confirmation of the visual result)

  1. Regression test — ADDED, and it bites. scripts/bot_storm_narration_test.js gains assertion 5:
     four scenarios built from real engine event streams (shoved-onto-dock, parked-on-dock,
     intervening leg-end windmove, wrong-seat anchor) plus a no-evidence fallback check.
  2. Mutation of the fix site — 3 mutants planted, 3 killed:
     - `dock` unconditionally the shove line (the exact pre-fix behaviour) -> 4 checks fail
     - `dock` never the shove line (over-correction, loses D-20's lucky save) -> 1 check fails
     - anchor relaxed to "the previous event" instead of the turn event -> 2 checks fail
       (this mutant SURVIVED the first draft; the intervening-windmove scenario was added
       specifically to kill it, and it is the realistic two-leg storm shape)
  3. Full suite — `npm test`, all twelve gates against the REVERTED (storm:0.125) source:
     168 PASS, 0 FAIL, exit code 0.
  4. Determinism oracle — `node scripts/determinism_baseline.js --verify` against the reverted
     source: 31/31 seeds PASS, "All seeds passed", "SOURCE: unchanged — hashes match and engine
     source hash matches". `git diff src/engine/index.js` is now EMPTY: the engine is untouched
     and the forced-storm hook is gone.
  5. LIVE, in a real browser (Chrome, driven over the DevTools Protocol — see Evidence):
     - Fixed build: ships painted square by square through real storm pushes (e.g. 7,8 -> 6,8 ->
       5,8, then 5,7 -> 5,6). Painted square matched the live engine square on 24/24 sampled
       states, including the 2 states where the OLD snapshot render source was demonstrably stale.
     - Revert proof: putting the two per-square paints back to liveRender() reproduced Wyatt's
       symptom exactly — whole pushes teleporting in one paint (6,6 -> 5,4; 8,5 -> 10,7), zero
       per-square steps. Restored immediately; bug disappeared again.
     - Pacing: measured dwell went from 166ms/317ms (both under the 350ms glide, so no square ever
       landed) to 383ms/433ms (each square lands).
  6. Environment restored: forced-storm hook reverted to storm:0.125 and NOT committed; the server
     on port 8931 was never stopped and is still serving (HTTP 200).
  7. HUMAN CONFIRMED — 2026-07-26, Wyatt, live in Safari against the fixed build. All four checks
     he was given passed: (1) a bot's storm push visibly steps square by square, (2) his own storm
     turn does the same, (3) an already-parked ship reads "is still docked…" rather than claiming a
     shove, (4) the 380ms bot pace reads right and needed no tuning. Guardrail verdict upgraded
     from "accepted (pending human confirmation)" to accepted outright.

files_changed:
  - src/ui/board.js: added renderLiveShips() (live-position ship painter). render() untouched.
  - src/ui/flow.js: windLeg + botWindLeg per-square beats paint live positions; botWindLeg also
    paints before narrating an outcome. Imports renderLiveShips.
  - src/ui/util.js: added movedSinceTurnStart(); EVENT_NARRATION.moored picks the `dock` wording
    from it. Also raised the two storm-beat constants above the ships' 350ms CSS glide
    (STORM_STEP_MS 320 -> 420, BOT_STORM_STEP_MS 170 -> 380) and introduced SHIP_GLIDE_MS so the
    coupling between the beat and the glide it paces is explicit and cannot silently drift again.
  - scripts/bot_storm_narration_test.js: assertion 4 updated to the new contract, assertion 5
    added as the BUG 2 regression guard.
  - src/engine/index.js: NOT changed. The forced-storm playtest hook has been REVERTED to
    storm:0.125 and `git diff` on this file is empty.

needs_wyatts_nod: |
  No new player-facing sentence was written. The already-parked case now renders the SAME approved
  line justDocked/home already use ("<name> is still docked, so the storm can't run them
  aground.") — chosen precisely so no unapproved copy enters the game (D-14/D-27). If Wyatt would
  rather that case had its own dock-flavoured line, that is a one-line change in
  EVENT_NARRATION.moored and needs only his wording.

  The pacing values (420ms human / 380ms bot per square) are a feel judgement. They are set to the
  minimum that lets each square finish its 350ms glide; anything below that and the stepping is
  lost again. Faster than the glide is the one direction that does not work.

not_fixed_by_design: |
  Multiplayer GUESTS still cannot see the intermediate squares. A guest renders purely from the
  broadcast event feed, and the intermediate squares emit no event; showing them to a guest would
  mean adding to the event stream, which the determinism corpus forbids. Guests keep today's
  behaviour — the boat lands on its final square when the leg's event arrives. Host and solo play
  get the full per-square animation.
