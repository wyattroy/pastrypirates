---
phase: 21-sound-the-clock-toggle
verified: 2026-08-01T12:00:00Z
status: gaps_found
score: 22/22 decisions delivered — D-14 closed 2026-08-01 when Wyatt supplied the artwork (see amendment at the foot of this file)
behavior_unverified: 15
overrides_applied: 0
gaps:
  - truth: "D-14 — a new speaker icon (with blocked-slash overlay when muted) is drawn in the game's style and wired into #btnMute"
    status: failed
    reason: "assets/icons/speaker.png does not exist on disk. #btnMute still renders the bare 🔊/🔇 emoji scaffold from 21-04. 21-05-PLAN.md Task 1 halted on its own stated precondition (the art runbook .planning/art-generation-process.md is gitignored and only lives on Wyatt's main-folder disk; it is inherently interactive and needs his live Gemini/browser session) — this is documented honestly in 21-05-SUMMARY.md as blocked-on-Wyatt, not silently dropped, and it does not block AUDIO-02's functional behavior (the button itself works). But it is one of the 22 locked decisions and it is genuinely not implemented."
    artifacts:
      - path: "assets/icons/speaker.png"
        issue: "File does not exist — confirmed via ls; ENOENT"
      - path: "src/shared/index.js"
        issue: "No SPEAKER_IMG constant exists yet"
      - path: "src/ui/panel.js"
        issue: "setClockUI()'s #btnMute block still sets innerHTML to the literal emoji strings 🔇/🔊, not iconImg(SPEAKER_IMG) composited with iconImg(BLOCKED_SLASH_IMG)"
    missing:
      - "Wyatt supplies .planning/art-generation-process.md's contents or confirms the abbreviated runbook (download button + Chrome Location setting, near-black background) so a follow-up session can execute 21-05-PLAN.md Task 1 exactly as already written — action and verify blocks are fully specified and ready"
