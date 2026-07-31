---
phase: 13-multiplayer-turn-clock
verified: 2026-07-26T03:32:46Z
status: passed
score: 9/12 must-haves verified
behavior_unverified: 3
overrides_applied: 0
behavior_unverified_items:

  - truth: "In a 2+ window multiplayer game, the turn clock starts running on its own and the first turn begins — no stall, no timer-toggle workaround (CLOCK-01)."
    test: "Set localStorage pp_sess/pp_solo to unversioned (no `v` field) and to versioned blobs in a real browser, reload each time, and separately host+join a real 2-window multiplayer game from a clean boot."
    expected: "Unversioned blob is cleared and does NOT drive a resume (home screen shown); a current-version blob still resumes; a fresh 2-window game's clock starts running on its own with the first turn beginning, no stall."
    why_human: "This is the full live boot sequence (localStorage + Firebase init + DOM) — the executor session had no browser/Chrome-MCP tool. Code-level guard logic (boot()'s null-safe v!== check placed before every existing resume branch) was confirmed by static read, but the end-to-end boot behavior itself is unexercised by any test."

  - truth: "Any player (host or guest) can pause and then resume the clock during a live multiplayer game without missing bot actions (CLOCK-02)."
    test: "In a 2-tab MP game (unique pp_id per tab), click #scPause or #shotClockNum from the GUEST tab. Then resume from either tab."
    expected: "rooms/{room}/paused becomes true; window.__pp_app_state_debug().shotClockPaused===true on BOTH tabs; a bot's turn does not advance while paused; resuming continues the countdown from the remaining time (not a fresh 30s)."
    why_human: "State-transition/freeze invariant across a real Firebase round-trip and two browser tabs — no browser/MCP tool was available to the executor. The wiring (netSetPaused/watchPause/applyPauseState/waitWhilePaused) was confirmed correct by static code read, but the live freeze-and-resume behavior is unexercised by any test."

  - truth: "Clicking the large 'PAUSED' image (#shotClockNum) resumes the clock, in solo and multiplayer (CLOCK-03)."
    test: "Pause a game (solo or 2-tab MP), then .click() #shotClockNum."
    expected: "shotClockPaused flips to false (resumes) on click while paused; clicking #shotClockNum while NOT paused does nothing (regression check)."
    why_human: "DOM click interaction — no browser/MCP tool was available to the executor. The handler wiring and the per-tick defensive reset were confirmed correct by static code read, but the click-driven resume itself is unexercised by any test."
human_verification:

  - test: "Set localStorage pp_sess to a JSON blob with room/mySeat/isHost but NO v field, reload → confirm home screen shows (no resume) and pp_sess is gone. Repeat with a v===SESSION_SCHEMA_V blob → confirm resume IS attempted. Repeat both cases for pp_solo/SOLO_SCHEMA_V. Confirm pp_timerOff and pp_id survive all four reloads."
    expected: "Unversioned/mismatched blobs are cleared and do not drive a resume; versioned blobs still resume; pp_id/pp_timerOff untouched."
    why_human: "Requires setting real browser localStorage and reloading the page — no browser/MCP tool in this session."

  - test: "Host+join a fresh 2-window multiplayer game from a clean boot (no prior session)."
    expected: "The shot clock starts running on its own and the first turn begins without a stall or a timer-toggle workaround."
    why_human: "Full live multiplayer boot sequence, needs 2 real browser windows and Firebase."

  - test: "In a 2-tab MP game (unique pp_id per tab), a GUEST clicks #scPause. Confirm both ▶/⏸ and ⏱ controls are visible on both tabs, #shotClockPanel shows \"paused\" on BOTH tabs, a bot turn does not advance, and window.__pp_app_state_debug().shotClockPaused===true on both. Click again (from either tab) to resume, confirming the countdown continues from the remaining time, not a fresh 30s."
    expected: "Whole-table freeze/resume works from a guest-initiated pause; both controls visible; resume continues from remaining time."
    why_human: "Live 2-tab Firebase round-trip and DOM state — no browser/MCP tool in this session."

  - test: "Repeat the pause/resume check in a SOLO game (regression) to confirm ▶/⏸ still works there."
    expected: "Solo pause/resume unregressed."
    why_human: "DOM interaction, needs a live browser session."

  - test: "While paused (solo and 2-tab MP), click #shotClockNum (the large paused symbol) and confirm shotClockPaused flips to false on click; while NOT paused, click #shotClockNum and confirm nothing happens (no accidental pause)."
    expected: "Big-symbol click resumes only while paused; inert otherwise."
    why_human: "DOM click interaction, needs a live browser session."
