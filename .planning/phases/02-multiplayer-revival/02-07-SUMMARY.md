---
phase: 02-multiplayer-revival
plan: 07
completed: 2026-08-19
tasks_completed: 3
gate: passed-with-findings
---

# 02-07 — The findings, the one drop, and Wyatt's voyage

**Outcome: the phase gate was played, it found seven faults, three were real defects, all three
were fixed and re-dropped, and the remainder became Phase 02.1 by Wyatt's own decision.**

## Task 1 — `02-FINDINGS.md`

Written and committed (`6d27615`). Leads with the `remotePrompt` timeout gap, which Wyatt ruled
*"write it down, don't fix it"* — carrying Phase 1's D-03 and Phase 4's MP-13 reasoning so the
argument is not reopened. Answers the three ROADMAP-named questions, records the corrected escaping
fact (`escHtml`, not the `esc()` both CONTEXT.md and RESEARCH.md claimed), and names the gamelog tag
`CLAUDE-PROBE-02-06` so the shakeout's one permanent row can be filtered forever.

## Task 2 — the one drop

`PP4_STAMP` bumped to `2026-08-19a` (`7650f76`), diff proven to touch only `4/` and `.planning/`,
pushed, sync verified zero both ways.

## Task 3 — the human gate. This is the part that matters.

Wyatt played it and **found seven faults in about twenty minutes, every one visible on the first
screen.** The headless shakeout (02-06) had passed the same build green.

**Why green and broken coexisted — the phase's most important lesson.** 02-06 checked ship
positions, turn order, event indices and dubloon counts. Every check passed honestly. **None of them
looked at what was drawn.** A guest prompt rendering as a flat card instead of the radial bloom, a
chat heading stranded behind the ribbon, an undimmed board and a narration line that never held all
sailed straight through. The checks were not wrong; they were measuring a different thing than the
one that was broken, and a passing suite made that invisible. This is now **CLAUDE.md rule 19**
(`cf9e7a1`): look at it in the browser, with screenshots, before handing it to him.

### Seven reports, three defects — all fixed in `cb70ab2`, dropped as `2026-08-19b` (`bab96fb`)

1. **A captain name over 18 characters killed the join.** The live RTDB rule caps
   `seats/$seat/name` at 18; the boxes accepted 40, so every name from 19 to 40 was a crash a player
   could type. Already recorded as a known finding and deliberately deferred — his ruling that
   morning (*"fix what breaks a voyage"*) promoted it. `MAX_NAME_LEN` now governs every site.

2. **The host painted every narration line twice in a crew game, and the second paint ate the first
   one's hold.** One identifier: `onBroadcast` (broadcasts *and* repaints this screen) where it
   wanted `onNetBroadcast` (broadcasts without touching this screen). Measured: the same line held
   **2701ms in solo and 1ms in a crew game**. That 1ms was two of his reports — the pass narration
   "blitzed past by the bots" (the turn loop awaited a hold that had already ended) and "the final
   coin image didn't load" (it loaded and painted, then was blanked 1ms later). **Both his preload
   theory and mine were wrong** — `preloadAssets()` is reached on the join path and all five flip
   images complete by ~245ms. Verified after: 141 lines, median 3001ms; red-proofed back to 0.9ms.

3. **The guest's prompt payload dropped two fields the local path uses.** `stage` (so the guest got
   a pill where the host got the dimmed centre-stage card) and `short` (so prompts fell out of the
   radial bloom into a flat card). Both added to the singular and draft channels.

### What did NOT reproduce, and why that matters

The stranded "Scuttlebutt" heading and the stuck "crew draws lots" card **never reproduced** across
three driven Chrome runs with per-frame recording. Wyatt reloaded and the heading was gone: the
signature of **Safari serving a cached `index.html` against a fresh `stage.js`** — the build stamp
read correctly because the stamp lives in the fresh file. A scoped CSS seatbelt was added anyway,
since `body.pp4Stage` never hides the classic layout wholesale and there is a real ~80ms window on a
guest before the re-parent.

### Left open, deliberately, and not claimed as fixed

- **The doubled flip sound.** Nine flips, nine sounds across two investigations; four plausible
  causes ruled out with evidence. Nothing was changed for it. Wyatt kept this OUT of Phase 02.1.
- **A second cause of the flat card**, hitting host and guest alike: a greyed button's `why`
  sentence containing a coin breaks its own label out of its quote marks and inflates it past the
  16-character radial cutoff. Folded into Phase 02.1 at his direction.
- **Everything was verified in Chrome.** He plays Safari; `safaridriver` cannot run headless and a
  visible window would take over the machine he is working on. Also folded into 02.1.

## Why the phase closes here rather than on a clean voyage

**Wyatt's decision, 2026-08-19, asked explicitly and answered explicitly:** Phase 2 closes and the
remaining guest-side faults become a new phase. His reasoning, in his own words on reading the
fixes:

> *"I don't understand why your architecture is treating the host and the guest differently across
> the board. There should be one architecture that displays things for every player regardless of
> whether there's a host or a guest... the only thing that needs to be distinct is something quite
> invisible on the back end and just the starting flow where someone makes a game."*

He is right, and the code already admitted it — `4/src/orchestrator.js:1263` describes the guest's
button renderer as "a genuine second copy… so a change to one that skips the other reintroduces the
bug on whichever side was forgotten." Every field on that wire (`disabled`, `why`, `back`,
`flipIdx`, and now `stage` and `shorts`) was added only after somebody noticed the guest was missing
one. **This plan added the sixth and seventh. That is the pattern, not the cure.**

The deeper cause, confirmed in code rather than inferred: **every renderer reads `appState.game`
directly.** On the host that is live truth; on a guest it is a stale render shell, because a guest
does not simulate the game — it renders the state snapshot carried on each broadcast event
(`docs/DRIVING-THE-GAME.md` §5c, re-verified today). `ribbonTick()` reads `g.round`, which is why
the guest's day counter sticks on DAY 1; the director reads `game.players[mySeat].pos`, which is why
it cannot centre a guest's own boat and strands the radial buttons at the bottom of the screen.

**Phase 2 delivered what it was scoped to deliver**: Firebase restored, Host/Join back, three
never-run crashes closed, the skip gate held, chat given a home, the narration timing fixed. The
guest-side rot is older than this phase and was merely revealed by it. It is Phase 02.1.

## Verification

- Build `2026-08-19b` live at `playpastrypirates.com/4`; sync verified zero both ways.
- Diff proven to touch only `4/`; the repo-root game (real players) never moved; no site-identity
  file touched.
- Host and guest Ahoy screenshots compared directly and found identical (same scrim, same 367px
  card, same button).
- Zero headless Chrome and zero local servers left running.