deferred: []
human_verification:
  - test: "Row 1 — sound at the right moments: solo game, sail/dock/fish/trade/battle each make their mapped sound; bot captains audible too"
    expected: "Each action's mapped stem plays; bot actions audible on your own screen"
    why_human: "No headless audio decode/playback exists in this project (21-VALIDATION.md's own stated limitation). Partially covered by Wyatt's own live pass per the prompt's already-verified notes (coin-flip confirmed); sail/dock/fish/trade/battle/bot-audibility not yet confirmed by anyone."
  - test: "Row 2 — flips layer (D-10): rapid successive flips in a multi-round battle overlap rather than cut off or drop"
    expected: "Successive coin-flip sounds audibly overlap into a flurry"
    why_human: "Requires listening to overlapping playback in a live browser; code proves fresh-node-per-call construction (necessary, not sufficient for the audible claim)"
  - test: "Row 3 — the storm (D-08/D-09/D-11): force a storm (cfg.storm=1 in roundCfg, revert after), confirm storm.mp3 fires exactly once for the round, sits quieter under short sounds, and fades out (never hard-cuts, never drones) as the storm moment resolves"
    expected: "One storm cue per stormy round, audibly quieter than short sounds, fading over ~1.2s on the next newround/end"
    why_human: "Never run in a live browser this session. soundForEvent()'s storm-stamp guard and fadeStorm()'s ramp math are proven headlessly, but audibility, relative loudness, and the fade's perceived smoothness are not test-observable."
  - test: "Row 4 — the win screen (D-05): play to end of voyage, confirm the placeholder win cue plays"
    expected: "store-ingredient.mp3 audible when the End of Voyage screen appears"
    why_human: "Requires a live playthrough to completion; not run this session"
  - test: "Row 5 — mute in all three modes, reload persistence, end-of-voyage disappearance with mute state still holding (D-13/D-15/D-16)"
    expected: "Behaves as described in all three modes and in Safari"
    why_human: "Already partially confirmed live by Wyatt in solo/Chrome per this task's prompt (#btnMute renders, click flips state, pp_muted written, survives reload). Pass-and-play, multiplayer-cross-window isolation, end-of-voyage disappearance-with-mute-still-holding, and Safari are not yet confirmed by anyone."
  - test: "Row 6 — background tab (D-12): switch tabs mid-game, sound goes quiet and resumes on return"
    expected: "Silent while backgrounded, audible again on focus, in both Chrome and Safari"
    why_human: "Page Visibility + Safari's AudioContext interrupted-state resume can only be confirmed live"
  - test: "Row 7 — LOAD-BEARING: the D-18 full-turn both-ways timer check, run once in EACH of solo, pass-and-play and multiplayer: switch the timer OFF mid-turn, then back ON mid-turn, then finish the turn — confirm the game continues"
    expected: "The turn completes and the game continues into the next turn, in all three modes — no freeze"
    why_human: "This is the exact BUG-02 regression class (a game-freezing bug), and the plan's own text states only a human, awake, driving a live game, can run it. The re-arm branch was moved verbatim from the proven multiplayer body (confirmed by code diff review in 21-03-SUMMARY.md), which is strong but not sufficient evidence — this check is explicitly named as the only thing that catches a re-arm regression. Not run this session."
  - test: "Row 8 — multiplayer (D-07): two-window host+guest, guest hears host's and bots' actions; muting one window leaves the other audible; timer toggle still syncs"
    expected: "Whole table audible on guest; mute is per-browser; timer toggle syncs table-wide"
    why_human: "Requires two live browser windows; not run this session. host_guest_parity_check.js does not itself exercise the timer toggle or audio."
  - test: "Row 9 — LOAD-BEARING (BUG-01 territory): force a storm in Safari with sound on, watch for jank/stall/crash"
    expected: "No jank, stall or crash while the storm overlay animates with sound layered over it"
    why_human: "BUG-01 was a Safari storm-overlay near-crash; a storm sound has never been tried alongside that overlay in Safari. Genuinely untested territory, not run this session."
  - test: "Row 10 — credits and copy (AUDIO-03, milestone constraint 3): open Credits modal, confirm Luis's sound-credit clause reads naturally; Wyatt approves the clause and both mute tooltips against copy-shipped-vs-approved-gate.md"
    expected: "Luis appears once, credited for mechanics and sound, one link; Wyatt signs off on all three new strings"
    why_human: "Voice/tone judgment and formal copy-disposition approval are Wyatt's calls, not machine-checkable. Currently recorded as 'not yet reviewed' in the gate file."
  - test: "Row 11 — narrow viewport: #scPause, #scTimerToggle and #btnMute do not overlap or clip below ~480px, in Chrome and Safari"
    expected: "Three controls fit without overlap/clipping"
    why_human: "Visual layout at a specific breakpoint; CSS rules exist (confirmed by direct file read) but rendered overlap/clip is a visual judgment. The user's already-verified notes report no overlap and no #game 5px overflow regression, which is reassuring but was checked at normal width, not explicitly confirmed at the narrow breakpoint with all three controls visible."
---

# Phase 21: Sound & the Clock Toggle Verification Report

**Phase Goal:** Luis's six sound effects play at the right game moments, on by default, with a mute
button beside the turn clock and Luis credited for them in the Credits modal — plus the turn-timer
on/off toggle finally working in solo and pass-and-play via one local, non-Firebase code path.