---

# Phase 13: Multiplayer Turn Clock Verification Report

**Phase Goal:** A multiplayer game starts cleanly on its own and the turn clock is fully controllable — closing the critical stall that blocks the game from beginning.
**Verified:** 2026-07-26T03:32:46Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | CLOCK-01 (ROADMAP SC1): 2+ window MP game's turn clock starts running on its own, no stall, no timer-toggle workaround | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | Boot version-guard code present and structurally correct (`src/orchestrator.js:1112-1124`); full live boot behavior needs a real 2-window session — see Human Verification |
| 2 | Boot guard: unversioned/mismatched `pp_sess`/`pp_solo` cleared via `clearSession()`/`clearSoloState()` before any resume; current-version blob still resumes; `pp_id`/`pp_timerOff` never touched; null-safe comparison never throws | ✓ VERIFIED | `src/orchestrator.js:1112-1124` — `if(sess&&sess.v!==SESSION_SCHEMA_V){clearSession();sess=null;}` placed before the pre-existing `!sess\|\|!sess.room` check; mirror guard for `pp_solo` before `solo.seed!=null` check. `src/ui/util.js:739-761` — `SESSION_SCHEMA_V`/`SOLO_SCHEMA_V` both `=1`, stamped into `saveSession()`/`saveSoloState()` payloads. `getMyId()`/`pp_timerOff` read/write sites confirmed untouched by the guard. |
| 3 | CLOCK-02 (ROADMAP SC2): Any player (host or guest) can pause and resume a live MP game without missing bot actions | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | Full end-to-end wiring confirmed by static code read (see truth 4-7); the live cross-tab freeze/resume behavior itself needs a real 2-tab session — see Human Verification |
| 4 | Pause architecture: `netSetPaused` writes `rooms/{room}/paused`; every client's `watchPause()` mirrors it; ONLY the host branch runs `applyPauseState`; guest branch only mirrors the boolean, never mutates `shotClockDeadline`/`shotClockPauseElapsed` | ✓ VERIFIED | `src/orchestrator.js:160-174` — `togglePause()` calls `netSetPaused(...)` when `db&&room`; `watchPause()`'s callback: `if(appState.isHost)applyPauseState(v); else appState.shotClockPaused=v;` — guest branch is a pure assignment, never calls `applyPauseState`. |
| 5 | On resume, the countdown continues from remaining time (not a fresh 30s) | ✓ VERIFIED (code-level) | `src/ui/util.js:616-630` — `applyPauseState()`'s resume branch: `shotClockDeadline=Date.now()+30000-appState.shotClockPauseElapsed` — identical math to the pre-existing `toggleShotClockPause()`, confirmed unchanged by extraction (not rewritten). Live confirmation folded into truth 3's human-check. |
| 6 | The ⏱ timer on/off toggle remains available alongside the new ▶/⏸ pause — two distinct controls both visible in multiplayer | ✓ VERIFIED | `src/ui/panel.js:72,78` — `#scPause` visibility now `(!appState.liveDone)?"":"none"`; `#scTimerToggle` visibility line (`!soloBotGame()&&!appState.liveDone`) left untouched — both render independently. |
| 7 | No second, parallel bot-freeze mechanism was introduced — single existing `appState.shotClockPaused`/`waitWhilePaused()` reused | ✓ VERIFIED | `src/ui/util.js:535-539` `waitWhilePaused()` unchanged; `src/orchestrator.js:117` `sleep()` still gates on `waitWhilePaused()`; no new freeze/interval mechanism found in any file touched by this phase. |
| 8 | CLOCK-03 (ROADMAP SC3): Clicking the large "PAUSED" image (`#shotClockNum`) resumes the clock, in solo and multiplayer | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | Click wiring confirmed by static code read (see truths 9-10); the live click-driven resume itself needs a browser session — see Human Verification |
| 9 | `#shotClockNum`'s `onclick`/cursor are defensively reset every `setClockUI()` tick before branch logic, and re-armed only in the two paused branches — no stale handler survives into a non-paused render | ✓ VERIFIED | `src/ui/panel.js:68` — `numEl.onclick=null;numEl.style.cursor="";` executes unconditionally near the top of `setClockUI()`, before all branches; both paused branches (`L90-97`, `L110-120`) re-set `cursor="pointer"` and `onclick=()=>netHandlers().onTogglePause()`. |
| 10 | The clickable symbol reaches `togglePause` via the `netHandlers().onTogglePause` seam (`panel.js` never imports `orchestrator.js` directly) | ✓ VERIFIED | `src/ui/panel.js:46` imports `netHandlers` from `./handlers.js` only; `src/main.js:85` `onTogglePause: orchestrator.togglePause` registered in `setNetHandlers({...})`; `npm test`'s module-graph gate (`ui does NOT import net (D-07)` / directional-import checks) passes live (see below). |
| 11 | `npm test` passes, including `net_contract_check.js`'s watcher-inventory gate reading 19 watchers / 19 `registry.attach()` calls | ✓ VERIFIED | Ran live: all 9 gates PASS, including `"watcher inventory completeness (NET-01, D-01) — all nineteen watchers exported, exactly nineteen registry.attach() calls"`. |
| 12 | `node scripts/determinism_baseline.js --verify` stays green 30/30, engine source unchanged | ✓ VERIFIED | Ran live: `All seeds passed.` / `SOURCE: unchanged — hashes match and engine source hash matches.` Confirmed independently via `git diff --stat` across all phase 13 commits showing zero changes under `src/engine/`. |