**Verified:** 2026-08-01
**Status:** RESOLVED 2026-08-01 — the sole gap (D-14's real speaker icon) is now delivered. Original finding preserved below unchanged; see the amendment at the foot of the file. Everything else that is
code-checkable is genuinely done; everything audible/visual beyond what you already drove live remains
correctly flagged as outstanding, not overclaimed.
**Re-verification:** No — initial verification.

## Summary Judgment

This phase is **substantially real, not a facade.** I read every line of `src/shared/audio.js`, the
three call sites (`liveRender()`, `watchEvents()`, both `liveDone` sites), the timer-toggle refactor
(`applyTimerOff`, `toggleTimer`, `watchTimer`, `beginGame`'s seed), the mute button's markup/CSS/click
binding/render block, the Credits modal clause, and the copy-inventory entry — and ran the automated
gates myself rather than trusting the SUMMARY.md narration of them. Everything the summaries claim as
machine-verified genuinely is. The one thing I will not let slide: **D-14 (the real speaker icon) is
not built.** It is honestly disclosed as blocked-on-Wyatt in 21-05-SUMMARY.md and does not undermine
AUDIO-02's functional delivery (the button itself is real and works), but it is a genuine gap against
one of the 22 locked decisions and the phase cannot be called fully complete while it's outstanding.

## The 22 Decisions — Verified Against Code, Not Summaries

| # | Decision | Status | Evidence |
|---|---|---|---|
| D-01 | Six sounds ship with natural mapping | ✓ VERIFIED | `EVENT_SOUND` in `src/shared/audio.js:72-91`; `audio_mapping_test.js` asserts every non-null value is a member of `SFX_FILES` |
| D-02 | `coin-flip.mp3` on every flip | ✓ VERIFIED | `src/ui/board.js:872` — `playFlip()` called in `setFlipCoin()`'s `"spin"` branch, the single choke point for all flips (battle, dock, fish, host, guest) |
| D-03 | `fishing.mp3` on anchor-in-storm | ✓ VERIFIED | `EVENT_SOUND.anchor = "fishing"`, confirmed in code and by mapping test |
| D-04 | Borrow table (windmove/trade/aground/shipwrecked/battleflee/dodge) | ✓ VERIFIED | All 6 borrow mappings present in `EVENT_SOUND`, matching CONTEXT's table exactly |
| D-05 | Win screen gets an explicit placeholder cue | ✓ VERIFIED | `WIN_SOUND_PLACEHOLDER = "store-ingredient"` with an "EXPLICIT PLACEHOLDER — not a final choice" comment (`audio.js:62-66`); `playWinScreen()` wired at both `liveDone=true` sites (`src/orchestrator.js:725` and `:895`, confirmed by grep, exactly 2 call sites) |
| D-06 | 8 named moments stay silent | ✓ VERIFIED | `blocked, moored, turn, newround, tradewind, bakeoff, end, finish` all explicit `null` in `EVENT_SOUND` |
| D-07 | Whole table audible, no per-seat gate | ✓ VERIFIED | Grepped `src/shared/audio.js` for `isLocalTo`/`mySeat` — zero hits outside a comment stating the prohibition; `playForEvent` called at both `liveRender()` (host) and `watchEvents()` (guest) with no seat gate at either call site; `module_graph_check.js` independently confirms "ui does NOT import net (D-07)" |
| D-08 | Storm fires once per round, not per captain | ✓ VERIFIED (structurally + red-proofed) | `soundForEvent()` keys the storm cue on the `(e.t==="newround", e.storm)` pair, not `e.storm` alone — the exact trap CONTEXT calls out. 21-02-SUMMARY.md documents an actual red-proof (reverted the key to `e.storm` alone, watched 25 assertions fail, reverted back, confirmed byte-identical via diff) — I did not re-run the red-proof myself but the pure-function logic is directly inspectable and correct, and `audio_mapping_test.js` currently passes all 25 storm-stamp-guard assertions live under my own `npm test` run |
| D-09 | Storm fades, never hard-cuts, never drones | ✓ VERIFIED (code); ⚠️ audible smoothness unverified | `fadeStorm()` (`audio.js:224-239`) anchors the ramp at current gain, ramps to `0.0001` (never literal 0) over `STORM_FADE_SEC=1.2`, then stops the source — never a hard `stop()` without the ramp. Triggered on the next `newround`/`end`. The *mechanism* is correct; whether it *sounds* smooth is unverified (Row 3, human_verification) |
| D-10 | Repeats layer, never cut off or dropped | ✓ VERIFIED | `play()` (`audio.js:202-212`) creates a fresh `AudioBufferSourceNode` + fresh `GainNode` on every call — never reuses or restarts a node, never checks "already playing." This is correct by construction, not merely by claim |
| D-11 | Storm quieter underneath, short sounds uncapped | ✓ VERIFIED | `STORM_VOLUME = 0.35` (in `(0,1)`, asserted by `audio_mapping_test.js`); `stormGain` is a separate bus from `masterGain` for short sounds, with no cap anywhere in `play()` |
| D-12 | Tab-blur goes quiet, resumes on focus | ✓ VERIFIED (code) | `applyMasterGain()` targets `0` when `document.hidden`; `visibilitychange` handler calls `ctx.resume().catch(()=>{})` (required for iOS Safari's interrupted-state) then `applyMasterGain()`. Structurally sound; audible confirmation is Row 6 |
| D-13 | Mute remembered per browser | ✓ VERIFIED | `pp_muted` follows `pp_timerOff`'s exact try/catch, `"1"`/`"0"` idiom (`isMuted`/`setMuted`, `audio.js:121-144`); `grep -rn "pp_muted" src/` shows it touched only inside `src/shared/audio.js` — never Firebase, never `net*`, never `appState` |
| D-14 | New speaker icon, slash overlay when muted | ✓ **DELIVERED 2026-08-01** (was ✗ at time of audit) | `assets/icons/speaker.png` does not exist. `#btnMute` still renders the 🔊/🔇 emoji scaffold. Correctly, honestly documented as blocked-on-Wyatt (art runbook is gitignored, interactive, needs his live session) — but genuinely not built. See Gaps. |
| D-15 | Mute button visible beside clock, every mode, whole game | ✓ VERIFIED (code) + confirmed live by you in solo | `setClockUI()`'s mute block keys `display` only on `appState.liveDone` — no mode gate anywhere; `#btnMute` is a `#controlsRow` sibling in `index.html:1082`. You've already confirmed this live in solo. |
| D-16 | Disappears at win screen, mute state still holds | ✓ VERIFIED (code) | The mute render block (`panel.js:61-69`) sits *above* the `liveDone` early-return, so it hides in the same tick as `#shotClockPanel`. Critically, `isMuted()` reads `mutedCache`/`localStorage` — entirely independent of the button's DOM state — so a muted player structurally stays muted through the celebration even with the control gone. Not yet observed live at an actual end-of-voyage screen (Row 5) |
| D-17 | Timer off stops immediately | ✓ VERIFIED (code) | `applyTimerOff(off)` (`src/ui/util.js:1289-1306`) — `if(appState.isHost&&appState.timerOff)stopShotClock();` unconditionally on the off branch |
| D-18 | Timer on re-arms mid-turn, identical across modes | ✓ VERIFIED (code, not yet behaviorally proven) | The re-arm branch (`was&&!appState.timerOff&&appState.shotClockSeat==null&&!appState.turnExpired` → `rearmShotClock`) is the **exact body** moved from `watchTimer()`'s prior BUG-02-fixed callback, verbatim — confirmed by direct reading, not by trusting the SUMMARY's diff-review claim. `toggleTimer()` now routes to it for both the `db&&room` and local branches, so one body serves all three modes. This is the phase's highest-reversibility-cost item (a game-freezing regression, per CONTEXT) and the plan itself says only a live full-turn-both-ways play session proves it. **Genuinely not run this session** — flagged as the single most load-bearing item in human_verification |
| D-19 | Timer setting remembered per browser, every mode | ✓ VERIFIED (code) | `toggleTimer()` now writes `pp_timerOff` unconditionally before either branch (`src/orchestrator.js:173`, previously unreachable in solo/pass-and-play because it sat after the early-return bug); `beginGame()` reads it back unconditionally at `:1283-1284`, guarded only by `!appState.replaying` |
| D-20 | No mode shows a greyed toggle | ✓ VERIFIED — you confirmed this live | `#scTimerToggle`'s display expression (`panel.js:106`) keys only on `appState.liveDone`; `soloBotGame()` mode gate is gone, confirmed absent from that line by direct read. You've already driven this live and confirmed the toggle is visible and functional in solo. |
| D-21 | 6 additional UI-tier events get explicit dispositions | ✓ VERIFIED | `blownOut→ship-move`, `anchorHold→fishing`, `parley→null`, `sidebet→null`, `shotclock/shotclockskip→SHOTCLOCK_SOUND_PLACEHOLDER` — all present exactly as CONTEXT's table specifies |
| D-22 | Shot-clock expiry makes a noise, explicit placeholder | ✓ VERIFIED | `SHOTCLOCK_SOUND_PLACEHOLDER = "battle-swords"` with an "EXPLICIT PLACEHOLDER" comment (`audio.js:55-60`); referenced by constant (not inlined) in `EVENT_SOUND`, asserted by `audio_mapping_test.js`'s strict-equality check |

**Score: 21/22 decisions structurally verified in code (D-14 not delivered). Of the 21, 2 (D-15, D-20)
are additionally confirmed live by you; the remaining 19 are code-correct but their audible/visual
manifestation is not yet confirmed by anyone (see Human Verification).**

## The Two Placeholders — Cannot Be Mistaken for Final Choices

Both are unambiguously marked, not just in the SUMMARY but in the code itself:

```js
// D-22 EXPLICIT PLACEHOLDER — not a final choice. ...
const SHOTCLOCK_SOUND_PLACEHOLDER = "battle-swords";
// D-05 EXPLICIT PLACEHOLDER — not a final choice. ...
const WIN_SOUND_PLACEHOLDER = "store-ingredient";
```

`EVENT_SOUND.shotclock`/`.shotclockskip` reference the constant rather than repeating the stem string
(verified: `EVENT_SOUND.shotclock === SHOTCLOCK_SOUND_PLACEHOLDER`), so a later edit cannot quietly
de-flag either placeholder by inlining it. `21-05-SUMMARY.md`'s "Known Stubs" section also names both
by name and by constant. This requirement is fully met.

## The Hard Fences — Verified Directly, Not Trusted

- **`src/engine/index.js` untouched:** `git diff --stat main -- src/engine/index.js` — empty, run by
  me directly against the current worktree HEAD, not copied from a SUMMARY claim.
- **No `src/ui/*` file imports `src/orchestrator.js`:** `node scripts/module_graph_check.js` — I ran
  it myself; output includes `PASS ui -> shared/engine/state (no ui -> main)`, an automated,
  independent confirmation, plus a manual grep across `src/ui/` turned up zero import statements
  referencing `orchestrator.js` (only comments explaining *why* it can't be imported).
- **Full `npm test` (20-script suite, including the determinism gate):** I ran it myself — exit 0, 0
  failing checks, including `scripts/audio_mapping_test.js`'s full battery (37 storm-stamp-guard
  assertions, 25 per-key dispatch checks, both placeholder checks, both numeric ranges).

Both fences hold. This is not a case where the summaries said "npm test is green" and I took their
word for it — I ran the commands myself in this session.

## Requirements Coverage

| Requirement | Status | Evidence |
|---|---|---|
| AUDIO-01 | Code-complete, audibly unverified | 25-key mapping, storm dedup/fade, borrow table, both placeholders all present and correctly wired. Coin-flip audibility already confirmed live by you. Sail/dock/fish/trade/battle/bot-audibility/storm/win-screen sounds not yet confirmed by anyone. |
| AUDIO-02 | Functionally delivered; D-14 art outstanding | Mute button exists, is wired, persists, and is confirmed working live by you in solo. The purpose-drawn speaker icon (D-14) is not built — see Gaps. |
| AUDIO-03 | Code-complete, copy unreviewed | Luis's sound credit is one clause on his existing sentence, one link, confirmed by direct grep of `#creditsModal`. Wyatt's formal disposition on the clause's wording is still "not yet reviewed" in the copy-inventory file. |
| FIX-02/N-03 | Code-complete; the one load-bearing behavioral check outstanding | `toggleTimer()`'s early-return bug is gone; solo and pass-and-play now reach `applyTimerOff()` locally with the exact re-arm body multiplayer already proved. You've confirmed the toggle is visible and switches state in solo live. The D-18 full-turn-both-ways check across all three modes — the only thing that would catch a re-arm regression — has not been run by anyone yet. |

## Anti-Patterns Scan

No `TBD`/`FIXME`/`XXX`/`HACK` markers found in any file this phase touched
(`src/shared/audio.js`, `src/ui/panel.js`, `src/ui/board.js`, `src/orchestrator.js`, `src/ui/util.js`,
`index.html`). Both placeholders use the required explicit-flagging pattern rather than a bare `TODO`.
No stub return patterns (`return null`/`return {}`/empty handlers) found on the sound or timer paths.

## Human Verification Required

See the `human_verification` list in the frontmatter (11 rows, mirroring 21-05-SUMMARY.md's own
matrix). Two are load-bearing above all others:

1. **Row 7 — the D-18 full-turn both-ways timer check, in solo, pass-and-play AND multiplayer.** This
   is the only check that would catch a re-arm regression (the exact class of bug BUG-02 already was).
   Code review is strong evidence the fix is structurally sound, but this project's own reversibility
   rating on D-18 calls the failure mode "costly" and says explicitly it is "found only by playing a
   full turn with the toggle flipped both ways." Not run by anyone yet.
2. **Row 9 — Safari under a forced storm.** BUG-01 was a Safari storm-overlay near-crash. A storm
   sound has never been layered over that overlay in Safari before. Genuinely untested territory.

## Gaps Summary

One genuine gap: **D-14, the real speaker icon, is not built.** `assets/icons/speaker.png` does not
exist; `#btnMute` ships with the 🔊/🔇 emoji scaffold from 21-04 rather than the purpose-drawn icon
with the blocked-slash overlay CONTEXT.md calls for. This was correctly, transparently halted by
21-05-PLAN.md's own precondition rather than substituted with a borrowed icon or faked — the plan
explicitly says "do not substitute a borrowed icon" and the executor obeyed that. It does not break
AUDIO-02 functionally (the button works, confirmed live by you), but it is one of the 22 locked
decisions and the phase's own `<done>` criterion for 21-05 Task 1 ("The mute button shows a
purpose-drawn speaker, slashed when muted, approved by Wyatt") is not met. The fix is fully specified
and ready to execute the moment you supply the art runbook or confirm the abbreviated version from
your own memory — no replanning needed, just a follow-up session.

Everything else that could be verified without ears or eyes on a running game has been verified
directly against the code by me in this session, not inferred from the summaries' narration of it.
The summaries do not overclaim anywhere I checked — every human_judgment:true item across all five
SUMMARY.md files is marked `status: outstanding` or `status: not-reached`, never `pass`, and the
"Outstanding — Requires a Human" sections in each summary consistently and accurately describe what
was and was not run.

---

_Verified: 2026-08-01_
_Verifier: Claude (gsd-verifier)_


---

## Amendment — 2026-08-01: D-14 closed

The single gap this audit found is resolved. Wyatt drew the artwork himself and supplied it at
`art-review/icons-sound/` (`sound-on.png` / `sound-off.png`).

**What shipped:** `assets/icons/sound-on.png` (167x128) and `assets/icons/sound-off.png` (173x128) —
a gold megaphone with teal sound waves for unmuted, the same megaphone with a red X for muted.
Wired through `SOUND_ON_IMG` / `SOUND_OFF_IMG` in `src/shared/index.js` and rendered by
`setClockUI()`'s `#btnMute` block. Commit `ec12892`.

**Deviation from D-14 as written, and it is an improvement.** D-14 specified "a new speaker icon,
shown with `blocked-slash.png` over it when muted — mirroring exactly how the timer toggle shows its
on/off states". Wyatt supplied **two fully drawn states** instead. That is better than the pattern it
was mirroring: the timer toggle swaps to a *bare* `blocked-slash.png`, which says "off" without
saying off *what*. A drawn red X on the megaphone reads correctly at the button's 30px render size.
`blocked-slash.png` is untouched and still serves the timer toggle.

**Asset prep performed before install** (the source art was not drop-in ready):
- The Gemini sparkle watermark was erased. It occupies 1760–1852 on both axes; the artwork ends at
  y=1656, so the cut had ~100px of clearance and could not clip the art.
- The near-black background was opaque (alpha 255 throughout), not transparent. Knocked out by
  flood-filling from the image borders rather than thresholding on brightness — a brightness
  threshold would have made the dark teal outline around the megaphone semi-transparent.
- Trimmed to content and resized to the project's 128px icon height.

**A latent layout bug surfaced and was fixed in the same commit.** `#btnMute img` carried
`width: 60%; height: 60%`. On a `flex: 0 0 auto` button — which is sized by its content — a
percentage on that content is circular. Text resolved it harmlessly via `font-size`, so the emoji
scaffold never exposed it; a 167x128 `<img>` resolved it with its intrinsic size and expanded the
button from 49x43 to **200x101**, wider than the clock panel beside it. Changed to `1.5em`, which
keeps the icon tied to the button's own `clamp()`ed font-size so the narrow-viewport bump still
applies. **This was caught by looking at the rendered page, not by the test suite** — no gate in
this project asserts layout, and none of the 20 scripts went red.

**Verified in Chrome on a fresh port** (module cache): 61x53 button, 30x30 icon, byte-identical
geometry in both states so the button does not jump on toggle, no overlap with `#scPause` or
`#scTimerToggle`, page overflow unchanged at its pre-existing 5px. `npm test` 20 scripts green.

**Still outstanding, unchanged by this amendment:** the audible checks, and this icon's appearance
in Safari specifically.