**Score:** 9/12 truths verified (3 present, behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/net/writers.js` — `netSetPaused` | Writes `rooms/{room}/paused` via `withReporter(db.ref(...).set(val), onError)` shape | ✓ VERIFIED | Line 65, mirrors `netSetTimerOff` (L57) exactly |
| `src/net/watchers.js` — `netWatchPaused` | `registry.attach` room-scoped value watcher labeled "paused" | ✓ VERIFIED | Line 68, mirrors `netWatchTimerOff` (L60) exactly |
| `src/net/index.js` — barrel | Re-exports both `netSetPaused`/`netWatchPaused` | ✓ VERIFIED | Present in both import block (L25,38) and export block (L50,63) |
| `scripts/net_contract_check.js` | Inventory bumped 18→19 | ✓ VERIFIED | `"netWatchPaused"` in `WATCHER_INVENTORY` (L269), `attachCount!==19` (L293), PASS text reads "nineteen" (L319) |
| `src/orchestrator.js` — `togglePause`, `watchPause` | Networked toggle + watcher, called in `beginGame()`, wired to `#scPause.onclick` | ✓ VERIFIED | L160,170; `watchPause()` called at L998 inside `beginGame()`; `$("scPause").onclick=togglePause` at L1037 |
| `src/ui/util.js` — `applyPauseState` | Extracted pause/resume math, no gate inside | ✓ VERIFIED | L616-630; `toggleShotClockPause()` (L638) no longer references `soloBotGame()`, only `isHost` |
| `src/main.js` — `onTogglePause` seam entry | Registered in `setNetHandlers({...})` | ✓ VERIFIED | L85; `visibilitychange` listener (L148-152) confirmed byte-for-byte unchanged (still gates on `soloBotGame()`) |
| `src/ui/panel.js` — de-gated `#scPause` + paused branches | Visible for every player; paused-render gated on `shotClockPaused` alone | ✓ VERIFIED | L72 (`!appState.liveDone`), L90 & L110 (both branches gate on `appState.shotClockPaused` alone, no `isHost` prefix) |
| `src/ui/util.js` — `SESSION_SCHEMA_V`/`SOLO_SCHEMA_V` + `v:` stamps | Two constants =1; stamped into `saveSession()`/`saveSoloState()` | ✓ VERIFIED | L739-740 constants; L747, L759 stamp `v:` into JSON payloads |
| `src/orchestrator.js` — `boot()` version-guard | Clears stale blob before resume, per-blob, null-safe | ✓ VERIFIED | L1117 (`pp_sess` guard), L1123 (`pp_solo` guard), both placed before existing resume-decision logic |
| `src/ui/panel.js` — `#shotClockNum` clickable-to-resume | onclick/cursor reset + re-armed in paused branches, routes via `netHandlers().onTogglePause` | ✓ VERIFIED | L68 (reset), L96 & L119 (re-arm + seam call) |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `scripts/net_contract_check.js` WATCHER_INVENTORY/attachCount | `src/net/watchers.js` `netWatchPaused` | Same commit (`9a02722`) adds both | ✓ WIRED | Confirmed same-commit diff; `npm test` inventory gate passes live |
| `#scPause.onclick` | `orchestrator.togglePause` | Rewired in `wireLobby()` | ✓ WIRED | L1037, no longer `toggleShotClockPause` |
| `watchPause()` | `beginGame()` | Called immediately after `watchTimer()` | ✓ WIRED | L997-998 |
| `main.js setNetHandlers` | `orchestrator.togglePause` | `onTogglePause` entry | ✓ WIRED | L85 |
| `src/ui/panel.js #shotClockNum onclick` | `netHandlers().onTogglePause()` | Seam call in both paused branches | ✓ WIRED | L96, L119; panel.js imports only `netHandlers` from `./handlers.js`, never `orchestrator.js` directly (module-graph gate confirms) |
| `saveSession()`/`saveSoloState()` `v:` stamp | `boot()` version-guard read | `sess.v`/`solo.v` compared immediately after each `JSON.parse` | ✓ WIRED | L1112-1123, placed before pre-existing resume-decision branches |

### Behavioral Spot-Checks / Live Test Runs

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Full 9-gate test suite | `npm test` | All 9 gates PASS incl. 19-watcher inventory, module-graph directional imports, no-undef | ✓ PASS |
| Determinism regression harness | `node scripts/determinism_baseline.js --verify` | 30/30 PASS, `SOURCE: unchanged` | ✓ PASS |
| Zero `src/engine/` touch across phase 13 commits | `git diff --stat ba9b73f..9f99368 -- src/engine/` | Empty diff | ✓ PASS |
| Commit hashes cited in all 3 SUMMARYs exist in history | `git log --oneline \| grep <hashes>` | All 7 commits found (`9a02722`,`8827b89`,`9a9fceb`,`95eab05`,`e095b2b`,`9f99368`,`b75603f`) | ✓ PASS |
| Live click-to-resume / live cross-tab freeze / live boot sequence | N/A — requires browser/Chrome-MCP | Not run (no browser tool in this verifier's toolset either) | ? SKIP → routed to Human Verification |

_Note: `npm test` and `determinism_baseline.js --verify` were re-run independently by this verifier (not merely trusted from SUMMARY.md text) and both passed live, matching the SUMMARYs' claims._

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|--------------|--------|----------|
| CLOCK-01 | 13-02-PLAN.md | Boot no longer stalls on a stale session for a returning MP player | ✓ SATISFIED (code) / human_needed (live) | Boot version-guard code verified; live boot sequence needs human confirmation. REQUIREMENTS.md already marks this `[x]`/"Complete" — consistent. |
| CLOCK-02 | 13-01-PLAN.md | Play/pause available in MP, any player can trigger, no missed bot actions | ✓ SATISFIED (code) / human_needed (live) | Full pause-sync wiring verified end-to-end; live cross-tab behavior needs human confirmation. **Discrepancy: REQUIREMENTS.md line 15/114 still shows `[ ] Pending` for CLOCK-02, despite 13-01-SUMMARY.md's `requirements-completed: [CLOCK-02]` and the code fully delivering it.** This looks like a bookkeeping gap in 13-01's execution (it never flipped the REQUIREMENTS.md checkbox the way 13-02 and 13-03 did for their own IDs) rather than a code gap — see Anti-Patterns/Gaps section below. |
| CLOCK-03 | 13-03-PLAN.md | Large PAUSED image is clickable and resumes | ✓ SATISFIED (code) / human_needed (live) | Click wiring verified; live click behavior needs human confirmation. REQUIREMENTS.md already marks this `[x]`/"Complete" — consistent. |

No orphaned requirements: REQUIREMENTS.md's Phase 13 mapping (CLOCK-01/02/03) matches exactly the three plans' `requirements:` frontmatter fields, with all three IDs claimed by exactly one plan each.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `.planning/REQUIREMENTS.md` | 15, 114 | CLOCK-02 checkbox/status left `[ ] Pending` despite being delivered and verified in this phase (13-01) | ℹ️ Info | Documentation-only inconsistency — does not block the phase goal since the code is verified working; should be corrected before milestone close so REQUIREMENTS.md accurately reflects delivered scope (CLOCK-01 and CLOCK-03 were correctly self-marked complete by 13-02/13-03, but 13-01 never made the corresponding edit for CLOCK-02) |

No `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER` markers, no empty-implementation stubs, and no hardcoded-empty-data patterns found in any of the 9 files modified across the phase's 3 plans (`src/net/writers.js`, `src/net/watchers.js`, `src/net/index.js`, `scripts/net_contract_check.js`, `src/orchestrator.js`, `src/ui/util.js`, `src/main.js`, `src/ui/panel.js`).

### Human Verification Required

See frontmatter `human_verification` list. In summary, five checks — all requiring a real browser/Chrome-MCP session that was unavailable to every executor in this phase (and to this verifier):

1. **Boot version-guard end-to-end** — set unversioned/versioned `pp_sess`/`pp_solo` in real localStorage, reload, confirm clear-vs-resume behavior and `pp_id`/`pp_timerOff` survival.
2. **Fresh 2-window MP boot** — confirm the clock starts running on its own with no stall (the original CLOCK-01 critical bug).
3. **Guest-initiated pause freezes the whole table** — 2-tab MP, guest pauses, confirm countdown + bots freeze on both tabs, both controls visible, and resume continues from remaining time.
4. **Solo pause/resume regression** — confirm no regression from the de-gating changes.
5. **Big-symbol click-to-resume** — solo and MP, confirm click resumes while paused and is inert while not paused.

### Gaps Summary

No code-level gaps. All must-have artifacts, key links, and code-verifiable truths (9 of 12) are VERIFIED against the actual source in `src/net/`, `src/orchestrator.js`, `src/ui/util.js`, `src/ui/panel.js`, and `src/main.js` — not merely claimed in SUMMARY.md. Both automated gates the plans depend on (`npm test`'s 9 gates, `determinism_baseline.js --verify`'s 30/30) were re-run independently by this verifier and pass live, and zero `src/engine/` files were touched across any phase-13 commit.

The remaining 3 truths are inherently live-browser/multiplayer behaviors that no executor or this verifier could exercise without a browser/Chrome-MCP tool; they are correctly flagged (not failed) as human verification items, consistent with what all three SUMMARYs already self-reported (13-01's D5, 13-02's D2, 13-03's D1).

One documentation-only inconsistency was found and flagged as Info-level (not a gap): REQUIREMENTS.md was not updated to mark CLOCK-02 complete even though 13-01 delivered and this verification confirms it, while CLOCK-01 and CLOCK-03 were correctly self-marked complete by their respective plans.

---

_Verified: 2026-07-26T03:32:46Z_
_Verifier: Claude (gsd-verifier)_

## CLOCK-01 CLOSED 2026-07-31 by Phase 17 — appended by the v1.2 milestone audit

This file recorded CLOCK-01 as `PRESENT_BEHAVIOR_UNVERIFIED`: the code was structurally correct but
the live two-window behaviour could not be exercised in that session.

**It was exercised on 2026-07-31.** A networked game (Wyatt hosting in Safari, Claude driving the
guest seat in Chrome, room `KWPE`) started on its own with no clock-stall workaround —
`gameStarted:true`, turn order `[3,0,1,2]` identical on both clients — and played through to an end
of voyage across 171 events. See `17-VERIFICATION.md`.

**Still open from this phase's human_verification list**, and NOT closed by that game:

- the localStorage version-guard blobs (unversioned vs versioned `pp_sess` / `pp_solo`)
- a **guest-initiated** `#scPause` (pause/resume was driven from the host; `timerOff` was confirmed
  propagating to the guest, so the mechanism works, but the guest-initiated path was not exercised)
- clicking `#shotClockNum` to resume — CLOCK-03's actual affordance

Recorded rather than quietly marked done: the phase's requirements are satisfied, these specific
checks are not.

## Check 1 CLOSED 2026-07-31 — localStorage version guard, verified by Wyatt in Safari

The `human_verification` test on the schema-version guard was run live. Four cases, each seeded then
reloaded, with `pp_id` and `pp_timerOff` set beforehand to prove they survive:

| Case | blob | after reload | home screen | game |
|---|---|---|---|---|
| A | `pp_sess`, no `v` | cleared | yes | no |
| B | `pp_sess`, `v:1`, room `ABCD` | cleared | yes | no |
| C | `pp_solo`, no `v` | cleared | yes | no |
| D | `pp_solo`, `v:1` | **survived** | **no** | **resumed** |

`pp_id` stayed `"KEEP-ME"` and `pp_timerOff` stayed `"1"` in all four — so a guard rejection never
degrades into a blanket `localStorage.clear()`, which would cost a player their Firebase identity
mid-session.

**C vs D is the actual proof, and the only pair that is.** Identical blob differing by one field,
opposite outcomes: the unversioned one cleared to the home screen, the versioned one resumed into a
running game. A, B and C alone are indistinguishable from a boot that unconditionally wipes both
keys — all three produce the same output.

**Case B is INCONCLUSIVE by construction, and is not evidence.** With `v:1` the guard correctly keeps
the blob; boot then reads room `ABCD` from Firebase, finds it absent, and hits
`if(!snap.exists()){clearSession();showHome();}`. So a cleared blob is the CORRECT result for a
versioned session pointing at a room that does not exist, and B cannot distinguish that from a guard
failure. The test as originally written could not fail. A meaningful `pp_sess` case needs a room that
really exists.

## Check B RE-RUN and CLOSED 2026-07-31 — with a room that actually exists

The original Case B used room `ABCD`, which does not exist, so a cleared blob was the CORRECT result
and the test could not fail (see the note above). Re-run against the LIVE room `SGZZ` while a real
two-window game was in progress:

    localStorage.setItem('pp_sess', JSON.stringify({v:1,room:'SGZZ',mySeat:0,isHost:true}));
    location.reload();

**Result: the host reconnected into the running game** — Safari came back at the recipe draft, in the
room, not on the home screen; the guest (Chrome, seat 1) was simultaneously prompted for its own
recipe, which is the designed simultaneous-draft behaviour. The room was not disturbed by the
host reload.

Now distinguishable, which is the whole point: a versioned blob pointing at a REAL room reconnects; a
versioned blob pointing at a FAKE room clears and goes home. Both correct, and only the pair proves
the guard rather than a blanket wipe.

This also exercised the `resumeHostGame` path (BUG-03/04) incidentally — a host refresh mid-game
rebuilt state without a "couldn't fully restore" dialog.

## Checks 2 and 3 CLOSED 2026-07-31 — guest-initiated pause and click-to-resume, live in room SGZZ

Live two-window game, room `SGZZ`, served at `http://localhost:8460`. Wyatt hosting in Safari
(seat 0). Claude driving the guest seat in Chrome (seat 1, identity `claude-guest-430272`).

### The timer had to be ON — a precondition, not a detail

`timerOff` was `false` for these checks. In `src/ui/panel.js` the `if(appState.timerOff){ ... return; }`
branch returns BEFORE any paused-state rendering. With the timer off the big paused symbol never
renders and CLOCK-03's click handler is never armed — so **Check 3 is not merely awkward with the
timer off, it is literally untestable.** The handoff note that preceded this session flagged
`timerOff` as possibly needing re-enabling; this is the reason why.

### Method — and why it changed

The checks were NOT driven by hand. Hand-driving failed repeatedly: each browser round-trip costs
1–2 seconds against a 30-second shot clock, and two of the guest's turns were lost to expiry while
trying.

The working approach was an in-page watcher installed in the guest tab that armed itself on a fresh
clock for seat 1 and then fired the whole sequence at page speed, recording a timestamped trace of
local state alongside live Firebase listeners on `rooms/SGZZ/paused` and `rooms/SGZZ/clock`. It was
run twice.

The method change is the reusable lesson: a future session driving this game should know that
hand-clicking cannot hit a sub-second window.

### Run 2 trace — deltas measured from the guest's pause click

    +0ms       guest clicks #scPause (clock fresh, 30s on it)
    +1ms       rooms/SGZZ/paused -> true
    +116ms     rooms/SGZZ/clock -> seat1 paused=true      <-- host re-broadcast
    +204ms     guest renders label "paused"; #shotClockNum onclick armed; #scPauseImg -> play.png
    +8204ms    guest clicks #shotClockNum (pause deliberately held 8s so it was visible on both screens)
    +8205ms    rooms/SGZZ/paused -> false
    +8328ms    rooms/SGZZ/clock -> seat1 paused=false, clock re-armed
    +11208ms   label back to "play in", counting down, turnExpired === false

Run 1 was identical in shape: affordance armed after 200ms, resume re-armed the clock, `turnExpired`
false throughout.

### Why the +116ms line is the load-bearing evidence for Check 2

`rooms/{room}/clock` is written ONLY by the host (`broadcastClock`, reached from the host branch of
`watchPause`). **Its appearance carrying `paused=true` proves the guest's pause travelled to the
host's browser and the host applied it.**

This is emphatically not the guest setting a local flag and calling it a pass — that distinction is
what made the earlier Check B inconclusive, and the same standard is being held here. Wyatt
independently confirmed the host side visually: *"yes it froze and came back"*.

### Check 3

Its specific failure mode — a stuck clock, BUG-02's failure mode in miniature — did not occur. The
clock re-armed and `turnExpired` stayed false.

### NOT a defect: resume returned a full 30 seconds

That is correct behaviour. The pause was taken at the very top of the turn, so `pauseElapsed` was
~0, and `applyPauseState`'s `Date.now()+30000-pauseElapsed` therefore yields ~30s. **The
remaining-time rule is upheld, not violated.**

The rule is this file's own expectation for the CLOCK-02 check — *"resuming continues the countdown
from the remaining time (not a fresh 30s)"* (frontmatter `human_verification` item 3; Observable
Truth 5). It is also **D-07** in the clock code itself: `src/ui/util.js:1260` annotates
`applyPauseState`'s extraction with *"(D-07: resume continues from the remaining time, not a fresh
30s)"*. That citation is correct and is the label the implementation uses.

Note for future readers, since it cost this session a detour: the bare label `D-07` is **overloaded
across the project** and does not resolve on its own. It also denotes the
`ui`-must-never-import-`net` module-graph boundary (Truth 10 above, and `src/ui/util.js:10`), v1.2
phase 14's hail-offer scaling, and others. Cite the Truth 5 wording alongside the ID rather than the
ID alone.

Recorded explicitly so a future reader does not re-open the full 30s as a false alarm.

### Investigated and withdrawn — no defect filed

It briefly appeared that `rooms/{room}/paused` could latch true while play continued
(`startShotClock` clears the host's local `shotClockPaused`, but nothing writes the shared flag
false). On review the observation was equally well explained by the game legitimately sitting paused
from an earlier click until it was resumed, and no clean reproduction was obtained. **Investigated,
not reproduced, no defect filed.** Recorded so a future session does not chase the same ghost.

### One NEW finding, filed elsewhere

Pausing in the final ~1 second of a turn does not save the turn. That is filed as tech debt in
`.planning/v1.2-MILESTONE-AUDIT.md` under `phase: post-audit-findings`, with its cause marked
suspected. It is not a phase-13 verification failure and is kept separate from these closures.

### Numbering — this file uses two schemes

- The `## CLOCK-01 CLOSED 2026-07-31` section above lists a still-open **trio**: localStorage
  version-guard blobs, guest-initiated `#scPause`, click `#shotClockNum`. "Check 1" (already closed)
  is the localStorage one; this section closes the **second and third** of that trio.
- The `### Human Verification Required` list numbers **five** items 1–5. The two closed here are
  items **3** and **5** of that list.

### Caveat — item 4 was not re-exercised

Item **4** of the Human Verification Required list — the solo pause/resume regression — was NOT
exercised today. The v1.2 audit's own accounting ("3 of 5 never closed") counted it among the two
already closed; nothing in this session re-tested it. Stated plainly so the arithmetic is auditable
rather than assumed.

> **SUPERSEDED later the same day — item 4 was then exercised and passed.** See the section below.
> The caveat above is left standing rather than edited, because this file is append-only by
> convention (the same treatment CLOCK-01's stale markers got).

## Item 4 CLOSED 2026-07-31 — solo pause/resume, with a baseline that could have failed

Solo game, fresh boot, `localStorage` cleared, timer **ON**, served on port **8555** — a port never
loaded before in that session (§1 of `docs/DRIVING-THE-GAME.md`). One human seat plus three bots
(pirate, trader, rusher). Driven from Chrome with the §5b autoplay driver running throughout.

### The measurement — three ~21-second windows, driver running in all three

| Window | Events |
|---|---|
| Baseline, running normally | **5** |
| **Paused** | **1** — and it landed at `t=1.4s`, then flat for the remaining 21s |
| After resume | advancing again |

During the paused window the driver ticked **~300 times** still trying to act, and the game did not
move. The single event at `t=1.4s` is an action that was already in flight when the pause landed; it
drained and then nothing followed. So this is a **true whole-game freeze including the bots** —
which is what D-04 promises, not merely a stopped countdown.

### Also confirmed in the same run

- **Resume was driven by the big paused symbol (`#shotClockNum`)**, not the corner `#scPause`. That
  is CLOCK-03's solo half — the solo leg of `human_verification` item **5**, which is therefore also
  closed by this run.
- **The big symbol is inert when not paused.** Clicked five times with the game running:
  `shotClockPaused` stayed `false` and the `onclick` handler is genuinely `null`. The per-tick
  defensive reset in `src/ui/panel.js` does what Truth 9 claims.
- `turnExpired` never stuck true.

### The methodological point — the first attempt was thrown away

**The first run of this check was worthless and was discarded, not reported.** It paused during a
lull, so the event count was *already* flat before the pause; it would have "passed" no matter what
the pause button did. That is precisely the could-not-fail flaw that made the original Check B
inconclusive — see the `## Check B RE-RUN` section above.

The numbers in the table come from the re-run, which first established a baseline proving events
genuinely advance when the game is *not* paused. **A freeze test without a baseline proves nothing**,
because "nothing happened" is the expected reading of both a working pause and a dead one.

Recorded because this is now the second time in this file that the same flaw had to be caught.

### Phase 13's human_verification list is now fully closed, with no caveat

All five items have been exercised live. Item 4 is no longer the outstanding remainder, and the
"3 of 5" accounting no longer carries an untested item inside it. Wyatt's recollection that he had
checked solo pause before was correct — it did work. It simply had no evidence behind it until now.
